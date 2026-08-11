import type { BasicMetrics } from "../metrics/basic";

export interface SetupScoreInput {
  metrics: BasicMetrics;
  sampleSize: number;
}

export type ConfidenceLevel = "low" | "moderate" | "high";

export interface SetupScoreResult {
  /** 0-100 composite. 50 is neutral — a brand-new setup with zero trades scores exactly 50, not 0. */
  score: number;
  confidenceLevel: ConfidenceLevel;
  components: {
    edgeScore: number;
    consistencyScore: number;
    /** 0-1. How much the raw score is trusted vs. regressed toward the neutral 50 prior. */
    sampleSizeMultiplier: number;
  };
}

const FULL_CONFIDENCE_SAMPLE_SIZE = 30;
const HIGH_CONFIDENCE_THRESHOLD = 30;
const MODERATE_CONFIDENCE_THRESHOLD = 10;
const NEUTRAL_SCORE = 50;

/**
 * A statistical (not AI) setup/strategy score: how strong is the edge, and
 * how much should that strength actually be trusted given how many trades
 * it's based on. A setup with 3 trades and a 100% win rate should NOT
 * score 100 — the small-sample regression here pulls it back toward
 * neutral until enough trades accumulate to trust the numbers, the same
 * logic behind Bayesian-shrinkage rating systems (a 5-star product with
 * one review isn't actually a 5-star product yet).
 */
export function calculateSetupScore({ metrics, sampleSize }: SetupScoreInput): SetupScoreResult {
  const expectancyR = metrics.averageRMultiple ?? 0;
  // +2R average -> 100, 0R -> 50, -2R -> 0, clamped.
  const edgeScore = Math.min(100, Math.max(0, NEUTRAL_SCORE + expectancyR * 25));

  const profitFactorScore =
    metrics.profitFactor == null ? NEUTRAL_SCORE : metrics.profitFactor === Infinity ? 100 : Math.min(100, (metrics.profitFactor / 2) * 100);
  const consistencyScore = (metrics.winRate * 100 + profitFactorScore) / 2;

  const sampleSizeMultiplier = Math.min(1, sampleSize / FULL_CONFIDENCE_SAMPLE_SIZE);
  const rawScore = edgeScore * 0.5 + consistencyScore * 0.5;
  const score = Math.round(rawScore * sampleSizeMultiplier + NEUTRAL_SCORE * (1 - sampleSizeMultiplier));

  const confidenceLevel: ConfidenceLevel =
    sampleSize >= HIGH_CONFIDENCE_THRESHOLD ? "high" : sampleSize >= MODERATE_CONFIDENCE_THRESHOLD ? "moderate" : "low";

  return { score, confidenceLevel, components: { edgeScore, consistencyScore, sampleSizeMultiplier } };
}
