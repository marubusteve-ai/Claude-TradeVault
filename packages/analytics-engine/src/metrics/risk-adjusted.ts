export interface EquityPoint {
  date: string;
  equity: number;
}

function mean(values: number[]): number {
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
}

function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  const variance = values.reduce((s, v) => s + (v - m) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

/** Converts an equity curve into periodic percentage returns. */
export function toReturns(curve: EquityPoint[]): number[] {
  const returns: number[] = [];
  for (let i = 1; i < curve.length; i++) {
    const prev = curve[i - 1]!.equity;
    if (prev !== 0) returns.push((curve[i]!.equity - prev) / prev);
  }
  return returns;
}

/**
 * Annualized Sharpe ratio: excess return per unit of total volatility.
 * `periodsPerYear` must match the return series granularity — 252 for
 * daily-return series, 12 for monthly, 52 for weekly.
 */
export function sharpeRatio(returns: number[], riskFreeRate = 0, periodsPerYear = 252): number {
  const excess = returns.map((r) => r - riskFreeRate / periodsPerYear);
  const sd = stdDev(excess);
  if (sd === 0) return 0;
  return (mean(excess) / sd) * Math.sqrt(periodsPerYear);
}

/** Like Sharpe, but only penalizes downside volatility — more forgiving of large winning trades that would otherwise inflate the "risk" term. */
export function sortinoRatio(returns: number[], riskFreeRate = 0, periodsPerYear = 252): number {
  const excess = returns.map((r) => r - riskFreeRate / periodsPerYear);
  const downside = excess.filter((r) => r < 0);
  const downsideDeviation = downside.length ? Math.sqrt(mean(downside.map((r) => r ** 2))) : 0;
  if (downsideDeviation === 0) return 0;
  return (mean(excess) / downsideDeviation) * Math.sqrt(periodsPerYear);
}

export function maxDrawdown(curve: EquityPoint[]): { amount: number; percentage: number } {
  let peak = curve[0]?.equity ?? 0;
  let maxDD = 0;
  let maxDDPct = 0;
  for (const point of curve) {
    peak = Math.max(peak, point.equity);
    const dd = peak - point.equity;
    const ddPct = peak > 0 ? (dd / peak) * 100 : 0;
    if (dd > maxDD) maxDD = dd;
    if (ddPct > maxDDPct) maxDDPct = ddPct;
  }
  return { amount: maxDD, percentage: maxDDPct };
}

/** Annualized return divided by max drawdown percentage — return earned per unit of pain endured. */
export function calmarRatio(returns: number[], curve: EquityPoint[], periodsPerYear = 252): number {
  const annualizedReturn = mean(returns) * periodsPerYear;
  const dd = maxDrawdown(curve);
  if (dd.percentage === 0) return 0;
  return annualizedReturn / (dd.percentage / 100);
}

/** Ulcer Index — root-mean-square of drawdown depth over the whole curve, penalizing both deep AND prolonged drawdowns rather than just the single worst point. */
export function ulcerIndex(curve: EquityPoint[]): number {
  let peak = curve[0]?.equity ?? 0;
  const squaredDrawdowns: number[] = [];
  for (const point of curve) {
    peak = Math.max(peak, point.equity);
    const ddPct = peak > 0 ? ((peak - point.equity) / peak) * 100 : 0;
    squaredDrawdowns.push(ddPct ** 2);
  }
  return Math.sqrt(mean(squaredDrawdowns));
}

/** Net profit earned per unit of max drawdown suffered — how efficiently the account recovers from its worst stretch. */
export function recoveryFactor(netProfit: number, maxDrawdownAmount: number): number {
  if (maxDrawdownAmount === 0) return netProfit > 0 ? Infinity : 0;
  return netProfit / maxDrawdownAmount;
}
