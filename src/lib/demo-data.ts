import { Trade } from "@trading-os/domain";
import type {
  TradeRecord,
  TradingAccountRecord,
  PropFirmRuleSetRecord,
  PayoutRecord,
  StrategyRecord,
  PsychologyEntryRecord,
} from "@trading-os/shared-types";

/** Seeded PRNG (mulberry32) — the demo dataset must be identical across reloads, not re-randomized every visit. */
function mulberry32(seed: number) {
  let s = seed;
  return function random(): number {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface InstrumentProfile {
  symbol: string;
  assetClass: string;
  priceMin: number;
  priceMax: number;
  stopDistance: number;
  contractMultiplier: number;
}

const INSTRUMENTS: InstrumentProfile[] = [
  { symbol: "EURUSD", assetClass: "forex", priceMin: 1.04, priceMax: 1.11, stopDistance: 0.0025, contractMultiplier: 100000 },
  { symbol: "GBPUSD", assetClass: "forex", priceMin: 1.22, priceMax: 1.3, stopDistance: 0.003, contractMultiplier: 100000 },
  { symbol: "XAUUSD", assetClass: "commodities", priceMin: 2550, priceMax: 2750, stopDistance: 6, contractMultiplier: 100 },
  { symbol: "ES", assetClass: "futures", priceMin: 5700, priceMax: 6250, stopDistance: 12, contractMultiplier: 50 },
  { symbol: "NQ", assetClass: "futures", priceMin: 19500, priceMax: 22000, stopDistance: 40, contractMultiplier: 20 },
];

const STRATEGIES: StrategyRecord[] = [
  {
    id: "strat-london-breakout",
    userId: "demo-user",
    name: "London Breakout",
    description: "Fades the Asian range as London liquidity arrives, trading the initial breakout of the overnight high/low.",
    assetClasses: ["forex", "commodities"],
    entryRules: [
      { id: "lb-e1", label: "Asian range clearly defined (min 20 pip range)", required: true },
      { id: "lb-e2", label: "Price breaks Asian high/low with momentum candle", required: true },
      { id: "lb-e3", label: "No major news event within 30 minutes", required: false },
    ],
    exitRules: [
      { id: "lb-x1", label: "First target at 1x Asian range", required: true },
      { id: "lb-x2", label: "Trail remainder using prior swing points", required: false },
    ],
    confirmationChecklist: [
      { id: "lb-c1", label: "Volume/momentum confirms the breakout direction", required: true },
      { id: "lb-c2", label: "No immediate rejection wick back into the range", required: true },
    ],
    invalidationRules: [
      { id: "lb-i1", label: "Price closes back inside the Asian range", required: true },
      { id: "lb-i2", label: "London session already 90 minutes old", required: false },
    ],
    exampleScreenshots: [],
    tags: ["breakout", "session-based"],
    isActive: true,
    createdAt: daysAgoIso(140),
    updatedAt: daysAgoIso(30),
  },
  {
    id: "strat-ny-reversal",
    userId: "demo-user",
    name: "NY Reversal",
    description: "Counter-trend reversal at the New York open, fading a London session move that has run out of momentum.",
    assetClasses: ["forex", "indices"],
    entryRules: [
      { id: "nr-e1", label: "London session showed a clear directional move", required: true },
      { id: "nr-e2", label: "NY open shows divergence or momentum stall", required: true },
    ],
    exitRules: [{ id: "nr-x1", label: "Target the London session origin point", required: true }],
    confirmationChecklist: [{ id: "nr-c1", label: "Rejection candle at key level on lower timeframe", required: true }],
    invalidationRules: [{ id: "nr-i1", label: "New London-direction high/low is made", required: true }],
    exampleScreenshots: [],
    tags: ["reversal", "session-based"],
    isActive: true,
    createdAt: daysAgoIso(140),
    updatedAt: daysAgoIso(60),
  },
  {
    id: "strat-trend-continuation",
    userId: "demo-user",
    name: "Trend Continuation",
    description: "Pullback entries in the direction of an established higher-timeframe trend.",
    assetClasses: ["forex", "futures", "crypto"],
    entryRules: [
      { id: "tc-e1", label: "Higher timeframe trend clearly established (HH/HL or LH/LL)", required: true },
      { id: "tc-e2", label: "Pullback to a key moving average or structure level", required: true },
    ],
    exitRules: [{ id: "tc-x1", label: "Scale out at prior swing high/low, trail the rest", required: false }],
    confirmationChecklist: [{ id: "tc-c1", label: "Lower-timeframe higher low/lower high confirms resumption", required: true }],
    invalidationRules: [{ id: "tc-i1", label: "Pullback exceeds 61.8% retracement of the prior leg", required: true }],
    exampleScreenshots: [],
    tags: ["trend-following"],
    isActive: true,
    createdAt: daysAgoIso(140),
    updatedAt: daysAgoIso(10),
  },
  {
    id: "strat-liquidity-sweep",
    userId: "demo-user",
    name: "Liquidity Sweep",
    description: "Trades the reversal after price sweeps obvious stop-loss liquidity beyond a prior high or low.",
    assetClasses: ["forex", "futures"],
    entryRules: [
      { id: "ls-e1", label: "Clear equal highs/lows or obvious liquidity pool identified", required: true },
      { id: "ls-e2", label: "Price wicks through the level then closes back inside", required: true },
    ],
    exitRules: [{ id: "ls-x1", label: "Target the opposite side of the recent range", required: true }],
    confirmationChecklist: [{ id: "ls-c1", label: "Rejection on lower timeframe with increased volume", required: false }],
    invalidationRules: [{ id: "ls-i1", label: "Price closes beyond the swept level on the entry timeframe", required: true }],
    exampleScreenshots: [],
    tags: ["liquidity", "reversal"],
    isActive: true,
    createdAt: daysAgoIso(140),
    updatedAt: daysAgoIso(45),
  },
];
const SESSIONS = ["london", "new_york", "london_ny_overlap", "asia"];
const WIN_EMOTIONS = [["disciplined", "focused"], ["confident", "patient"], ["calm"]];
const LOSS_EMOTIONS = [["anxious", "hesitant"], ["fomo"], ["impatient"], ["disciplined"]];
const MISTAKES = ["early_exit", "moved_stop_loss", "oversized_position", "chased_price"];

export const DEMO_USER_ID = "demo-user";
export const DEMO_ACCOUNT_ID = "demo-account-apex-100k";

function daysAgoIso(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString();
}

export const DEMO_RULE_SET_ID = "ruleset-apex-100k-eval";
export const DEMO_RULE_SET: PropFirmRuleSetRecord = {
  id: DEMO_RULE_SET_ID,
  userId: DEMO_USER_ID,
  name: "Apex Trader Funding — $100K Evaluation",
  firmName: "Apex Trader Funding",
  dailyLossLimit: { type: "percentage", value: 3 },
  maxDrawdown: { type: "percentage", value: 6, drawdownType: "trailing" },
  profitTarget: { type: "percentage", value: 8 },
  minTradingDays: 10,
  maxPositionSize: 15,
  consistencyRule: { maxSingleDayProfitPercentage: 30 },
  newsTradingRestricted: true,
  newsRestrictionWindowMinutes: 5,
  weekendHoldingAllowed: false,
  scalingPlan: [
    { stage: 1, profitRequiredPercentage: 8, balanceIncreasePercentage: 0 },
    { stage: 2, profitRequiredPercentage: 5, balanceIncreasePercentage: 25 },
  ],
  isCustom: false,
  createdAt: daysAgoIso(120),
  updatedAt: daysAgoIso(120),
};

export const DEMO_RULE_SET_2_ID = "ruleset-ftmo-50k-funded";
export const DEMO_RULE_SET_2: PropFirmRuleSetRecord = {
  id: DEMO_RULE_SET_2_ID,
  userId: DEMO_USER_ID,
  name: "FTMO — $50K Funded (Static)",
  firmName: "FTMO",
  dailyLossLimit: { type: "percentage", value: 5 },
  maxDrawdown: { type: "percentage", value: 10, drawdownType: "static" },
  consistencyRule: { maxSingleDayProfitPercentage: 40 },
  newsTradingRestricted: false,
  weekendHoldingAllowed: true,
  scalingPlan: [{ stage: 1, profitRequiredPercentage: 10, balanceIncreasePercentage: 25 }],
  isCustom: false,
  createdAt: daysAgoIso(200),
  updatedAt: daysAgoIso(200),
};

export const DEMO_ACCOUNT: TradingAccountRecord = {
  id: DEMO_ACCOUNT_ID,
  userId: DEMO_USER_ID,
  name: "Apex Funding — $100K Evaluation",
  type: "prop_evaluation",
  broker: "Apex Trader Funding",
  propFirm: "Apex Trader Funding",
  platform: "tradovate",
  startingBalance: 100000,
  currency: "USD",
  challengePhase: "phase_1",
  status: "active",
  ruleSetId: DEMO_RULE_SET_ID,
  timezone: "America/New_York",
  createdAt: daysAgoIso(120),
  updatedAt: daysAgoIso(0),
};

function isWeekday(d: Date): boolean {
  const day = d.getUTCDay();
  return day !== 0 && day !== 6;
}

function pick<T>(arr: readonly T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)]!;
}

