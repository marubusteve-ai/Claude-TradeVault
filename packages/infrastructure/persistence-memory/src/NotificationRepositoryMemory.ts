import type { NotificationRepository } from "@trading-os/domain";
import type { NotificationRecord } from "@trading-os/shared-types";

export class NotificationRepositoryMemory implements NotificationRepository {
  private readonly store = new Map<string, NotificationRecord>();

  constructor(seed: NotificationRecord[] = []) {
    for (const n of seed) this.store.set(n.id, n);
  }

  async findByUser(userId: string, unreadOnly = false): Promise<NotificationRecord[]> {
    let results = [...this.store.values()].filter((n) => n.userId === userId);
    if (unreadOnly) results = results.filter((n) => !n.readAt);
    return results.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async save(notification: NotificationRecord): Promise<void> {
    this.store.set(notification.id, notification);
  }

  async markRead(id: string): Promise<void> {
    const existing = this.store.get(id);
    if (existing) this.store.set(id, { ...existing, readAt: new Date().toISOString() });
  }
}
