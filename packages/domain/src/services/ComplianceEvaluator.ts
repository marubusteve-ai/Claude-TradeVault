import type { Trade } from "../entities/Trade";
import type { TradingAccount } from "../entities/TradingAccount";
import type { PropFirmRuleSetRecord } from "@trading-os/shared-types";

export type RuleCheckStatus = "pass" | "warning" | "breach" | "not_applicable";

export interface RuleCheckResult {
  ruleId: string;
  label: string;
  status: RuleCheckStatus;
  currentValue: number;
  limitValue: number | null;
  detail: string;
}

export interface ComplianceReport {
  accountId: string;
  evaluatedAt: string;
  overallStatus: "compliant" | "warning" | "breached";
  checks: RuleCheckResult[];
}

const WARNING_THRESHOLD_RATIO = 0.8;

function startOfIsoWeek(date: Date): Date {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay(); // 0 = Sunday .. 6 = Saturday
  const diff = (day === 0 ? -6 : 1) - day; // shift back to Monday
  d.setUTCDate(d.getUTCDate() + diff);
  return d;
}

function startOfMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

/**
 * Evaluates a trading account against a fully configurable prop-firm rule
 * set. Rule sets are data, not code — supporting a new firm, or a custom
 * mix of rules, requires creating a PropFirmRuleSetRecord through settings,
 * never a code change or deployment. This is the single engine behind the
 * Prop Firm Integration dashboard, the account health badge, and the
 * automated rule-violation alerts.
 */
export class ComplianceEvaluator {
  evaluate(account: TradingAccount, ruleSet: PropFirmRuleSetRecord, trades: Trade[]): ComplianceReport {
    const checks = [
      this.checkDailyLoss(account, ruleSet, trades),
      this.checkWeeklyLoss(account, ruleSet, trades),
      this.checkMonthlyLoss(account, ruleSet, trades),
      this.checkMaxDrawdown(account, ruleSet, trades),
      this.checkProfitTarget(account, ruleSet, trades),
      this.checkMinTradingDays(ruleSet, trades),
      this.checkConsistencyRule(ruleSet, trades),
    ].filter((c): c is RuleCheckResult => c !== null);

    const overallStatus = checks.some((c) => c.status === "breach")
      ? "breached"
      : checks.some((c) => c.status === "warning")
        ? "warning"
        : "compliant";

    return { accountId: account.id, evaluatedAt: new Date().toISOString(), overallStatus, checks };
  }

  /**
   * A single 0-100 signal blending profit-target progress, minimum-trading-day
   * completion, and headroom remaining on the risk limits (daily loss, max
   * drawdown, consistency) — "how close is this account to being funded, and
   * how much margin for error is left." Derived entirely from the checks
   * already computed by evaluate(); an active breach always scores 0.
   */
  calculateFundingReadinessScore(report: ComplianceReport): number {
    if (report.overallStatus === "breached") return 0;

    const byId = new Map(report.checks.map((c) => [c.ruleId, c]));
    const progressOf = (check: RuleCheckResult | undefined) =>
      check?.limitValue ? Math.min(1, Math.max(0, check.currentValue / check.limitValue)) : 1;
    const headroomOf = (check: RuleCheckResult | undefined) => (check?.limitValue ? 1 - progressOf(check) : 1);

    const profitProgress = progressOf(byId.get("profit_target"));
    const daysProgress = progressOf(byId.get("min_trading_days"));
    const riskHeadroom = (headroomOf(byId.get("daily_loss_limit")) + headroomOf(byId.get("max_drawdown"))) / 2;
    const consistencyHeadroom = headroomOf(byId.get("consistency_rule"));

    const weighted = profitProgress * 0.4 + daysProgress * 0.15 + riskHeadroom * 0.3 + consistencyHeadroom * 0.15;
    const warningPenalty = report.overallStatus === "warning" ? 0.85 : 1;

    return Math.round(weighted * 100 * warningPenalty);
  }

