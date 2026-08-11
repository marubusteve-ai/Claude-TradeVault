export interface TradeMetricInput {
  netPnL: number;
  rMultiple: number | null;
  isWinner: boolean;
  isClosed: boolean;
}

export interface BasicMetrics {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  lossRate: number;
  netPnL: number;
  grossProfit: number;
  grossLoss: number;
  profitFactor: number | null;
  averageWin: number;
  averageLoss: number;
  largestWin: number;
  largestLoss: number;
  averageRMultiple: number | null;
  expectancy: number | null;
  expectancyR: number | null;
}

/**
 * The single function every "performance by X" breakdown across the
 * Dashboard, Analytics and Playbook screens reduces to. Takes any array of
 * closed trades — a whole account, a strategy, a day, a session — and
 * returns the full standard metric set for it.
 */
export function calculateBasicMetrics(trades: TradeMetricInput[]): BasicMetrics {
  const closed = trades.filter((t) => t.isClosed);
  const wins = closed.filter((t) => t.netPnL > 0);
  const losses = closed.filter((t) => t.netPnL < 0);

  const grossProfit = wins.reduce((s, t) => s + t.netPnL, 0);
  const grossLoss = Math.abs(losses.reduce((s, t) => s + t.netPnL, 0));
  const netPnL = closed.reduce((s, t) => s + t.netPnL, 0);

  const winRate = closed.length ? wins.length / closed.length : 0;
  const lossRate = closed.length ? losses.length / closed.length : 0;
  const averageWin = wins.length ? grossProfit / wins.length : 0;
  const averageLoss = losses.length ? grossLoss / losses.length : 0;

  const rMultiples = closed.map((t) => t.rMultiple).filter((r): r is number => r != null);
  const winRMultiples = wins.map((t) => t.rMultiple).filter((r): r is number => r != null);
  const lossRMultiples = losses.map((t) => t.rMultiple).filter((r): r is number => r != null);

  const averageRMultiple = rMultiples.length ? rMultiples.reduce((a, b) => a + b, 0) / rMultiples.length : null;
  const avgWinR = winRMultiples.length ? winRMultiples.reduce((a, b) => a + b, 0) / winRMultiples.length : 0;
  const avgLossR = lossRMultiples.length ? Math.abs(lossRMultiples.reduce((a, b) => a + b, 0) / lossRMultiples.length) : 0;

  return {
    totalTrades: closed.length,
    winningTrades: wins.length,
    losingTrades: losses.length,
    winRate,
    lossRate,
    netPnL,
    grossProfit,
    grossLoss,
    profitFactor: grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : null,
    averageWin,
    averageLoss,
    largestWin: wins.length ? Math.max(...wins.map((t) => t.netPnL)) : 0,
    largestLoss: losses.length ? Math.min(...losses.map((t) => t.netPnL)) : 0,
    averageRMultiple,
    expectancy: closed.length ? winRate * averageWin - lossRate * averageLoss : null,
    expectancyR: avgWinR || avgLossR ? winRate * avgWinR - lossRate * avgLossR : null,
  };
}
