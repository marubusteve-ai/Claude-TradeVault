import { z } from "zod";
import type { TradeRecord } from "@trading-os/shared-types";

export const TradeReviewSchema = z.object({
  summary: z.string(),
  strengths: z.array(z.string()),
  mistakes: z.array(z.string()),
  suggestedTags: z.array(z.string()),
  qualityScore: z.number().min(0).max(100),
});
export type TradeReview = z.infer<typeof TradeReviewSchema>;

export const MistakePatternSchema = z.object({
  category: z.string(),
  occurrences: z.number(),
  estimatedCostImpact: z.number(),
  description: z.string(),
  affectedTradeIds: z.array(z.string()),
});
export type MistakePattern = z.infer<typeof MistakePatternSchema>;
export const MistakePatternsSchema = z.object({ patterns: z.array(MistakePatternSchema) });

export const SetupGradeSchema = z.object({
  setupId: z.string(),
  probabilityScore: z.number().min(0).max(100),
  confidenceScore: z.number().min(0).max(100),
  qualityScore: z.number().min(0).max(100),
  rationale: z.string(),
});
export type SetupGrade = z.infer<typeof SetupGradeSchema>;

/**
 * Port for AI-generated insight generation. The default implementation
 * (added with the AI Insights module) calls the Anthropic API; keeping
 * every consumer decoupled from that behind this interface means the
 * provider can change, and a fully local/offline heuristic fallback can
 * substitute for users who disable AI features, with zero call-site churn.
 */
export interface AIInsightService {
  generateTradeReview(trade: TradeRecord, relatedTrades: TradeRecord[]): Promise<TradeReview>;
  detectMistakePatterns(trades: TradeRecord[]): Promise<MistakePattern[]>;
  gradeSetup(setupId: string, trades: TradeRecord[]): Promise<SetupGrade>;
  summarizeJournal(trades: TradeRecord[], periodLabel: string): Promise<string>;
}