  private checkDailyLoss(account: TradingAccount, ruleSet: PropFirmRuleSetRecord, trades: Trade[]): RuleCheckResult | null {
    if (!ruleSet.dailyLossLimit) return null;
    const { type, value } = ruleSet.dailyLossLimit;
    const today = new Date().toISOString().slice(0, 10);
    const todaysPnL = trades
      .filter((t) => t.status === "closed" && t.exitTime?.slice(0, 10) === today)
      .reduce((sum, t) => sum + (t.netPnL?.toMajor() ?? 0), 0);

    const basisAmount = account.startingBalance.toMajor();
    const limitAmount = type === "percentage" ? (value / 100) * basisAmount : value;
    const lossToday = Math.max(0, -todaysPnL);
    const ratio = limitAmount > 0 ? lossToday / limitAmount : 0;

    return {
      ruleId: "daily_loss_limit",
      label: "Daily Loss Limit",
      status: ratio >= 1 ? "breach" : ratio >= WARNING_THRESHOLD_RATIO ? "warning" : "pass",
      currentValue: lossToday,
      limitValue: limitAmount,
      detail: `Today's loss $${lossToday.toFixed(2)} of $${limitAmount.toFixed(2)} limit`,
    };
  }

  private checkWeeklyLoss(account: TradingAccount, ruleSet: PropFirmRuleSetRecord, trades: Trade[]): RuleCheckResult | null {
    if (!ruleSet.weeklyLossLimit) return null;
    const { type, value } = ruleSet.weeklyLossLimit;
    const weekStart = startOfIsoWeek(new Date());
    const weekPnL = trades
      .filter((t) => t.status === "closed" && t.exitTime && new Date(t.exitTime) >= weekStart)
      .reduce((sum, t) => sum + (t.netPnL?.toMajor() ?? 0), 0);

    const basisAmount = account.startingBalance.toMajor();
    const limitAmount = type === "percentage" ? (value / 100) * basisAmount : value;
    const lossThisWeek = Math.max(0, -weekPnL);
    const ratio = limitAmount > 0 ? lossThisWeek / limitAmount : 0;

    return {
      ruleId: "weekly_loss_limit",
      label: "Weekly Loss Limit",
      status: ratio >= 1 ? "breach" : ratio >= WARNING_THRESHOLD_RATIO ? "warning" : "pass",
      currentValue: lossThisWeek,
      limitValue: limitAmount,
      detail: `This week's loss $${lossThisWeek.toFixed(2)} of $${limitAmount.toFixed(2)} limit`,
    };
  }

  private checkMonthlyLoss(account: TradingAccount, ruleSet: PropFirmRuleSetRecord, trades: Trade[]): RuleCheckResult | null {
    if (!ruleSet.monthlyLossLimit) return null;
    const { type, value } = ruleSet.monthlyLossLimit;
    const monthStart = startOfMonth(new Date());
    const monthPnL = trades
      .filter((t) => t.status === "closed" && t.exitTime && new Date(t.exitTime) >= monthStart)
      .reduce((sum, t) => sum + (t.netPnL?.toMajor() ?? 0), 0);

    const basisAmount = account.startingBalance.toMajor();
    const limitAmount = type === "percentage" ? (value / 100) * basisAmount : value;
    const lossThisMonth = Math.max(0, -monthPnL);
    const ratio = limitAmount > 0 ? lossThisMonth / limitAmount : 0;

    return {
      ruleId: "monthly_loss_limit",
      label: "Monthly Loss Limit",
      status: ratio >= 1 ? "breach" : ratio >= WARNING_THRESHOLD_RATIO ? "warning" : "pass",
      currentValue: lossThisMonth,
      limitValue: limitAmount,
      detail: `This month's loss $${lossThisMonth.toFixed(2)} of $${limitAmount.toFixed(2)} limit`,
    };
  }