/**
 * Generates a deterministic, realistic set of closed trades: ~54% win
 * rate, average winner ~1.8R, average loser ~-1R (a plausible, moderately
 * profitable trader — the kind of dataset that makes every dashboard
 * widget show something meaningful rather than empty/flat charts).
 */
export function generateDemoTrades(count = 68, seed = 42, accountId: string = DEMO_ACCOUNT_ID): TradeRecord[] {
  const rng = mulberry32(seed);
  const trades: TradeRecord[] = [];

  let cursorDaysAgo = 118;
  for (let i = 0; i < count; i++) {
    // Advance the date cursor by 1-3 calendar days per trade, skipping weekends.
    cursorDaysAgo -= 1 + Math.floor(rng() * 3);
    const tradeDate = new Date();
    tradeDate.setUTCDate(tradeDate.getUTCDate() - Math.max(0, cursorDaysAgo));
    while (!isWeekday(tradeDate)) tradeDate.setUTCDate(tradeDate.getUTCDate() + 1);

    const instrument = pick(INSTRUMENTS, rng);
    const direction = rng() > 0.5 ? "long" : "short";
    const strategy = pick(STRATEGIES, rng);
    const session = pick(SESSIONS, rng);

    const entryPrice = instrument.priceMin + rng() * (instrument.priceMax - instrument.priceMin);
    const stopDistance = instrument.stopDistance * (0.7 + rng() * 0.8);
    const stopLossPrice = direction === "long" ? entryPrice - stopDistance : entryPrice + stopDistance;

    const isWin = rng() < 0.54;
    const rMultiple = isWin ? 1.2 + rng() * 1.8 : -(0.6 + rng() * 0.5);
    const priceMove = stopDistance * rMultiple;
    const exitPrice = direction === "long" ? entryPrice + priceMove : entryPrice - priceMove;

    // Risk ~1% of a $100k account per trade, sized off the stop distance.
    const riskAmount = 1000 * (0.6 + rng() * 0.8);
    const quantity = riskAmount / (stopDistance * instrument.contractMultiplier);

    const durationMinutes = session === "asia" ? 20 + rng() * 180 : 8 + rng() * 90;
    const entryTime = new Date(tradeDate);
    entryTime.setUTCHours(13 + Math.floor(rng() * 6), Math.floor(rng() * 60));
    const exitTime = new Date(entryTime.getTime() + durationMinutes * 60_000);

    const mfeAmount = isWin
      ? riskAmount * rMultiple * (1 + rng() * 0.35)
      : riskAmount * (0.05 + rng() * 0.3);
    const maeAmount = isWin ? -(riskAmount * (0.05 + rng() * 0.4)) : -(riskAmount * (0.85 + rng() * 0.3));

    const iso = exitTime.toISOString();
    trades.push({
      id: `demo-trade-${accountId}-${i + 1}`,
      accountId,
      instrument: instrument.symbol,
      assetClass: instrument.assetClass,
      session,
      timeframe: pick(["M5", "M15", "H1"], rng),
      direction,
      entryTime: entryTime.toISOString(),
      exitTime: iso,
      createdAt: iso,
      updatedAt: iso,
      entryPrice,
      exitPrice,
      quantity,
      contractMultiplier: instrument.contractMultiplier,
      currency: "USD",
      stopLossPrice,
      stopLossReason: "Below/above recent structure",
      takeProfitLevels: [],
      commission: 2 + rng() * 6,
      swap: 0,
      maeAmount,
      mfeAmount,
      riskAmount,
      status: "closed",
      strategyId: strategy.id,
      tags: [],
      emotionalState: isWin ? pick(WIN_EMOTIONS, rng) : pick(LOSS_EMOTIONS, rng),
      mistakes: isWin ? [] : rng() > 0.5 ? [pick(MISTAKES, rng)] : [],
      rating: isWin ? 6 + Math.round(rng() * 4) : 3 + Math.round(rng() * 4),
      links: { screenshots: [] },
      customFields: {},
    });
  }

  return trades.sort((a, b) => a.exitTime!.localeCompare(b.exitTime!));
}

