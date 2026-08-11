import { db, type SyncQueueItem } from "../db";

export async function enqueueSync(item: Omit<SyncQueueItem, "id">): Promise<void> {
  await db.syncQueue.add(item);
}

export interface SyncTransport {
  push(items: SyncQueueItem[]): Promise<{ succeededIds: number[]; failedIds: number[] }>;
}

const MAX_ATTEMPTS = 5;

/**
 * Drains the local outbox against the backend API. Called on network
 * reconnect and on an interval while online. A failing item backs off and
 * retries rather than blocking the rest of the queue behind it; items that
 * exceed MAX_ATTEMPTS stop being retried automatically and surface in the
 * "sync issues" indicator for the user to review, rather than retrying
 * forever against a payload that will never succeed.
 */
export async function drainSyncQueue(transport: SyncTransport): Promise<void> {
  const pending: SyncQueueItem[] = await db.syncQueue.orderBy("createdAt").toArray();
  const eligible = pending.filter((item: SyncQueueItem) => item.attempts < MAX_ATTEMPTS);
  if (eligible.length === 0) return;

  const { succeededIds, failedIds } = await transport.push(eligible);

  if (succeededIds.length) {
    await db.syncQueue.bulkDelete(succeededIds);
  }
  if (failedIds.length) {
    await Promise.all(
      failedIds.map((id) => {
        const item = pending.find((p: SyncQueueItem) => p.id === id);
        return db.syncQueue.update(id, { attempts: (item?.attempts ?? 0) + 1 });
      })
    );
  }
}

export async function getPendingSyncCount(): Promise<number> {
  return db.syncQueue.count();
}
