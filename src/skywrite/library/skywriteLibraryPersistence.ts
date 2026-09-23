import AsyncStorage from '@react-native-async-storage/async-storage';

import type { SkywriteDeletionTombstone } from '@/skywrite/lifecycle/skywriteContentLifecycleTypes';
import {
  EMPTY_SKYWRITE_LIBRARY_STATE,
  type SkywriteLibraryState,
} from '@/skywrite/library/skywriteLibraryTypes';

const STORAGE_KEY = '@reellyou/skywrite-library';

function normalize(raw: unknown): SkywriteLibraryState {
  if (!raw || typeof raw !== 'object') return EMPTY_SKYWRITE_LIBRARY_STATE;
  const entry = raw as Partial<SkywriteLibraryState>;
  const archivedAtBySkywriteId =
    entry.archivedAtBySkywriteId && typeof entry.archivedAtBySkywriteId === 'object'
      ? { ...entry.archivedAtBySkywriteId }
      : {};
  const deletionTombstonesBySkywriteId: Record<string, SkywriteDeletionTombstone> = {};
  if (entry.deletionTombstonesBySkywriteId && typeof entry.deletionTombstonesBySkywriteId === 'object') {
    for (const [id, rawTombstone] of Object.entries(entry.deletionTombstonesBySkywriteId)) {
      if (!rawTombstone || typeof rawTombstone !== 'object') continue;
      const tomb = rawTombstone as Partial<SkywriteDeletionTombstone>;
      if (typeof tomb.skywriteId !== 'string' || typeof tomb.ownerAuthorId !== 'string') continue;
      deletionTombstonesBySkywriteId[id] = {
        skywriteId: tomb.skywriteId,
        ownerAuthorId: tomb.ownerAuthorId,
        deletedAt: typeof tomb.deletedAt === 'number' ? tomb.deletedAt : Date.now(),
        skyAreaId: typeof tomb.skyAreaId === 'string' ? tomb.skyAreaId : undefined,
        visibilitySnapshot:
          tomb.visibilitySnapshot === 'private' ||
          tomb.visibilitySnapshot === 'orbit' ||
          tomb.visibilitySnapshot === 'public'
            ? tomb.visibilitySnapshot
            : undefined,
        threadId: typeof tomb.threadId === 'string' ? tomb.threadId : undefined,
      };
    }
  }
  return {
    archivedAtBySkywriteId,
    deletionTombstonesBySkywriteId,
    updatedAt: typeof entry.updatedAt === 'number' ? entry.updatedAt : Date.now(),
  };
}

export async function loadSkywriteLibraryState(): Promise<SkywriteLibraryState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_SKYWRITE_LIBRARY_STATE;
    return normalize(JSON.parse(raw));
  } catch {
    return EMPTY_SKYWRITE_LIBRARY_STATE;
  }
}

export async function saveSkywriteLibraryState(state: SkywriteLibraryState): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
