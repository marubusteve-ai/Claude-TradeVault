import { TradingAccount, Trade, ComplianceEvaluator, type ComplianceReport } from "@trading-os/domain";
import { GetPerformanceSummaryUseCase } from "@trading-os/application";
import { groupTradesBy, type BasicMetrics, type StreakResult } from "@trading-os/analytics-engine";
import type { TradingAccountRecord, TradeRecord } from "@trading-os/shared-types";
import { accountRepository, tradeRepository, ruleSetRepository } from "@/lib/repositories";

export interface PerformanceReportData {
  account: TradingAccountRecord;
  metrics: BasicMetrics;
  streaks: StreakResult;
  byStrategy: { key: string; metrics: BasicMetrics; tradeCount: number }[];
  byInstrument: { key: string; metrics: BasicMetrics; tradeCount: number }[];
  currentBalance: number;
  netPnL: number;
  maxDrawdownPct: number;
  generatedAt: string;
}

export async function getPerformanceReportData(accountId: string): Promise<PerformanceReportData> {
  const accountRecord = await accountRepository.findById(accountId);
  if (!accountRecord) throw new Error(`Account ${accountId} not found`);

  const account = TradingAccount.fromRecord(accountRecord);
  const tradeRecords = await tradeRepository.findByAccount(accountId, { status: "closed" });
  const trades = tradeRecords.map(Trade.fromRecord);

  const { metrics, streaks } = await new GetPerformanceSummaryUseCase({ tradeRepository }).execute(accountId);

  const metricInputs = trades.map((t) => ({
    netPnL: t.netPnL?.toMajor() ?? 0,
    rMultiple: t.rMultipleAchieved,
    isWinner: t.isWinner,
    isClosed: true,
    key: "",
  }));

  const byStrategy = groupTradesBy(
    tradeRecords.map((r, i) => ({ ...metricInputs[i]!, key: r.strategyId ?? "Unassigned" })),
    (t) => t.key
  );
  const byInstrument = groupTradesBy(
    tradeRecords.map((r, i) => ({ ...metricInputs[i]!, key: r.instrument })),
    (t) => t.key
  );

  return {
    account: accountRecord,
    metrics,
    streaks,
    byStrategy,
    byInstrument,
    currentBalance: account.currentBalance(trades).toMajor(),
    netPnL: account.netPnL(trades).toMajor(),
    maxDrawdownPct: account.maxDrawdown(trades).percentage,
    generatedAt: new Date().toISOString(),
  };
}

export interface ComplianceReportData {
  account: TradingAccountRecord;
  report: ComplianceReport;
  ruleSetName: string;
  generatedAt: string;
}

export async function getComplianceReportData(accountId: string): Promise<ComplianceReportData> {
  const accountRecord = await accountRepository.findById(accountId);
  if (!accountRecord) throw new Error(`Account ${accountId} not found`);
  if (!accountRecord.ruleSetId) throw new Error(`Account ${accountId} has no rule set configured`);

  const ruleSet = await ruleSetRepository.findById(accountRecord.ruleSetId);
  if (!ruleSet) throw new Error(`Rule set ${accountRecord.ruleSetId} not found`);

  const account = TradingAccount.fromRecord(accountRecord);
  const tradeRecords = await tradeRepository.findByAccount(accountId);
  const trades = tradeRecords.map(Trade.fromRecord);
  const report = new ComplianceEvaluator().evaluate(account, ruleSet, trades);

  return { account: accountRecord, report, ruleSetName: ruleSet.name, generatedAt: new Date().toISOString() };
}

export interface TaxSummaryRow {
  quarter: string;
  realizedGains: number;
  realizedLosses: number;
  netRealized: number;
  tradeCount: number;
}

export async function getTaxSummaryData(accountId: string, year: number): Promise<TaxSummaryRow[]> {
  const tradeRecords = await tradeRepository.findByAccount(accountId, { status: "closed" });
  const trades = tradeRecords.map(Trade.fromRecord).filter((t) => t.exitTime?.startsWith(String(year)));

  const byQuarter = new Map<string, TaxSummaryRow>();
  for (const trade of trades) {
    const month = new Date(trade.exitTime!).getUTCMonth();
    const quarter = `Q${Math.floor(month / 3) + 1}`;
    const row = byQuarter.get(quarter) ?? { quarter, realizedGains: 0, realizedLosses: 0, netRealized: 0, tradeCount: 0 };
    const pnl = trade.netPnL?.toMajor() ?? 0;
    if (pnl >= 0) row.realizedGains += pnl;
    else row.realizedLosses += pnl;
    row.netRealized += pnl;
    row.tradeCount += 1;
    byQuarter.set(quarter, row);
  }

  return ["Q1", "Q2", "Q3", "Q4"].map(
    (q) => byQuarter.get(q) ?? { quarter: q, realizedGains: 0, realizedLosses: 0, netRealized: 0, tradeCount: 0 }
  );
}

export async function getTradeHistoryData(accountId: string): Promise<TradeRecord[]> {
  return tradeRepository.findByAccount(accountId);
}