export const DEMO_STRATEGIES = STRATEGIES;

// ─────────────────────────────────────────────
// A second account and payout history —
// fleshes out the Accounts & Prop Firm Compliance module (Phase 3).
// ─────────────────────────────────────────────

export const DEMO_ACCOUNT_2_ID = "demo-account-ftmo-50k";
export const DEMO_ACCOUNT_2: TradingAccountRecord = {
  id: DEMO_ACCOUNT_2_ID,
  userId: DEMO_USER_ID,
  name: "FTMO — $50K Funded",
  type: "prop_funded",
  broker: "FTMO",
  propFirm: "FTMO",
  platform: "mt5",
  startingBalance: 50000,
  currency: "USD",
  challengePhase: "funded",
  status: "active",
  ruleSetId: DEMO_RULE_SET_2_ID,
  timezone: "America/New_York",
  createdAt: daysAgoIso(200),
  updatedAt: daysAgoIso(5),
};

export const DEMO_PAYOUTS: PayoutRecord[] = [
  {
    id: "payout-1",
    accountId: DEMO_ACCOUNT_2_ID,
    grossAmount: 3200,
    splitPercentage: 80,
    netAmount: 2560,
    payoutDate: daysAgoIso(45),
    notes: "First payout after funded verification period",
    createdAt: daysAgoIso(45),
  },
  {
    id: "payout-2",
    accountId: DEMO_ACCOUNT_2_ID,
    grossAmount: 2150,
    splitPercentage: 80,
    netAmount: 1720,
    payoutDate: daysAgoIso(14),
    notes: "",
    createdAt: daysAgoIso(14),
  },
];

