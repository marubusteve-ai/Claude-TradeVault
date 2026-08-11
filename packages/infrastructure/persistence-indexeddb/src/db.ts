import Dexie, { type Table } from "dexie";
import type { TradeRecord, TradingAccountRecord, PropFirmRuleSetRecord } from "@trading-os/shared-types";

export interface SyncQueueItem {
  id?: number;
  entityType: "trade" | "account" | "ruleSet";
  entityId: string;
  operation: "create" | "update" | "delete";
  payload: unknown;
  createdAt: string;
  attempts: number;
  lastError?: string;
}

/**
 * Local-first store. Every write from the UI lands here first — instant
 * feedback, full offline capability, zero perceived latency — and the
 * sync engine (sync/SyncQueue.ts) drains the outbox against the backend
 * API whenever connectivity allows. Postgres remains the ultimate source
 * of truth for multi-device conflicts; this database is a fast local
 * cache-plus-outbox, not an independent data store.
 */
export class TradeOSDatabase extends Dexie {
  trades!: Table<TradeRecord, string>;
  accounts!: Table<TradingAccountRecord, string>;
  ruleSets!: Table<PropFirmRuleSetRecord, string>;
  syncQueue!: Table<SyncQueueItem, number>;

  constructor() {
    super("trade-os");
    this.version(1).stores({
      trades: "id, accountId, status, strategyId, setupId, exitTime, updatedAt",
      accounts: "id, userId, status, updatedAt",
      ruleSets: "id, userId",
      syncQueue: "++id, entityType, entityId, createdAt",
    });
  }
}

export const db = new TradeOSDatabase();
