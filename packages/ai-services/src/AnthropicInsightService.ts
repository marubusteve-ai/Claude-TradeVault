import Anthropic from "@anthropic-ai/sdk";
import { Trade } from "@trading-os/domain";
import { calculateBasicMetrics, calculateMistakeFrequency, calculateSetupScore } from "@trading-os/analytics-engine";
import type { TradeRecord } from "@trading-os/shared-types";
import type { AIInsightService } from "./ports";
import { TradeReviewSchema, MistakePatternsSchema, SetupGradeSchema, type TradeReview, type MistakePattern, type SetupGrade } from "./ports";

export interface AnthropicInsightServiceConfig {
  apiKey: string;
  model?: string;
}

/**
 * The guiding rule for every method here: the domain layer and
 * analytics-engine compute every number that has a correct, deterministic
 * answer (P&L, R-multiple, win rate, statistical setup score, mistake
 * cost). Claude is only ever asked for the part a calculator can't do —
 * reading the qualitative texture in comments and context, synthesizing a
 * narrative, and exercising judgment about what actually matters. Prompts
 * hand Claude the precomputed numbers as ground truth and explicitly
 * instruct it not to recompute or contradict them. Every response is
 * extracted via forced tool-use (not parsed from free text) and validated
 * against the same Zod schemas the rest of the app uses, so a malformed
 * model response fails loudly instead of silently corrupting data.
 */
export class AnthropicInsightService implements AIInsightService {
  private readonly client: Anthropic;
  private readonly model: string;

  constructor(config: AnthropicInsightServiceConfig) {
    this.client = new Anthropic({ apiKey: config.apiKey });
    this.model = config.model ?? process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5";
  }

