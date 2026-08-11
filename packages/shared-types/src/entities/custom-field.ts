import { z } from "zod";

export const CustomFieldTypeSchema = z.enum(["text", "number", "boolean", "select", "multi_select", "date", "url", "rating"]);
export type CustomFieldType = z.infer<typeof CustomFieldTypeSchema>;

/**
 * Defines one user-created field on Trade, TradingAccount, or Strategy.
 * The Trade/Strategy `customFields` map is validated dynamically against
 * the set of CustomFieldDefinition records for that user + entityType,
 * rather than against a static schema — this is how the platform stays
 * "every field editable without code changes."
 */
export const CustomFieldDefinitionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  entityType: z.enum(["trade", "account", "strategy"]),
  label: z.string().min(1),
  type: CustomFieldTypeSchema,
  options: z.array(z.string()).optional(),
  required: z.boolean().default(false),
  defaultValue: z.unknown().optional(),
  order: z.number().int().default(0),
});
export type CustomFieldDefinitionRecord = z.infer<typeof CustomFieldDefinitionSchema>;

export const CreateCustomFieldDefinitionInputSchema = CustomFieldDefinitionSchema.omit({ id: true });
export type CreateCustomFieldDefinitionInput = z.infer<typeof CreateCustomFieldDefinitionInputSchema>;
