import { z } from "zod";

export const ChecklistItemSchema = z.object({
  id: z.string(),
  label: z.string().min(1),
  required: z.boolean().default(false),
});
export type ChecklistItem = z.infer<typeof ChecklistItemSchema>;

/**
 * A Strategy is the top-level playbook entry (e.g. "London Breakout").
 * A Setup (below) is an optional child of a Strategy representing a more
 * specific pattern variant (e.g. "London Breakout — Asian range sweep").
 * Both share the same checklist-driven shape, which is what the grading
 * engine in the Playbook module scores trades against.
 */
export const StrategySchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  assetClasses: z.array(z.string()).default([]),
  entryRules: z.array(ChecklistItemSchema).default([]),
  exitRules: z.array(ChecklistItemSchema).default([]),
  confirmationChecklist: z.array(ChecklistItemSchema).default([]),
  invalidationRules: z.array(ChecklistItemSchema).default([]),
  exampleScreenshots: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type StrategyRecord = z.infer<typeof StrategySchema>;

export const SetupSchema = StrategySchema.extend({
  strategyId: z.string().optional(),
});
export type SetupRecord = z.infer<typeof SetupSchema>;

export const CreateStrategyInputSchema = StrategySchema.omit({ id: true, createdAt: true, updatedAt: true });
export type CreateStrategyInput = z.infer<typeof CreateStrategyInputSchema>;
