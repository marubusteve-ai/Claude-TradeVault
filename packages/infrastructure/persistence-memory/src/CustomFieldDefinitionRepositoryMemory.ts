import type { CustomFieldDefinitionRepository } from "@trading-os/domain";
import type { CustomFieldDefinitionRecord } from "@trading-os/shared-types";

export class CustomFieldDefinitionRepositoryMemory implements CustomFieldDefinitionRepository {
  private readonly store = new Map<string, CustomFieldDefinitionRecord>();

  constructor(seed: CustomFieldDefinitionRecord[] = []) {
    for (const def of seed) this.store.set(def.id, def);
  }

  async findByUser(userId: string, entityType?: CustomFieldDefinitionRecord["entityType"]): Promise<CustomFieldDefinitionRecord[]> {
    let results = [...this.store.values()].filter((d) => d.userId === userId);
    if (entityType) results = results.filter((d) => d.entityType === entityType);
    return results.sort((a, b) => a.order - b.order);
  }

  async save(definition: CustomFieldDefinitionRecord): Promise<void> {
    this.store.set(definition.id, definition);
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }
}
