import { z } from "zod";

export const NotificationSeveritySchema = z.enum(["info", "warning", "critical"]);
export type NotificationSeverity = z.infer<typeof NotificationSeveritySchema>;

export const NotificationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.string(), // e.g. "rule_violation", "drawdown_threshold", "goal_reminder"
  title: z.string(),
  body: z.string().optional(),
  severity: NotificationSeveritySchema.default("info"),
  accountId: z.string().optional(),
  readAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
});
export type NotificationRecord = z.infer<typeof NotificationSchema>;

export const CreateNotificationInputSchema = NotificationSchema.omit({ id: true, createdAt: true });
export type CreateNotificationInput = z.infer<typeof CreateNotificationInputSchema>;
