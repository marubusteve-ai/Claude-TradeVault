import type { StrategyRepository } from "@trading-os/domain";
import type { StrategyRecord } from "@trading-os/shared-types";

export class StrategyRepositoryMemory implements StrategyRepository {
  private readonly store = new Map<string, StrategyRecord>();

  constructor(seed: StrategyRecord[] = []) {
    for (const strategy of seed) this.store.set(strategy.id, strategy);
  }

  async findById(id: string): Promise<StrategyRecord | null> {
    return this.store.get(id) ?? null;
  }

  async findByUser(userId: string): Promise<StrategyRecord[]> {
    return [...this.store.values()].filter((s) => s.userId === userId);
  }

  async save(strategy: StrategyRecord): Promise<void> {
    this.store.set(strategy.id, strategy);
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }
}
