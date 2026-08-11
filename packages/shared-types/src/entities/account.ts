import { z } from "zod";

export const AccountTypeSchema = z.enum([
  "live",
  "demo",
  "prop_evaluation",
  "prop_funded",
  "backtest",
  "forward_test",
  "custom",
]);
export type AccountType = z.infer<typeof AccountTypeSchema>;

export const AccountStatusSchema = z.enum(["active", "passed", "failed", "breached", "paused", "archived"]);
export type AccountStatus = z.infer<typeof AccountStatusSchema>;

export const PayoutSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  grossAmount: z.number(),
  splitPercentage: z.number().min(0).max(100),
  netAmount: z.number(),
  payoutDate: z.string().datetime(),
  certificateUrl: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.string().datetime(),
});
export type PayoutRecord = z.infer<typeof PayoutSchema>;

export const TradingAccountSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string().min(1),
  type: AccountTypeSchema,
  broker: z.string().optional(),
  propFirm: z.string().optional(),
  platform: z.string().optional(),
  startingBalance: z.number(),
  currency: z.string().default("USD"),
  challengePhase: z.string().optional(),
  status: AccountStatusSchema.default("active"),
  ruleSetId: z.string().optional(),
  timezone: z.string().default("UTC"),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  archivedAt: z.string().datetime().optional(),
});
export type TradingAccountRecord = z.infer<typeof TradingAccountSchema>;

export const CreateAccountInputSchema = TradingAccountSchema.omit({ id: true, createdAt: true, updatedAt: true });
export type CreateAccountInput = z.infer<typeof CreateAccountInputSchema>;
