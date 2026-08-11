import type { AccountRepository } from "@trading-os/domain";
import type { TradingAccountRecord } from "@trading-os/shared-types";

export class AccountRepositoryMemory implements AccountRepository {
  private readonly store = new Map<string, TradingAccountRecord>();

  constructor(seed: TradingAccountRecord[] = []) {
    for (const account of seed) this.store.set(account.id, account);
  }

  async findById(id: string): Promise<TradingAccountRecord | null> {
    return this.store.get(id) ?? null;
  }

  async findByUser(userId: string): Promise<TradingAccountRecord[]> {
    return [...this.store.values()].filter((a) => a.userId === userId);
  }

  async save(account: TradingAccountRecord): Promise<void> {
    this.store.set(account.id, account);
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }
}