  private checkMaxDrawdown(account: TradingAccount, ruleSet: PropFirmRuleSetRecord, trades: Trade[]): RuleCheckResult | null {
    if (!ruleSet.maxDrawdown) return null;
    const { type, value, drawdownType } = ruleSet.maxDrawdown;
    const basisAmount = account.startingBalance.toMajor();
    const limitAmount = type === "percentage" ? (value / 100) * basisAmount : value;

    let currentAmount: number;
    if (drawdownType === "trailing") {
      currentAmount = account.currentDrawdown(trades).amount.toMajor();
    } else {
      // Static (and trailing_to_initial once the target is reached) is measured from the initial balance, not the running peak.
      const current = account.currentBalance(trades).toMajor();
      currentAmount = Math.max(0, basisAmount - current);
    }

    const ratio = limitAmount > 0 ? currentAmount / limitAmount : 0;
    return {
      ruleId: "max_drawdown",
      label: drawdownType === "trailing" ? "Trailing Max Drawdown" : "Static Max Drawdown",
      status: ratio >= 1 ? "breach" : ratio >= WARNING_THRESHOLD_RATIO ? "warning" : "pass",
      currentValue: currentAmount,
      limitValue: limitAmount,
      detail: `Drawdown $${currentAmount.toFixed(2)} of $${limitAmount.toFixed(2)} limit`,
    };
  }

  private checkProfitTarget(account: TradingAccount, ruleSet: PropFirmRuleSetRecord, trades: Trade[]): RuleCheckResult | null {
    if (!ruleSet.profitTarget) return null;
    const { type, value } = ruleSet.profitTarget;
    const basisAmount = account.startingBalance.toMajor();
    const targetAmount = type === "percentage" ? (value / 100) * basisAmount : value;
    const currentProfit = account.netPnL(trades).toMajor();
    const ratio = targetAmount > 0 ? currentProfit / targetAmount : 0;

    return {
      ruleId: "profit_target",
      label: "Profit Target",
      status: ratio >= 1 ? "pass" : "not_applicable",
      currentValue: currentProfit,
      limitValue: targetAmount,
      detail: `Progress $${currentProfit.toFixed(2)} of $${targetAmount.toFixed(2)} target (${Math.min(100, Math.max(0, ratio * 100)).toFixed(0)}%)`,
    };
  }

  private checkMinTradingDays(ruleSet: PropFirmRuleSetRecord, trades: Trade[]): RuleCheckResult | null {
    if (ruleSet.minTradingDays == null) return null;
    const uniqueDays = new Set(trades.filter((t) => t.status === "closed" && t.exitTime).map((t) => t.exitTime!.slice(0, 10)));

    return {
      ruleId: "min_trading_days",
      label: "Minimum Trading Days",
      status: uniqueDays.size >= ruleSet.minTradingDays ? "pass" : "not_applicable",
      currentValue: uniqueDays.size,
      limitValue: ruleSet.minTradingDays,
      detail: `${uniqueDays.size} of ${ruleSet.minTradingDays} required trading days`,
    };
  }

  /** Many firms require no single day's profit to exceed a percentage of total profit, to discourage passing on one lucky swing. */
  private checkConsistencyRule(ruleSet: PropFirmRuleSetRecord, trades: Trade[]): RuleCheckResult | null {
    if (!ruleSet.consistencyRule) return null;
    const byDay = new Map<string, number>();
    for (const t of trades) {
      if (t.status !== "closed" || !t.netPnL || !t.exitTime) continue;
      const day = t.exitTime.slice(0, 10);
      byDay.set(day, (byDay.get(day) ?? 0) + t.netPnL.toMajor());
    }

    const totalProfit = [...byDay.values()].reduce((s, v) => s + Math.max(0, v), 0);
    const bestDay = Math.max(0, ...byDay.values());
    const bestDayShare = totalProfit > 0 ? (bestDay / totalProfit) * 100 : 0;
    const limit = ruleSet.consistencyRule.maxSingleDayProfitPercentage;

    return {
      ruleId: "consistency_rule",
      label: "Consistency Rule",
      status: bestDayShare > limit ? "breach" : bestDayShare > limit * 0.85 ? "warning" : "pass",
      currentValue: bestDayShare,
      limitValue: limit,
      detail: `Best single day is ${bestDayShare.toFixed(1)}% of total profit (limit ${limit}%)`,
    };
  }
}
