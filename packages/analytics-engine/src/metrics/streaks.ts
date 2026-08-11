export type TradeOutcomeSignal = "win" | "loss" | "breakeven";

export interface StreakResult {
  /** Positive = current winning streak length, negative = current losing streak length, 0 = none/broken by breakeven. */
  currentStreak: number;
  longestWinStreak: number;
  longestLossStreak: number;
}

/** Expects outcomes in chronological order (oldest first). */
export function calculateStreaks(outcomes: TradeOutcomeSignal[]): StreakResult {
  let longestWin = 0;
  let longestLoss = 0;
  let running = 0;

  for (const outcome of outcomes) {
    if (outcome === "win") {
      running = running > 0 ? running + 1 : 1;
      longestWin = Math.max(longestWin, running);
    } else if (outcome === "loss") {
      running = running < 0 ? running - 1 : -1;
      longestLoss = Math.max(longestLoss, Math.abs(running));
    } else {
      running = 0;
    }
  }

  return { currentStreak: running, longestWinStreak: longestWin, longestLossStreak: longestLoss };
}
