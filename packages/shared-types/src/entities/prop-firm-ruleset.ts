import { z } from "zod";
import { ThresholdSchema } from "../value-objects";

/**
 * A prop-firm rule set is pure data. Onboarding a new firm — or a firm
 * changing its terms — is a matter of creating/editing a record through the
 * settings UI, never a code change. ComplianceEvaluator (in @trading-os/domain)
 * consumes this shape generically.
 */
export const PropFirmRuleSetSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string().min(1), // e.g. "FTMO 100k Two-Step"
  firmName: z.string().optional(),

  dailyLossLimit: ThresholdSchema.optional(),
  weeklyLossLimit: ThresholdSchema.optional(),
  monthlyLossLimit: ThresholdSchema.optional(),

  maxDrawdown: ThresholdSchema.extend({
    drawdownType: z.enum(["static", "trailing", "trailing_to_initial"]),
  }).optional(),

  profitTarget: ThresholdSchema.optional(),
  minTradingDays: z.number().int().nonnegative().optional(),
  maxPositionSize: z.number().positive().optional(),

  consistencyRule: z
    .object({
      maxSingleDayProfitPercentage: z.number().min(0).max(100),
    })
    .optional(),

  newsTradingRestricted: z.boolean().default(false),
  newsRestrictionWindowMinutes: z.number().int().nonnegative().optional(),
  weekendHoldingAllowed: z.boolean().default(true),

  scalingPlan: z
    .array(
      z.object({
        stage: z.number().int(),
        profitRequiredPercentage: z.number(),
        balanceIncreasePercentage: z.number(),
      })
    )
    .default([]),

  isCustom: z.boolean().default(true),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type PropFirmRuleSetRecord = z.infer<typeof PropFirmRuleSetSchema>;

export const CreatePropFirmRuleSetInputSchema = PropFirmRuleSetSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type CreatePropFirmRuleSetInput = z.infer<typeof CreatePropFirmRuleSetInputSchema>;