  async generateTradeReview(trade: TradeRecord, relatedTrades: TradeRecord[]): Promise<TradeReview> {
    const t = Trade.fromRecord(trade);
    const relatedMetrics = calculateBasicMetrics(
      relatedTrades.map((r) => {
        const rt = Trade.fromRecord(r);
        return { netPnL: rt.netPnL?.toMajor() ?? 0, rMultiple: rt.rMultipleAchieved, isWinner: rt.isWinner, isClosed: r.status === "closed" };
      })
    );

    const facts = {
      instrument: trade.instrument,
      direction: trade.direction,
      netPnL: t.netPnL?.toMajor() ?? null,
      rMultiple: t.rMultipleAchieved,
      outcome: t.outcome,
      durationMinutes: t.durationMinutes,
      exitEfficiency: t.exitEfficiency,
      mfeToMaeRatio: t.mfeToMaeRatio,
      selfRating: trade.rating ?? null,
      taggedMistakes: trade.mistakes,
      emotionalState: trade.emotionalState,
      comment: trade.comment ?? null,
      lessons: trade.lessons ?? null,
      strategyId: trade.strategyId ?? null,
      contextFromSimilarTrades: {
        sampleSize: relatedTrades.length,
        winRate: relatedMetrics.winRate,
        averageRMultiple: relatedMetrics.averageRMultiple,
      },
    };

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 1200,
      system:
        "You are an experienced trading coach reviewing one trade for a client. All numeric facts below (P&L, R-multiple, exit efficiency, etc.) are already correctly computed — treat them as ground truth, never recompute or contradict them. Be specific and evidence-based: reference the actual numbers and the trader's own comment/lessons rather than giving generic advice. If the trader already identified their own mistake accurately, say so rather than inventing a different one.",
      messages: [
        { role: "user", content: `Review this trade:\n\n${JSON.stringify(facts, null, 2)}` },
      ],
      tools: [
        {
          name: "submit_trade_review",
          description: "Submit the structured trade review.",
          input_schema: {
            type: "object",
            properties: {
              summary: { type: "string", description: "2-3 sentence summary of what happened and why it matters." },
              strengths: { type: "array", items: { type: "string" }, description: "What the trader did well, specifically." },
              mistakes: { type: "array", items: { type: "string" }, description: "Specific, actionable mistakes — empty array if none." },
              suggestedTags: { type: "array", items: { type: "string" }, description: "Short tags this trade should probably carry." },
              qualityScore: { type: "number", description: "0-100 execution quality score, independent of whether it won or lost." },
            },
            required: ["summary", "strengths", "mistakes", "suggestedTags", "qualityScore"],
          },
        },
      ],
      tool_choice: { type: "tool", name: "submit_trade_review" },
    });

    return TradeReviewSchema.parse(extractToolInput(response, "submit_trade_review"));
  }

  async detectMistakePatterns(trades: TradeRecord[]): Promise<MistakePattern[]> {
    const statisticalFrequency = calculateMistakeFrequency(
      trades.map((r) => ({ mistakes: r.mistakes, netPnL: Trade.fromRecord(r).netPnL?.toMajor() ?? 0 }))
    );

    const taggedTrades = trades
      .filter((t) => t.mistakes.length > 0)
      .map((t) => ({
        id: t.id,
        mistakes: t.mistakes,
        comment: t.comment ?? null,
        session: t.session ?? null,
        emotionalState: t.emotionalState,
        netPnL: Trade.fromRecord(t).netPnL?.toMajor() ?? null,
        exitTime: t.exitTime ?? null,
      }));

    if (taggedTrades.length === 0) return [];

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 1500,
      system:
        "You are a trading psychology analyst. The dollar cost of each mistake category is already computed correctly — use those figures as-is. Your job is to find patterns the raw counts can't show: whether mistakes cluster around a session, an emotional state, a time of day, or a sequence of prior trades, using the comments and context provided. Only report a pattern you can actually support from the given data — do not invent context that isn't there.",
      messages: [
        {
          role: "user",
          content: `Statistical mistake frequency (already computed, do not recompute):\n${JSON.stringify(statisticalFrequency, null, 2)}\n\nTagged trades with context:\n${JSON.stringify(taggedTrades, null, 2)}`,
        },
      ],
      tools: [
        {
          name: "submit_mistake_patterns",
          description: "Submit the identified behavioral patterns.",
          input_schema: {
            type: "object",
            properties: {
              patterns: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    category: { type: "string" },
                    occurrences: { type: "number" },
                    estimatedCostImpact: { type: "number", description: "Use the precomputed totalCostImpact for this category." },
                    description: {
                      type: "string",
                      description: "The pattern itself — what tends to precede or accompany this mistake, evidenced from the data.",
                    },
                    affectedTradeIds: { type: "array", items: { type: "string" } },
                  },
                  required: ["category", "occurrences", "estimatedCostImpact", "description", "affectedTradeIds"],
                },
              },
            },
            required: ["patterns"],
          },
        },
      ],
      tool_choice: { type: "tool", name: "submit_mistake_patterns" },
    });

    return MistakePatternsSchema.parse(extractToolInput(response, "submit_mistake_patterns")).patterns;
  }

  async gradeSetup(setupId: string, trades: TradeRecord[]): Promise<SetupGrade> {
    const metricInputs = trades.map((r) => {
      const t = Trade.fromRecord(r);
      return { netPnL: t.netPnL?.toMajor() ?? 0, rMultiple: t.rMultipleAchieved, isWinner: t.isWinner, isClosed: r.status === "closed" };
    });
    const metrics = calculateBasicMetrics(metricInputs);
    const statisticalScore = calculateSetupScore({ metrics, sampleSize: trades.length });

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 900,
      system:
        "You are grading a trading setup for a client. A statistical score is already computed correctly via a confidence-adjusted formula (it regresses toward neutral on small samples) — do not recompute it or contradict its math. Your job is to add qualitative judgment: is the sample size actually enough to trust this, does the edge look structural or coincidental, and what would meaningfully change your confidence. probabilityScore and qualityScore should stay close to the statistical inputs; confidenceScore is specifically your own judgment about how much to trust the numbers given the sample size and consistency.",
      messages: [
        {
          role: "user",
          content: `Setup ID: ${setupId}\n\nStatistical score (already computed):\n${JSON.stringify(statisticalScore, null, 2)}\n\nUnderlying metrics:\n${JSON.stringify(metrics, null, 2)}`,
        },
      ],
      tools: [
        {
          name: "submit_setup_grade",
          description: "Submit the setup grade.",
          input_schema: {
            type: "object",
            properties: {
              probabilityScore: { type: "number", description: "0-100, historical win-rate-derived edge strength." },
              confidenceScore: { type: "number", description: "0-100, your judgment of how much to trust this given sample size." },
              qualityScore: { type: "number", description: "0-100 composite." },
              rationale: { type: "string", description: "2-4 sentences of specific reasoning, referencing the actual numbers." },
            },
            required: ["probabilityScore", "confidenceScore", "qualityScore", "rationale"],
          },
        },
      ],
      tool_choice: { type: "tool", name: "submit_setup_grade" },
    });

    const parsed = SetupGradeSchema.omit({ setupId: true }).parse(extractToolInput(response, "submit_setup_grade"));
    return { setupId, ...parsed };
  }

  async summarizeJournal(trades: TradeRecord[], periodLabel: string): Promise<string> {
    const closedTrades = trades.filter((t) => t.status === "closed");
    const metrics = calculateBasicMetrics(
      closedTrades.map((r) => {
        const t = Trade.fromRecord(r);
        return { netPnL: t.netPnL?.toMajor() ?? 0, rMultiple: t.rMultipleAchieved, isWinner: t.isWinner, isClosed: true };
      })
    );

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 700,
      system:
        "You are writing a short journal summary for a trader covering the given period. The metrics provided are already correctly computed — reference them naturally, don't recompute or restate every one. Write 3-5 sentences of plain prose, no headers or bullet points, in a tone that's honest and direct but not harsh. Ground every claim in the numbers or comments provided — do not invent specifics that aren't in the data.",
      messages: [
        {
          role: "user",
          content: `Period: ${periodLabel}\n\nMetrics:\n${JSON.stringify(metrics, null, 2)}\n\nTrade comments from the period:\n${JSON.stringify(closedTrades.map((t) => t.comment).filter(Boolean), null, 2)}`,
        },
      ],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") throw new Error("Expected a text response from summarizeJournal");
    return textBlock.text;
  }
}

function extractToolInput(response: Anthropic.Message, toolName: string): unknown {
  const block = response.content.find((b) => b.type === "tool_use" && b.name === toolName);
  if (!block || block.type !== "tool_use") {
    throw new Error(`Expected a "${toolName}" tool_use block in the model response but got: ${response.stop_reason}`);
  }
  return block.input;
}
