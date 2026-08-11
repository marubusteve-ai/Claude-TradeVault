import type { TradeRepository } from "@trading-os/domain";
import { Trade } from "@trading-os/domain";
import { calculateBasicMetrics, calculateStreaks, type BasicMetrics, type StreakResult } from "@trading-os/analytics-engine";

export interface PerformanceSummary {
  metrics: BasicMetrics;
  streaks: StreakResult;
}

export interface GetPerformanceSummaryDependencies {
  tradeRepository: TradeRepository;
}

/** The query behind the Dashboard's KPI grid: net P&L, win rate, expectancy, profit factor, and streaks for one account. */
export class GetPerformanceSummaryUseCase {
  constructor(private readonly deps: GetPerformanceSummaryDependencies) {}

  async execute(accountId: string): Promise<PerformanceSummary> {
    const records = await this.deps.tradeRepository.findByAccount(accountId, { status: "closed" });
    const trades = records.map(Trade.fromRecord);

    const metricInputs = trades.map((t) => ({
      netPnL: t.netPnL?.toMajor() ?? 0,
      rMultiple: t.rMultipleAchieved,
      isWinner: t.isWinner,
      isClosed: t.status === "closed",
    }));

    const outcomes: Array<"win" | "loss" | "breakeven"> = trades.map((t) =>
      t.outcome === "win" ? "win" : t.outcome === "loss" ? "loss" : "breakeven"
    );

    return { metrics: calculateBasicMetrics(metricInputs), streaks: calculateStreaks(outcomes) };
  }
}
