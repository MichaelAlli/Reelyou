import type { SavedThreadRecord } from '@/skywrite/savedThreads/savedThreadTypes';

/** Dev/demo saved thread supplement when user library is sparse — canonical shape only. */
export function interviewFocusFixtureSavedThread(userId: string): SavedThreadRecord | null {
  const focusReady = userId === 'user-michael';
  if (!focusReady) return null;
  const now = Date.now();
  return {
    savedThreadId: 'fixture-saved-interview-thread',
    ownerUserId: userId,
    skywriteId: 'fixture-sw-interview',
    threadId: 'fixture-thread-interview',
    skyAreaId: 'career',
    originalAuthorId: 'orbit-jordan',
    visibilitySnapshot: 'public',
    savedAt: now - 1000 * 60 * 60 * 24 * 12,
    lastVisitedAt: now - 1000 * 60 * 60 * 24 * 2,
    visitCount: 3,
    archivedAt: null,
    status: 'active',
    createdAt: now - 1000 * 60 * 60 * 24 * 12,
    updatedAt: now - 1000 * 60 * 60 * 24 * 2,
  };
}

export const FIXTURE_SAVED_THREAD_CORPUS: Record<string, string> = {
  'fixture-saved-interview-thread':
    'Interview preparation confidence questions answers sales role career transition',
};