export const DEMO_RULE_SETS = [DEMO_RULE_SET, DEMO_RULE_SET_2];
export const DEMO_ACCOUNTS = [DEMO_ACCOUNT, DEMO_ACCOUNT_2];

// ─────────────────────────────────────────────
// Psychology entries — deliberately correlated with each day's actual net
// P&L (with realistic noise, not a perfect 1:1 mapping) so the Psychology
// module's discipline-vs-performance correlation shows a genuine signal
// rather than random data with nothing to find.
// ─────────────────────────────────────────────

export function generateDemoPsychologyEntries(trades: TradeRecord[], seed = 77): PsychologyEntryRecord[] {
  const rng = mulberry32(seed);
  const clamp = (v: number) => Math.min(10, Math.max(1, Math.round(v)));
  const noise = () => (rng() - 0.5) * 4;

  const netPnLByDay = new Map<string, number>();
  for (const record of trades) {
    if (!record.exitTime) continue;
    const day = record.exitTime.slice(0, 10);
    const pnl = Trade.fromRecord(record).netPnL?.toMajor() ?? 0;
    netPnLByDay.set(day, (netPnLByDay.get(day) ?? 0) + pnl);
  }

  const entries: PsychologyEntryRecord[] = [];
  let index = 0;
  for (const [day, pnl] of [...netPnLByDay.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    index += 1;
    const base = pnl > 0 ? 7 : 4; // good days trend toward higher self-ratings, bad days lower — noise keeps it from being a perfect signal
    const timestamp = `${day}T20:00:00.000Z`;

    entries.push({
      id: `demo-psych-${index}`,
      userId: DEMO_USER_ID,
      date: timestamp,
      mood: clamp(base + noise()),
      confidence: clamp(base + noise()),
      stress: clamp(11 - base + noise()),
      discipline: clamp(base + noise()),
      patience: clamp(base + noise()),
      ruleAdherencePercentage: clamp(base + noise()) * 10,
      linkedTradeIds: [],
      tags: [],
      createdAt: timestamp,
    });
  }

  return entries;
}
