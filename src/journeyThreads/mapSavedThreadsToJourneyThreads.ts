import type { JourneyThreadRecord, JourneyThreadMembership } from '@/journeyThreads/journeyThreadTypes';
import type { SavedThreadsState } from '@/skywrite/savedThreads/savedThreadTypes';

/** Preserve Saved Thread data as future manually-curated journey threads — read-only mapping. */
export function mapSavedThreadsToJourneyThreads(
  saved: SavedThreadsState,
): { threads: JourneyThreadRecord[]; memberships: JourneyThreadMembership[] } {
  const threads: JourneyThreadRecord[] = [];
  const memberships: JourneyThreadMembership[] = [];

  for (const entry of saved.savedThreads) {
    const threadId = `jt-from-${entry.savedThreadId}`;
    threads.push({
      id: threadId,
      ownerUserId: entry.ownerUserId,
      title: 'Saved reflection',
      origin: 'saved_thread_migration',
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
      status: entry.status === 'archived' ? 'archived' : 'active',
      skywriteIds: [entry.skywriteId],
      representativeSkywriteId: entry.skywriteId,
    });
    memberships.push({
      threadId,
      skywriteId: entry.skywriteId,
      addedAt: entry.savedAt,
      origin: 'saved_thread_migration',
    });
  }

  return { threads, memberships };
}
