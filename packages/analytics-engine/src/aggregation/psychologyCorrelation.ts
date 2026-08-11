import { calculateBasicMetrics, type TradeMetricInput, type BasicMetrics } from "../metrics/basic";

export interface PsychologyDimensionInput {
  date: string; // "YYYY-MM-DD"
  value: number; // 1-10 rating
}

export interface PsychologyPerformanceBucket {
  label: string;
  range: [number, number];
  metrics: BasicMetrics;
  dayCount: number;
}

const PSYCHOLOGY_BUCKETS: { label: string; range: [number, number] }[] = [
  { label: "Low (1-4)", range: [1, 4] },
  { label: "Medium (5-7)", range: [5, 7] },
  { label: "High (8-10)", range: [8, 10] },
];

/**
 * Buckets days by a psychology dimension (mood, discipline, confidence,
 * stress, patience) into low/medium/high tiers and computes real trading
 * performance within each tier — "do results actually differ on days I
 * rated my discipline higher?" This is genuine statistical correlation
 * over the trader's own data, not a simulated or narrative insight; it
 * will show nothing if there's nothing there.
 */
export function correlatePsychologyWithPerformance(
  psychologyByDate: PsychologyDimensionInput[],
  tradesByDate: Map<string, TradeMetricInput[]>
): PsychologyPerformanceBucket[] {
  return PSYCHOLOGY_BUCKETS.map(({ label, range }) => {
    const daysInBucket = psychologyByDate.filter((p) => p.value >= range[0] && p.value <= range[1]);
    const tradesInBucket = daysInBucket.flatMap((d) => tradesByDate.get(d.date) ?? []);
    return { label, range, metrics: calculateBasicMetrics(tradesInBucket), dayCount: daysInBucket.length };
  });
}

export interface TradeMistakeInput {
  mistakes: string[];
  netPnL: number;
}

export interface MistakeFrequencyResult {
  category: string;
  occurrences: number;
  totalCostImpact: number;
  averageCostImpact: number;
}

/** Ranks mistake categories by total cost impact (most expensive first) — the mistake journal's core question: which habit is actually costing the most money, not just which happens most often. */
export function calculateMistakeFrequency(trades: TradeMistakeInput[]): MistakeFrequencyResult[] {
  const byCategory = new Map<string, { occurrences: number; totalCostImpact: number }>();

  for (const trade of trades) {
    for (const mistake of trade.mistakes) {
      const entry = byCategory.get(mistake) ?? { occurrences: 0, totalCostImpact: 0 };
      entry.occurrences += 1;
      entry.totalCostImpact += trade.netPnL;
      byCategory.set(mistake, entry);
    }
  }

  return [...byCategory.entries()]
    .map(([category, v]) => ({
      category,
      occurrences: v.occurrences,
      totalCostImpact: v.totalCostImpact,
      averageCostImpact: v.totalCostImpact / v.occurrences,
    }))
    .sort((a, b) => a.totalCostImpact - b.totalCostImpact);
}
