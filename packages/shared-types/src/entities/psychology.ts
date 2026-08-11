import { z } from "zod";

export const PsychologyEntrySchema = z.object({
  id: z.string(),
  userId: z.string(),
  date: z.string().datetime(),
  mood: z.number().min(1).max(10).optional(),
  confidence: z.number().min(1).max(10).optional(),
  stress: z.number().min(1).max(10).optional(),
  discipline: z.number().min(1).max(10).optional(),
  patience: z.number().min(1).max(10).optional(),
  ruleAdherencePercentage: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
  linkedTradeIds: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  createdAt: z.string().datetime(),
});
export type PsychologyEntryRecord = z.infer<typeof PsychologyEntrySchema>;

export const CreatePsychologyEntryInputSchema = PsychologyEntrySchema.omit({ id: true, createdAt: true });
export type CreatePsychologyEntryInput = z.infer<typeof CreatePsychologyEntryInputSchema>;
