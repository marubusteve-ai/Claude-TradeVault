import { calculateBasicMetrics, type TradeMetricInput, type BasicMetrics } from "../metrics/basic";

export interface GroupedMetrics<K extends string | number> {
  key: K;
  metrics: BasicMetrics;
  tradeCount: number;
}

/**
 * Groups trades by an arbitrary dimension (strategy, setup, instrument,
 * session, day of week, month, market condition, psychology tag...) and
 * computes the full metric set per group. This one function powers every
 * "performance by X" breakdown across the dashboard, analytics and
 * playbook screens — the dimension is just the key function you pass in.
 */
export function groupTradesBy<T extends TradeMetricInput, K extends string | number>(
  trades: T[],
  keyFn: (trade: T) => K
): GroupedMetrics<K>[] {
  const groups = new Map<K, T[]>();
  for (const trade of trades) {
    const key = keyFn(trade);
    const bucket = groups.get(key) ?? [];
    bucket.push(trade);
    groups.set(key, bucket);
  }

  return [...groups.entries()]
    .map(([key, groupTrades]) => ({ key, metrics: calculateBasicMetrics(groupTrades), tradeCount: groupTrades.length }))
    .sort((a, b) => b.metrics.netPnL - a.metrics.netPnL);
}

export function dayOfWeekKey(isoDate: string): string {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[new Date(isoDate).getDay()]!;
}

export function monthKey(isoDate: string): string {
  return isoDate.slice(0, 7); // "YYYY-MM"
}

export function hourOfDayKey(isoDate: string): number {
  return new Date(isoDate).getUTCHours();
}
