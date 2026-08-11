import type { TradeRepository, TradeQueryFilter } from "@trading-os/domain";
import type { TradeRecord } from "@trading-os/shared-types";
import { db } from "../db";
import { enqueueSync } from "../sync/SyncQueue";

/**
 * Client-side implementation of the TradeRepository port, backed by
 * IndexedDB. Satisfies the exact same interface the server-side Postgres
 * repository does, so every application-layer use case runs unmodified
 * whether it executes against the offline-first local cache or directly
 * against the source of truth.
 */
export class TradeRepositoryIndexedDB implements TradeRepository {
  async findById(id: string): Promise<TradeRecord | null> {
    const trade = await db.trades.get(id);
    return trade ?? null;
  }

  async findByAccount(accountId: string, filter?: TradeQueryFilter): Promise<TradeRecord[]> {
    let results = await db.trades.where("accountId").equals(accountId).toArray();

    if (filter?.status) results = results.filter((t: TradeRecord) => t.status === filter.status);
    if (filter?.strategyId) results = results.filter((t: TradeRecord) => t.strategyId === filter.strategyId);
    if (filter?.setupId) results = results.filter((t: TradeRecord) => t.setupId === filter.setupId);
    if (filter?.from) results = results.filter((t: TradeRecord) => !t.exitTime || t.exitTime >= filter.from!);
    if (filter?.to) results = results.filter((t: TradeRecord) => !t.exitTime || t.exitTime <= filter.to!);
    if (filter?.tags?.length) results = results.filter((t: TradeRecord) => filter.tags!.some((tag) => t.tags.includes(tag)));

    return results;
  }

  async save(trade: TradeRecord): Promise<void> {
    const existing = await db.trades.get(trade.id);
    await db.trades.put(trade);
    await enqueueSync({
      entityType: "trade",
      entityId: trade.id,
      operation: existing ? "update" : "create",
      payload: trade,
      createdAt: new Date().toISOString(),
      attempts: 0,
    });
  }

  async delete(id: string): Promise<void> {
    await db.trades.delete(id);
    await enqueueSync({
      entityType: "trade",
      entityId: id,
      operation: "delete",
      payload: null,
      createdAt: new Date().toISOString(),
      attempts: 0,
    });
  }
}
