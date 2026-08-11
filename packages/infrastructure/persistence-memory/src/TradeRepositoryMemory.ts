import type { TradeRepository, TradeQueryFilter } from "@trading-os/domain";
import type { TradeRecord } from "@trading-os/shared-types";

/**
 * In-memory implementation of the TradeRepository port. This is the third
 * concrete implementation of the exact same interface Postgres and
 * IndexedDB satisfy — proof the port is a real abstraction boundary, not
 * just a Postgres-shaped interface with an offline afterthought.
 *
 * Two legitimate uses, not one throwaway hack: application-layer unit
 * tests construct one of these instead of standing up a database (see
 * ARCHITECTURE.md §9), and apps/web's demo mode seeds one with generated
 * trades so the Dashboard is fully interactive with zero backend running.
 */
export class TradeRepositoryMemory implements TradeRepository {
  private readonly store = new Map<string, TradeRecord>();

  constructor(seed: TradeRecord[] = []) {
    for (const trade of seed) this.store.set(trade.id, trade);
  }

  async findById(id: string): Promise<TradeRecord | null> {
    return this.store.get(id) ?? null;
  }

  async findByAccount(accountId: string, filter?: TradeQueryFilter): Promise<TradeRecord[]> {
    let results = [...this.store.values()].filter((t) => t.accountId === accountId);

    if (filter?.status) results = results.filter((t) => t.status === filter.status);
    if (filter?.strategyId) results = results.filter((t) => t.strategyId === filter.strategyId);
    if (filter?.setupId) results = results.filter((t) => t.setupId === filter.setupId);
    if (filter?.from) results = results.filter((t) => !t.exitTime || t.exitTime >= filter.from!);
    if (filter?.to) results = results.filter((t) => !t.exitTime || t.exitTime <= filter.to!);
    if (filter?.tags?.length) results = results.filter((t) => filter.tags!.some((tag) => t.tags.includes(tag)));

    return results.sort((a, b) => (a.exitTime ?? a.createdAt).localeCompare(b.exitTime ?? b.createdAt));
  }

  async save(trade: TradeRecord): Promise<void> {
    this.store.set(trade.id, trade);
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }

  /** Test/demo convenience — not part of the TradeRepository port. */
  seedMany(trades: TradeRecord[]): void {
    for (const trade of trades) this.store.set(trade.id, trade);
  }
}
