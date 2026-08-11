import { z } from "zod";

export const DateRangeSchema = z
  .object({
    from: z.string().datetime(),
    to: z.string().datetime(),
  })
  .refine((r: { from: string; to: string }) => new Date(r.from).getTime() <= new Date(r.to).getTime(), {
    message: "DateRange.from must be before DateRange.to",
  });
export type DateRange = z.infer<typeof DateRangeSchema>;

export const SUPPORTED_CURRENCIES = ["USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "NZD"] as const;
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

/** A generic threshold used by rule engines: either a percentage of an account basis, or a fixed currency amount. */
export const ThresholdSchema = z.object({
  type: z.enum(["percentage", "fixed"]),
  value: z.number().nonnegative(),
});
export type Threshold = z.infer<typeof ThresholdSchema>;
