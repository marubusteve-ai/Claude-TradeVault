"use server";

import { Trade } from "@trading-os/domain";
import {
  groupTradesBy,
  dayOfWeekKey,
  monthKey,
  runMonteCarloSimulation,
  calculateCorrelationMatrix,
  calculateBasicMetrics,
  type GroupedMetrics,
  type MonteCarloResult,
  type CorrelationMatrixEntry,
  type BasicMetrics,
} from "@trading-os/analytics-engine";
import { accountRepository, tradeRepository } from "@/lib/repositories";
import { DEMO_USER_ID } from "@/lib/demo-data";

export type DrilldownDimension = "strategy" | "instrument" | "assetClass" | "session" | "timeframe" | "dayOfWeek" | "month";

interface EnrichedTrade {
  netPnL: number;
  rMultiple: number | null;
  isWinner: boolean;
  isClosed: boolean;
  strategyId: string;
  instrument: string;
  assetClass: string;
  session: string;
  timeframe: string;
  exitTime: string;
}

async function getAllClosedTrades(): Promise<{ trade: Trade; enriched: EnrichedTrade }[]> {
  const accounts = await accountRepository.findByUser(DEMO_USER_ID);
  const recordArrays = await Promise.all(accounts.map((a) => tradeRepository.findByAccount(a.id, { status: "closed" })));
  const records = recordArrays.flat();

  return records
    .map((record) => {
      const trade = Trade.fromRecord(record);
      const enriched: EnrichedTrade = {
        netPnL: trade.netPnL?.toMajor() ?? 0,
        rMultiple: trade.rMultipleAchieved,
        isWinner: trade.isWinner,
        isClosed: true,
        strategyId: record.strategyId ?? "Unassigned",
        instrument: record.instrument,
        assetClass: record.assetClass,
        session: record.session ?? "Unspecified",
        timeframe: record.timeframe ?? "Unspecified",
        exitTime: record.exitTime ?? record.createdAt,
      };
      return { trade, enriched };
    })
    .filter((t) => t.trade.status === "closed");
}

export async function getDimensionDrilldownAction(dimension: DrilldownDimension): Promise<GroupedMetrics<string>[]> {
  const trades = (await getAllClosedTrades()).map((t) => t.enriched);

  const keyFn: Record<DrilldownDimension, (t: EnrichedTrade) => string> = {
    strategy: (t) => t.strategyId,
    instrument: (t) => t.instrument,
    assetClass: (t) => t.assetClass,
    session: (t) => t.session,
    timeframe: (t) => t.timeframe,
    dayOfWeek: (t) => dayOfWeekKey(t.exitTime),
    month: (t) => monthKey(t.exitTime),
  };

  return groupTradesBy(trades, keyFn[dimension]);
}

export async function getMonteCarloAction(numTradesToProject: number, riskPerTradePercentage: number): Promise<MonteCarloResult> {
  const trades = await getAllClosedTrades();
  const historicalRMultiples = trades.map((t) => t.enriched.rMultiple).filter((r): r is number => r != null);

  return runMonteCarloSimulation({
    historicalRMultiples,
    numTradesToProject,
    riskPerTradePercentage,
    startingEquity: 100000,
    numSimulations: 1000,
  });
}

export interface CorrelationBundle {
  entries: CorrelationMatrixEntry[];
  sampleSize: number;
}

export async function getCorrelationMatrixAction(): Promise<CorrelationBundle> {
  const trades = await getAllClosedTrades();

  const durations: number[] = [];
  const rMultiples: number[] = [];
  const ratings: number[] = [];
  const maeAmounts: number[] = [];
  const mfeAmounts: number[] = [];
  const quantities: number[] = [];

  for (const { trade } of trades) {
    const record = trade.toRecord();
    const duration = trade.durationMinutes;
    const rMultiple = trade.rMultipleAchieved;
    if (duration == null || rMultiple == null || record.rating == null || record.maeAmount == null || record.mfeAmount == null) continue;

    durations.push(duration);
    rMultiples.push(rMultiple);
    ratings.push(record.rating);
    maeAmounts.push(record.maeAmount);
    mfeAmounts.push(record.mfeAmount);
    quantities.push(record.quantity);
  }

  const entries = calculateCorrelationMatrix({
    "Duration (min)": durations,
    "R-Multiple": rMultiples,
    "Self Rating": ratings,
    "MAE ($)": maeAmounts,
    "MFE ($)": mfeAmounts,
    Quantity: quantities,
  });

  return { entries, sampleSize: durations.length };
}

export interface WinLossComparison {
  winners: BasicMetrics;
  losers: BasicMetrics;
  avgWinnerDuration: number | null;
  avgLoserDuration: number | null;
  avgWinnerExitEfficiency: number | null;
  avgLoserExitEfficiency: number | null;
}

export async function getWinLossComparisonAction(): Promise<WinLossComparison> {
  const trades = await getAllClosedTrades();
  const winners = trades.filter((t) => t.enriched.isWinner);
  const losers = trades.filter((t) => !t.enriched.isWinner && t.enriched.netPnL < 0);

  const avg = (values: number[]) => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : null);

  return {
    winners: calculateBasicMetrics(winners.map((t) => t.enriched)),
    losers: calculateBasicMetrics(losers.map((t) => t.enriched)),
    avgWinnerDuration: avg(winners.map((t) => t.trade.durationMinutes).filter((d): d is number => d != null)),
    avgLoserDuration: avg(losers.map((t) => t.trade.durationMinutes).filter((d): d is number => d != null)),
    avgWinnerExitEfficiency: avg(winners.map((t) => t.trade.exitEfficiency).filter((e): e is number => e != null)),
    avgLoserExitEfficiency: avg(losers.map((t) => t.trade.exitEfficiency).filter((e): e is number => e != null)),
  };
}
