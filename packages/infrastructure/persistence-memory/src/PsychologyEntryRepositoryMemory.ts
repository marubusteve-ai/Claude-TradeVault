import type { PsychologyEntryRepository } from "@trading-os/domain";
import type { PsychologyEntryRecord } from "@trading-os/shared-types";

export class PsychologyEntryRepositoryMemory implements PsychologyEntryRepository {
  private readonly store = new Map<string, PsychologyEntryRecord>();

  constructor(seed: PsychologyEntryRecord[] = []) {
    for (const entry of seed) this.store.set(entry.id, entry);
  }

  async findByUser(userId: string, dateRange?: { from: string; to: string }): Promise<PsychologyEntryRecord[]> {
    let results = [...this.store.values()].filter((e) => e.userId === userId);
    if (dateRange) {
      results = results.filter((e) => e.date >= dateRange.from && e.date <= dateRange.to);
    }
    return results.sort((a, b) => a.date.localeCompare(b.date));
  }

  async findByDate(userId: string, date: string): Promise<PsychologyEntryRecord | null> {
    const dayKey = date.slice(0, 10);
    return [...this.store.values()].find((e) => e.userId === userId && e.date.slice(0, 10) === dayKey) ?? null;
  }

  async save(entry: PsychologyEntryRecord): Promise<void> {
    this.store.set(entry.id, entry);
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }
}
