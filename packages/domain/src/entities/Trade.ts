import { Money, type CurrencyCode } from "../value-objects/Money";
import type { TradeRecord, TradeDirection, TradeStatus } from "@trading-os/shared-types";

/**
 * Trade wraps a validated TradeRecord with the computed business logic that
 * every dashboard, analytics view and report ultimately reads from. Keeping
 * these formulas in one place is what guarantees the KPI card on the
 * Dashboard, the row in the Trade Journal table, and the number in a PDF
 * export can never silently disagree with each other.
 */
export class Trade {
  private constructor(private readonly data: TradeRecord) {}

  static fromRecord(data: TradeRecord): Trade {
    return new Trade(data);
  }

  get id(): string {
    return this.data.id;
  }
  get accountId(): string {
    return this.data.accountId;
  }
  get direction(): TradeDirection {
    return this.data.direction;
  }
  get status(): TradeStatus {
    return this.data.status;
  }
  get instrument(): string {
    return this.data.instrument;
  }
  get exitTime(): string | undefined {
    return this.data.exitTime;
  }

  /** Contract/lot multiplier converting a 1.0 price-unit move into currency terms. Defaults to 1 for simple cash instruments (e.g. spot equities). */
  private get contractMultiplier(): number {
    return this.data.contractMultiplier ?? 1;
  }

  private get currency(): CurrencyCode {
    return this.data.currency ?? "USD";
  }

  /** Raw price-based P&L, before commission, swap, and slippage. Null until both entry and exit prices exist. */
  get grossPnL(): Money | null {
    if (this.data.exitPrice == null || this.data.entryPrice == null) return null;
    const priceDelta =
      this.direction === "long" ? this.data.exitPrice - this.data.entryPrice : this.data.entryPrice - this.data.exitPrice;
    const amount = priceDelta * this.data.quantity * this.contractMultiplier;
    return Money.fromMajor(amount, this.currency);
  }

  /** P&L after commission, swap and slippage costs are deducted — the number that should reconcile with the broker statement. */
  get netPnL(): Money | null {
    const gross = this.grossPnL;
    if (!gross) return null;
    const commission = Money.fromMajor(this.data.commission ?? 0, this.currency);
    const swap = Money.fromMajor(this.data.swap ?? 0, this.currency);
    const slippageCost = Money.fromMajor(this.data.slippageCost ?? 0, this.currency);
    return gross.subtract(commission).subtract(swap).subtract(slippageCost);
  }

  /** Dollar risk implied by the placed stop-loss (or an explicit override) — the denominator for R-multiple math. */
  get initialRiskAmount(): Money | null {
    if (this.data.riskAmount != null) return Money.fromMajor(this.data.riskAmount, this.currency);
    if (this.data.stopLossPrice == null || this.data.entryPrice == null) return null;
    const priceDelta = Math.abs(this.data.entryPrice - this.data.stopLossPrice);
    const amount = priceDelta * this.data.quantity * this.contractMultiplier;
    return Money.fromMajor(amount, this.currency);
  }

  /** Net P&L expressed as a multiple of the initial planned risk (R) — the core unit for expectancy and edge analysis. */
  get rMultipleAchieved(): number | null {
    const risk = this.initialRiskAmount;
    const pnl = this.netPnL;
    if (!risk || risk.isZero || !pnl) return null;
    return pnl.toMajor() / risk.toMajor();
  }

  /** The R-multiple implied by the original plan (first take-profit vs. stop-loss), independent of how the trade actually played out. */
  get rMultiplePlanned(): number | null {
    if (this.data.rMultiplePlannedOverride != null) return this.data.rMultiplePlannedOverride;
    const firstTarget = this.data.takeProfitLevels[0]?.price;
    if (this.data.stopLossPrice == null || firstTarget == null || this.data.entryPrice == null) return null;
    const risk = Math.abs(this.data.entryPrice - this.data.stopLossPrice);
    const reward = Math.abs(firstTarget - this.data.entryPrice);
    if (risk === 0) return null;
    return reward / risk;
  }

  /**
   * Computed win/loss/breakeven signal derived purely from net P&L sign.
   * The record's own `outcome` field (if set) can carry richer states like
   * partial_win/partial_loss that a sign check alone can't express — this
   * getter is the simple, always-available fallback the analytics engine
   * uses for win-rate style aggregation.
   */
  get outcome(): "win" | "loss" | "breakeven" | null {
    const pnl = this.netPnL;
    if (!pnl) return null;
    if (pnl.isZero) return "breakeven";
    return pnl.isPositive ? "win" : "loss";
  }

  get isWinner(): boolean {
    return this.outcome === "win";
  }

  get durationMinutes(): number | null {
    if (!this.data.entryTime || !this.data.exitTime) return null;
    const entry = new Date(this.data.entryTime).getTime();
    const exit = new Date(this.data.exitTime).getTime();
    return Math.round((exit - entry) / 60000);
  }

  /** Fraction of the maximum favourable excursion the trade actually captured. Below ~0.5 typically signals exits left meaningfully early. */
  get exitEfficiency(): number | null {
    const pnl = this.netPnL;
    if (!pnl || !this.data.mfeAmount) return null;
    return pnl.toMajor() / this.data.mfeAmount;
  }

  /** Ratio of favourable to adverse excursion — a high number means the trade found a clean, low-heat path to its outcome. */
  get mfeToMaeRatio(): number | null {
    if (this.data.mfeAmount == null || !this.data.maeAmount) return null;
    return Math.abs(this.data.mfeAmount / this.data.maeAmount);
  }

  toRecord(): TradeRecord {
    return this.data;
  }
}
