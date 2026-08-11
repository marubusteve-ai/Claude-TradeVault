import type { PropFirmRuleSetRepository } from "@trading-os/domain";
import type { PropFirmRuleSetRecord } from "@trading-os/shared-types";

export class PropFirmRuleSetRepositoryMemory implements PropFirmRuleSetRepository {
  private readonly store = new Map<string, PropFirmRuleSetRecord>();

  constructor(seed: PropFirmRuleSetRecord[] = []) {
    for (const ruleSet of seed) this.store.set(ruleSet.id, ruleSet);
  }

  async findById(id: string): Promise<PropFirmRuleSetRecord | null> {
    return this.store.get(id) ?? null;
  }

  async findByUser(userId: string): Promise<PropFirmRuleSetRecord[]> {
    return [...this.store.values()].filter((r) => r.userId === userId);
  }

  async save(ruleSet: PropFirmRuleSetRecord): Promise<void> {
    this.store.set(ruleSet.id, ruleSet);
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }
}
