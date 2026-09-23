import { threadIdForSkywrite } from '@/skywrite/threads/skywriteThreadTypes';
import type { SkywriteRecord } from '@/skywrite/types';

import type {
  SavedThreadRecord,
  SavedThreadsState,
  SavedThreadStatus,
  ThreadReflectionRecord,
} from '@/skywrite/savedThreads/savedThreadTypes';
import {
  reflectionIdFor,
  savedThreadIdFor,
} from '@/skywrite/savedThreads/savedThreadTypes';

function touch(state: SavedThreadsState, now: number): SavedThreadsState {
  return { ...state, updatedAt: now };
}

export function findSavedThread(
  state: SavedThreadsState,
  ownerUserId: string,
  skywriteId: string,
): SavedThreadRecord | undefined {
  const id = savedThreadIdFor(ownerUserId, skywriteId);
  return state.savedThreads.find((entry) => entry.savedThreadId === id);
}

export function saveSkywriteThread(input: {
  state: SavedThreadsState;
  ownerUserId: string;
  skywrite: SkywriteRecord & { authorId: string };
  now?: number;
}): { state: SavedThreadsState; saved: SavedThreadRecord; duplicate: boolean } {
  const now = input.now ?? Date.now();
  const existing = findSavedThread(input.state, input.ownerUserId, input.skywrite.id);
  if (existing) {
    if (existing.status === 'archived') {
      const restored: SavedThreadRecord = {
        ...existing,
        status: 'active',
        archivedAt: null,
        lastVisitedAt: now,
        updatedAt: now,
      };
      const savedThreads = input.state.savedThreads.map((entry) =>
        entry.savedThreadId === restored.savedThreadId ? restored : entry,
      );
      return {
        state: touch({ ...input.state, savedThreads }, now),
        saved: restored,
        duplicate: false,
      };
    }
    const touched: SavedThreadRecord = { ...existing, lastVisitedAt: now, updatedAt: now };
    const savedThreads = input.state.savedThreads.map((entry) =>
      entry.savedThreadId === touched.savedThreadId ? touched : entry,
    );
    return {
      state: touch({ ...input.state, savedThreads }, now),
      saved: touched,
      duplicate: true,
    };
  }

  const saved: SavedThreadRecord = {
    savedThreadId: savedThreadIdFor(input.ownerUserId, input.skywrite.id),
    ownerUserId: input.ownerUserId,
    skywriteId: input.skywrite.id,
    threadId: threadIdForSkywrite(input.skywrite.id),
    skyAreaId: input.skywrite.skyAreaId ?? null,
    originalAuthorId: input.skywrite.authorId,
    visibilitySnapshot: input.skywrite.visibility,
    savedAt: now,
    lastVisitedAt: now,
    visitCount: 0,
    archivedAt: null,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  };
  return {
    state: touch(
      { ...input.state, savedThreads: [...input.state.savedThreads, saved] },
      now,
    ),
    saved,
    duplicate: false,
  };
}

export function archiveSavedThread(
  state: SavedThreadsState,
  savedThreadId: string,
  now = Date.now(),
): SavedThreadsState {
  const savedThreads = state.savedThreads.map((entry) => {
    if (entry.savedThreadId !== savedThreadId) return entry;
    return {
      ...entry,
      status: 'archived' as SavedThreadStatus,
      archivedAt: now,
      updatedAt: now,
    };
  });
  return touch({ ...state, savedThreads }, now);
}

export function restoreSavedThread(
  state: SavedThreadsState,
  savedThreadId: string,
  now = Date.now(),
): SavedThreadsState {
  const savedThreads = state.savedThreads.map((entry) => {
    if (entry.savedThreadId !== savedThreadId) return entry;
    return {
      ...entry,
      status: 'active' as SavedThreadStatus,
      archivedAt: null,
      lastVisitedAt: now,
      updatedAt: now,
    };
  });
  return touch({ ...state, savedThreads }, now);
}

