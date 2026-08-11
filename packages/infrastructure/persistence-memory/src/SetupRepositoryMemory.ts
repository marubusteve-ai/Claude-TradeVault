import type { SetupRepository } from "@trading-os/domain";
import type { SetupRecord } from "@trading-os/shared-types";

export class SetupRepositoryMemory implements SetupRepository {
  private readonly store = new Map<string, SetupRecord>();

  constructor(seed: SetupRecord[] = []) {
    for (const setup of seed) this.store.set(setup.id, setup);
  }

  async findById(id: string): Promise<SetupRecord | null> {
    return this.store.get(id) ?? null;
  }

  async findByStrategy(strategyId: string): Promise<SetupRecord[]> {
    return [...this.store.values()].filter((s) => s.strategyId === strategyId);
  }

  async save(setup: SetupRecord): Promise<void> {
    this.store.set(setup.id, setup);
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }
}
