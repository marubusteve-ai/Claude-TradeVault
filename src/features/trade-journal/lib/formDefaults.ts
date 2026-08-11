import type { CreateTradeInput } from "@trading-os/shared-types";
import { ASSET_CLASSES, SESSIONS, MARKET_CONDITIONS, EMOTIONAL_TAGS, MISTAKE_CATEGORIES, TIMEFRAMES } from "@trading-os/shared-types";

export { ASSET_CLASSES, SESSIONS, MARKET_CONDITIONS, EMOTIONAL_TAGS, MISTAKE_CATEGORIES, TIMEFRAMES };

export const TRADE_DIRECTIONS = ["long", "short"] as const;
export const TRADE_STATUSES = ["open", "closed", "partially_closed", "cancelled"] as const;

/** A blank form's starting values. Every optional field starts empty/undefined rather than a placeholder value, per the "every field is genuinely optional" requirement. */
export function getBlankTradeFormValues(accountId: string): CreateTradeInput {
  return {
    accountId,
    instrument: "",
    assetClass: "forex",
    direction: "long",
    quantity: 0,
    currency: "USD",
    takeProfitLevels: [],
    commission: 0,
    swap: 0,
    status: "open",
    tags: [],
    emotionalState: [],
    mistakes: [],
    links: { screenshots: [] },
    customFields: {},
  };
}

export function tradeRecordToFormValues(record: CreateTradeInput): CreateTradeInput {
  // Server actions receive a plain object already shaped like CreateTradeInput —
  // this indirection exists so edit-mode pre-population has one call site to
  // extend later (e.g. once CustomFieldDefinition-driven fields need reshaping).
  return { ...record };
}