/** Unsave hides from Saved; reflections remain unless explicitly purged. */
export function unsaveThread(
  state: SavedThreadsState,
  savedThreadId: string,
  options?: { purgeReflections?: boolean },
  now = Date.now(),
): SavedThreadsState {
  const savedThreads = state.savedThreads.filter((entry) => entry.savedThreadId !== savedThreadId);
  let reflections = state.reflections;
  if (options?.purgeReflections) {
    reflections = reflections.filter((entry) => entry.savedThreadId !== savedThreadId);
  }
  return touch({ ...state, savedThreads, reflections }, now);
}

export function markSavedThreadVisited(
  state: SavedThreadsState,
  savedThreadId: string,
  now = Date.now(),
): SavedThreadsState {
  const savedThreads = state.savedThreads.map((entry) =>
    entry.savedThreadId === savedThreadId
      ? {
          ...entry,
          lastVisitedAt: now,
          visitCount: (entry.visitCount ?? 0) + 1,
          updatedAt: now,
        }
      : entry,
  );
  return touch({ ...state, savedThreads }, now);
}

export function addThreadReflection(input: {
  state: SavedThreadsState;
  savedThreadId: string;
  authorUserId: string;
  body: string;
  momentKind?: ThreadReflectionRecord['momentKind'];
  microChoice?: ThreadReflectionRecord['microChoice'];
  audioUri?: string | null;
  audioDurationMs?: number | null;
  emotionalTags?: ThreadReflectionRecord['emotionalTags'];
  sourceResponseId?: string;
  sourceContributionId?: string;
  now?: number;
}): { state: SavedThreadsState; reflection: ThreadReflectionRecord } {
  const now = input.now ?? Date.now();
  const reflection: ThreadReflectionRecord = {
    reflectionId: reflectionIdFor(input.savedThreadId, now),
    savedThreadId: input.savedThreadId,
    authorUserId: input.authorUserId,
    body: input.body.trim(),
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    visibility: 'private',
    momentKind: input.momentKind ?? 'freeform',
    microChoice: input.microChoice,
    audioUri: input.audioUri ?? null,
    audioDurationMs: input.audioDurationMs ?? null,
    emotionalTags: input.emotionalTags,
    sourceResponseId: input.sourceResponseId,
    sourceContributionId: input.sourceContributionId,
  };
  const reflections = [...input.state.reflections, reflection];
  const savedThreads = input.state.savedThreads.map((entry) =>
    entry.savedThreadId === input.savedThreadId
      ? { ...entry, lastVisitedAt: now, updatedAt: now }
      : entry,
  );
  return {
    state: touch({ ...input.state, reflections, savedThreads }, now),
    reflection,
  };
}

export function updateThreadReflection(
  state: SavedThreadsState,
  reflectionId: string,
  body: string,
  now = Date.now(),
): SavedThreadsState {
  const reflections = state.reflections.map((entry) =>
    entry.reflectionId === reflectionId && !entry.deletedAt
      ? { ...entry, body: body.trim(), updatedAt: now }
      : entry,
  );
  return touch({ ...state, reflections }, now);
}

export function deleteThreadReflection(
  state: SavedThreadsState,
  reflectionId: string,
  now = Date.now(),
): SavedThreadsState {
  const reflections = state.reflections.map((entry) =>
    entry.reflectionId === reflectionId
      ? { ...entry, deletedAt: now, updatedAt: now }
      : entry,
  );
  return touch({ ...state, reflections }, now);
}

export function activeReflectionsForThread(
  state: SavedThreadsState,
  savedThreadId: string,
): ThreadReflectionRecord[] {
  return state.reflections
    .filter(
      (entry) => entry.savedThreadId === savedThreadId && entry.deletedAt == null && entry.body.trim(),
    )
    .sort((a, b) => a.createdAt - b.createdAt);
}

export function latestReflectionAt(
  state: SavedThreadsState,
  savedThreadId: string,
): number | null {
  const list = activeReflectionsForThread(state, savedThreadId);
  if (list.length === 0) return null;
  return list[list.length - 1]!.updatedAt;
}
