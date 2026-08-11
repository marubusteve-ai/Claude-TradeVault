export interface DomainEvent<TPayload = unknown> {
  type: string;
  occurredAt: string;
  payload: TPayload;
}

export interface TradeClosedPayload {
  tradeId: string;
  accountId: string;
  netPnL: number;
}
export interface RuleViolatedPayload {
  accountId: string;
  ruleId: string;
  severity: "warning" | "breach";
  detail: string;
}
export interface DrawdownThresholdBreachedPayload {
  accountId: string;
  currentDrawdownPct: number;
  thresholdPct: number;
}
export interface PayoutRecordedPayload {
  accountId: string;
  payoutId: string;
  netAmount: number;
}

export const DomainEventType = {
  TradeClosed: "trade.closed",
  RuleViolated: "rule.violated",
  DrawdownThresholdBreached: "drawdown.threshold_breached",
  PayoutRecorded: "payout.recorded",
} as const;

export function createEvent<T>(type: string, payload: T): DomainEvent<T> {
  return { type, occurredAt: new Date().toISOString(), payload };
}

/**
 * Port implemented by infrastructure (in-process emitter on the client,
 * queue/pubsub on the server). Everything reactive in the product —
 * rule-violation alerts, the notification bell, AI mistake-pattern
 * re-scans, weekly review generation — subscribes here rather than being
 * wired directly into the code path that changes the data, which is what
 * keeps those features additive instead of invasive.
 */
export interface EventBus {
  publish<T>(event: DomainEvent<T>): void | Promise<void>;
  subscribe<T>(type: string, handler: (event: DomainEvent<T>) => void): () => void;
}
