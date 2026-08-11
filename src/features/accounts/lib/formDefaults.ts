import type { CreateAccountInput, CreatePropFirmRuleSetInput } from "@trading-os/shared-types";
import { DEMO_USER_ID } from "@/lib/demo-data";

export function getBlankAccountFormValues(): CreateAccountInput {
  return {
    userId: DEMO_USER_ID,
    name: "",
    type: "live",
    startingBalance: 0,
    currency: "USD",
    status: "active",
    timezone: "UTC",
  };
}

export function getBlankRuleSetFormValues(): CreatePropFirmRuleSetInput {
  return {
    userId: DEMO_USER_ID,
    name: "",
    newsTradingRestricted: false,
    weekendHoldingAllowed: true,
    scalingPlan: [],
    isCustom: true,
  };
}

/** Starting points for the rule set builder — plain data users then edit, not separate hardcoded code paths per firm. */
export const RULE_SET_TEMPLATES: { label: string; values: Partial<CreatePropFirmRuleSetInput> }[] = [
  {
    label: "Two-step evaluation (8% / 5% targets, trailing DD)",
    values: {
      dailyLossLimit: { type: "percentage", value: 5 },
      maxDrawdown: { type: "percentage", value: 10, drawdownType: "trailing" },
      profitTarget: { type: "percentage", value: 8 },
      minTradingDays: 10,
      consistencyRule: { maxSingleDayProfitPercentage: 30 },
    },
  },
  {
    label: "Instant funding (static DD, no profit target)",
    values: {
      dailyLossLimit: { type: "percentage", value: 4 },
      maxDrawdown: { type: "percentage", value: 8, drawdownType: "static" },
      consistencyRule: { maxSingleDayProfitPercentage: 25 },
    },
  },
  {
    label: "Futures evaluation (trailing to initial balance)",
    values: {
      dailyLossLimit: { type: "fixed", value: 1000 },
      maxDrawdown: { type: "fixed", value: 3000, drawdownType: "trailing_to_initial" },
      profitTarget: { type: "fixed", value: 6000 },
      minTradingDays: 7,
    },
  },
];
