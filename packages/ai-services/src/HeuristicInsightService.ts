import { Trade } from "@trading-os/domain";
import { calculateBasicMetrics, calculateStreaks, calculateMistakeFrequency, calculateSetupScore } from "@trading-os/analytics-engine";
import type { TradeRecord } from "@trading-os/shared-types";
import type { AIInsightService } from "./ports";
import type { TradeReview, MistakePattern, SetupGrade } from "./ports";

/**
 * Deliberately not a fake stand-in for the AI service: every field
 * returned here is a genuinely computed number from analytics-engine,
 * just without the qualitative synthesis an LLM adds. This is what
 * `getInsightService()` in apps/web falls back to when ANTHROPIC_API_KEY
 * isn't set, so the AI Insights module still does something real and
 * honest rather than erroring out or displaying canned text. The UI is
 * responsible for labeling which mode produced a given result — this
 * class doesn't pretend to be the AI implementation.
 */
export class HeuristicInsightService implements AIInsightService {
  async generateTradeReview(trade: TradeRecord, relatedTrades: TradeRecord[]): Promise<TradeReview> {
    const t = Trade.fromRecord(trade);
    const rMultiple = t.rMultipleAchieved;
    const exitEfficiency = t.exitEfficiency;

    const strengths: string[] = [];
    const mistakes: string[] = [...trade.mistakes];

    if (rMultiple != null && rMultiple > 0) {
      strengths.push(`Closed at ${rMultiple >= 0 ? "+" : ""}${rMultiple.toFixed(2)}R, a winning outcome.`);
    }
    if (exitEfficiency != null && exitEfficiency > 0.7) {
      strengths.push(`Captured ${(exitEfficiency * 100).toFixed(0)}% of the favorable move (exit efficiency).`);
    }
    if (trade.stopLossPrice != null) strengths.push("A stop-loss was defined before entry.");
    if (strengths.length === 0) strengths.push("No standout strengths identified from the logged data.");

    if (exitEfficiency != null && exitEfficiency < 0.4 && exitEfficiency > 0) {
      mistakes.push(`Only captured ${(exitEfficiency * 100).toFixed(0)}% of the favorable move — may have exited early.`);
    }
    if (trade.stopLossPrice == null) mistakes.push("No stop-loss price was recorded for this trade.");
    if (rMultiple != null && rMultiple < -1.2) {
      mistakes.push(`Loss exceeded planned risk (${rMultiple.toFixed(2)}R) — check for stop-loss slippage or a moved stop.`);
    }

    const qualityScore = Math.round(
      Math.min(100, Math.max(0, 50 + (rMultiple ?? 0) * 15 + (exitEfficiency != null ? (exitEfficiency - 0.5) * 40 : 0)))
    );

    const durationLabel =
      t.durationMinutes == null ? null : t.durationMinutes < 15 ? "quick-scalp" : t.durationMinutes > 240 ? "runner" : null;

    return {
      summary: `${trade.instrument} ${trade.direction} closed ${t.outcome ?? "with an undetermined outcome"}${
        rMultiple != null ? ` at ${rMultiple >= 0 ? "+" : ""}${rMultiple.toFixed(2)}R` : ""
      } against a ${relatedTrades.length}-trade sample for comparison. This is a statistically-derived summary — connect an Anthropic API key for qualitative AI review.`,
      strengths,
      mistakes,
      suggestedTags: durationLabel ? [durationLabel] : [],
      qualityScore,
    };
  }

  async detectMistakePatterns(trades: TradeRecord[]): Promise<MistakePattern[]> {
    const frequency = calculateMistakeFrequency(
      trades.map((r) => ({ mistakes: r.mistakes, netPnL: Trade.fromRecord(r).netPnL?.toMajor() ?? 0 }))
    );

    return frequency.map((f) => ({
      category: f.category,
      occurrences: f.occurrences,
      estimatedCostImpact: f.totalCostImpact,
      description: `Occurred ${f.occurrences} time${f.occurrences === 1 ? "" : "s"}, averaging $${f.averageCostImpact.toFixed(0)} per occurrence. Connect an Anthropic API key for pattern analysis beyond frequency.`,
      affectedTradeIds: trades.filter((t) => t.mistakes.includes(f.category)).map((t) => t.id),
    }));
  }

  async gradeSetup(setupId: string, trades: TradeRecord[]): Promise<SetupGrade> {
    const metricInputs = trades.map((r) => {
      const t = Trade.fromRecord(r);
      return { netPnL: t.netPnL?.toMajor() ?? 0, rMultiple: t.rMultipleAchieved, isWinner: t.isWinner, isClosed: r.status === "closed" };
    });
    const metrics = calculateBasicMetrics(metricInputs);
    const score = calculateSetupScore({ metrics, sampleSize: trades.length });

    return {
      setupId,
      probabilityScore: Math.round(score.components.edgeScore),
      confidenceScore: Math.round(score.components.sampleSizeMultiplier * 100),
      qualityScore: score.score,
      rationale: `Statistical score of ${score.score}/100 with ${score.confidenceLevel} confidence, based on ${trades.length} trades. Connect an Anthropic API key for qualitative grading that goes beyond the formula.`,
    };
  }

  async summarizeJournal(trades: TradeRecord[], periodLabel: string): Promise<string> {
    const closedTrades = trades.filter((t) => t.status === "closed");
    const closedAsTrades = closedTrades.map(Trade.fromRecord);
    const metricInputs = closedAsTrades.map((t) => ({
      netPnL: t.netPnL?.toMajor() ?? 0,
      rMultiple: t.rMultipleAchieved,
      isWinner: t.isWinner,
      isClosed: true,
    }));
    const metrics = calculateBasicMetrics(metricInputs);
    const outcomes: Array<"win" | "loss" | "breakeven"> = closedAsTrades.map((t) =>
      t.outcome === "win" ? "win" : t.outcome === "loss" ? "loss" : "breakeven"
    );
    const streaks = calculateStreaks(outcomes);

    const pnlSign = metrics.netPnL >= 0 ? "up" : "down";
    return (
      `Over ${periodLabel}, you closed ${metrics.totalTrades} trades, finishing ${pnlSign} $${Math.abs(metrics.netPnL).toFixed(0)} ` +
      `with a ${(metrics.winRate * 100).toFixed(0)}% win rate and an average R-multiple of ${metrics.averageRMultiple?.toFixed(2) ?? "—"}. ` +
      `Longest winning streak was ${streaks.longestWinStreak}, longest losing streak was ${streaks.longestLossStreak}. ` +
      `This is a statistics-only summary — connect an Anthropic API key for a narrative review that reads your trade comments too.`
    );
  }
}
