import type { PayoutRepository } from "@trading-os/domain";
import type { PayoutRecord } from "@trading-os/shared-types";

export class PayoutRepositoryMemory implements PayoutRepository {
  private readonly store = new Map<string, PayoutRecord>();

  constructor(seed: PayoutRecord[] = []) {
    for (const payout of seed) this.store.set(payout.id, payout);
  }

  async findByAccount(accountId: string): Promise<PayoutRecord[]> {
    return [...this.store.values()]
      .filter((p) => p.accountId === accountId)
      .sort((a, b) => b.payoutDate.localeCompare(a.payoutDate));
  }

  async save(payout: PayoutRecord): Promise<void> {
    this.store.set(payout.id, payout);
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }
}
