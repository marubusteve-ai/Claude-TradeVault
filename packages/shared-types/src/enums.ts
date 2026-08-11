/**
 * Centralized literal-union vocabularies. These back every dropdown, filter
 * chip, and grouping control in the product — add a value here and it
 * propagates everywhere it's used, with no other code changes required.
 * Values a specific user adds themselves (custom sessions, custom mistake
 * tags, etc.) live in the database as plain strings; these lists are the
 * curated defaults every new workspace starts with.
 */

export const ASSET_CLASSES = [
  "forex",
  "futures",
  "stocks",
  "options",
  "crypto",
  "indices",
  "commodities",
  "bonds",
  "custom",
] as const;
export type AssetClass = (typeof ASSET_CLASSES)[number];

export const SESSIONS = ["asia", "london", "new_york", "london_ny_overlap", "custom"] as const;
export type Session = (typeof SESSIONS)[number];

export const MARKET_CONDITIONS = [
  "trending_up",
  "trending_down",
  "ranging",
  "high_volatility",
  "low_volatility",
  "news_driven",
  "custom",
] as const;
export type MarketCondition = (typeof MARKET_CONDITIONS)[number];

export const EMOTIONAL_TAGS = [
  "confident",
  "disciplined",
  "calm",
  "focused",
  "patient",
  "anxious",
  "fomo",
  "revenge",
  "greedy",
  "fearful",
  "impatient",
  "hesitant",
  "overconfident",
  "bored",
  "tilted",
] as const;
export type EmotionalTag = (typeof EMOTIONAL_TAGS)[number];

export const MISTAKE_CATEGORIES = [
  "no_stop_loss",
  "moved_stop_loss",
  "early_exit",
  "late_exit",
  "oversized_position",
  "revenge_trade",
  "fomo_entry",
  "ignored_plan",
  "overtrading",
  "no_confirmation",
  "wrong_session",
  "chased_price",
  "averaged_down",
] as const;
export type MistakeCategory = (typeof MISTAKE_CATEGORIES)[number];

export const PLATFORMS = [
  "mt4",
  "mt5",
  "ctrader",
  "tradingview",
  "ninjatrader",
  "rithmic",
  "thinkorswim",
  "interactive_brokers",
  "tradovate",
  "custom",
] as const;
export type Platform = (typeof PLATFORMS)[number];

export const TIMEFRAMES = ["M1", "M5", "M15", "M30", "H1", "H4", "D1", "W1", "MN1"] as const;
export type Timeframe = (typeof TIMEFRAMES)[number];
