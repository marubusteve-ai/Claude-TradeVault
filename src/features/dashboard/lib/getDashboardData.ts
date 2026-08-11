import { Trade, TradingAccount } from "@trading-os/domain";
import { GetPerformanceSummaryUseCase } from "@trading-os/application";
import type { BasicMetrics, StreakResult } from "@trading-os/analytics-engine";
import { tradeRepository, accountRepository } from "@/lib/repositories";
import { DEMO_STRATEGIES } from "@/lib/demo-data";

export interface RecentTrade {
  id: string;
  instrument: string;
  direction: string;
  netPnL: number;
  rMultiple: number | null;
  exitTime: string;
  outcome: string | null;
  strategyName: string | null;
}

export interface DashboardData {
  account: { id: string; name: string; currency: string; startingBalance: number };
  metrics: BasicMetrics;
  streaks: StreakResult;
  equityCurve: { date: string; equity: number }[];
  drawdownSeries: { date: string; drawdownPct: number }[];
  dailyPnL: { date: string; netPnL: number; tradeCount: number }[];
  recentTrades: RecentTrade[];
  maxDrawdownPct: number;
  currentDrawdownPct: number;
}

const strategyNameById = new Map(DEMO_STRATEGIES.map((s) => [s.id, s.name] as const));

/**
 * The single loader every Dashboard widget's data traces back to. Nothing
 * here recomputes P&L or drawdown itself — it calls into `domain` and
 * `application`, then reshapes the results into plain, serializable
 * objects a Server Component can pass to client widgets as props.
 */
export async function getDashboardData(accountId: string): Promise<DashboardData> {
  const accountRecord = await accountRepository.findById(accountId);
  if (!accountRecord) throw new Error(`Account ${accountId} not found`);

  const tradeRecords = await tradeRepository.findByAccount(accountId, { status: "closed" });
  const account = TradingAccount.fromRecord(accountRecord);
  const trades = tradeRecords.map(Trade.fromRecord);

  const { metrics, streaks } = await new GetPerformanceSummaryUseCase({ tradeRepository }).execute(accountId);

  const equityCurve = account.buildEquityCurve(trades);
  const maxDrawdown = account.maxDrawdown(trades);
  const currentDrawdown = account.currentDrawdown(trades);

  let peak = equityCurve[0]?.equity ?? 0;
  const drawdownSeries = equityCurve.map((point) => {
    peak = Math.max(peak, point.equity);
    const ddPct = peak > 0 ? ((peak - point.equity) / peak) * 100 : 0;
    return { date: point.date, drawdownPct: -ddPct }; // negative so the chart renders below the zero line
  });

  const dailyBuckets = new Map<string, { netPnL: number; tradeCount: number }>();
  for (const trade of trades) {
    const day = trade.exitTime?.slice(0, 10);
    if (!day) continue;
    const bucket = dailyBuckets.get(day) ?? { netPnL: 0, tradeCount: 0 };
    bucket.netPnL += trade.netPnL?.toMajor() ?? 0;
    bucket.tradeCount += 1;
    dailyBuckets.set(day, bucket);
  }
  const dailyPnL = [...dailyBuckets.entries()]
    .map(([date, bucket]) => ({ date, ...bucket }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const recentTrades: RecentTrade[] = trades
    .slice()
    .sort((a, b) => (b.exitTime ?? "").localeCompare(a.exitTime ?? ""))
    .slice(0, 10)
    .map((trade) => {
      const record = trade.toRecord();
      return {
        id: trade.id,
        instrument: trade.instrument,
        direction: trade.direction,
        netPnL: trade.netPnL?.toMajor() ?? 0,
        rMultiple: trade.rMultipleAchieved,
        exitTime: trade.exitTime!,
        outcome: trade.outcome,
        strategyName: record.strategyId ? (strategyNameById.get(record.strategyId) ?? null) : null,
      };
    });

  return {
    account: {
      id: account.id,
      name: account.name,
      currency: account.currency,
      startingBalance: account.startingBalance.toMajor(),
    },
    metrics,
    streaks,
    equityCurve,
    drawdownSeries,
    dailyPnL,
    recentTrades,
    maxDrawdownPct: maxDrawdown.percentage,
    currentDrawdownPct: currentDrawdown.percentage,
  };
}
