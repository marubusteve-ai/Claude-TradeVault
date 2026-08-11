import { z } from "zod";

export const TradeDirectionSchema = z.enum(["long", "short"]);
export type TradeDirection = z.infer<typeof TradeDirectionSchema>;

export const TradeStatusSchema = z.enum(["open", "closed", "partially_closed", "cancelled"]);
export type TradeStatus = z.infer<typeof TradeStatusSchema>;

export const TradeOutcomeSchema = z.enum(["win", "loss", "breakeven", "partial_win", "partial_loss"]);
export type TradeOutcome = z.infer<typeof TradeOutcomeSchema>;

export const TakeProfitLevelSchema = z.object({
  id: z.string(),
  price: z.number(),
  quantityPercentage: z.number().min(0).max(100),
  reason: z.string().optional(),
  hit: z.boolean().default(false),
});
export type TakeProfitLevel = z.infer<typeof TakeProfitLevelSchema>;

export const TradeLinksSchema = z.object({
  higherTimeframeChart: z.string().optional(),
  entryChart: z.string().optional(),
  exitChart: z.string().optional(),
  outcomeChart: z.string().optional(),
  screenshots: z.array(z.string()).default([]),
});
export type TradeLinks = z.infer<typeof TradeLinksSchema>;

/**
 * The Trade record. Every field beyond the identifying/relational core is
 * optional by design (per the platform requirement that trade data entry
 * never blocks on fields a given user doesn't track) — completeness is
 * encouraged through UI affordances and AI suggestions, never enforced by
 * the schema. `customFields` carries anything a user defines beyond this
 * baseline via CustomFieldDefinition, so the schema never needs to change
 * to support a new tracked attribute.
 */
export const TradeSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  brokerId: z.string().optional(),
  propFirmId: z.string().optional(),
  challengePhase: z.string().optional(),

  // Instrument & context
  instrument: z.string().min(1),
  assetClass: z.string(),
  session: z.string().optional(),
  marketCondition: z.string().optional(),
  timeframe: z.string().optional(),

  // Direction & timing
  direction: TradeDirectionSchema,
  entryTime: z.string().datetime().optional(),
  exitTime: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),

  // Prices & sizing
  entryPrice: z.number().optional(),
  exitPrice: z.number().optional(),
  quantity: z.number().default(0),
  contractMultiplier: z.number().optional(),
  currency: z.string().default("USD"),

  // Stop loss
  stopLossPrice: z.number().optional(),
  stopLossPips: z.number().optional(),
  stopLossAmount: z.number().optional(),
  stopLossPercentage: z.number().optional(),
  stopLossReason: z.string().optional(),

  // Take profit — supports multiple scaled-out levels
  takeProfitLevels: z.array(TakeProfitLevelSchema).default([]),

  // Execution frictions
  commission: z.number().default(0),
  swap: z.number().default(0),
  spread: z.number().optional(),
  slippagePrice: z.number().optional(),
  slippageCost: z.number().optional(),

  // Excursion tracking (for MAE/MFE and exit-efficiency analytics)
  maePrice: z.number().optional(),
  maePips: z.number().optional(),
  maeAmount: z.number().optional(),
  maePercentage: z.number().optional(),
  mfePrice: z.number().optional(),
  mfePips: z.number().optional(),
  mfeAmount: z.number().optional(),
  mfePercentage: z.number().optional(),

  // Risk framing
  riskAmount: z.number().optional(),
  rMultiplePlannedOverride: z.number().optional(),

  // Outcome
  status: TradeStatusSchema.default("open"),
  outcome: TradeOutcomeSchema.optional(),
  closedPips: z.number().optional(),

  // Classification
  strategyId: z.string().optional(),
  setupId: z.string().optional(),
  tags: z.array(z.string()).default([]),

  // Psychology & review
  emotionalState: z.array(z.string()).default([]),
  comment: z.string().optional(),
  mistakes: z.array(z.string()).default([]),
  lessons: z.string().optional(),
  rating: z.number().min(1).max(10).optional(),

  // Links & media
  links: TradeLinksSchema.default({ screenshots: [] }),

  // Extensibility — powered by CustomFieldDefinition records
  customFields: z.record(z.string(), z.unknown()).default({}),
});
export type TradeRecord = z.infer<typeof TradeSchema>;

export const CreateTradeInputSchema = TradeSchema.omit({ id: true, createdAt: true, updatedAt: true });
export type CreateTradeInput = z.infer<typeof CreateTradeInputSchema>;

export const UpdateTradeInputSchema = CreateTradeInputSchema.partial();
export type UpdateTradeInput = z.infer<typeof UpdateTradeInputSchema>;
