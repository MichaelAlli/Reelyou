import AsyncStorage from '@react-native-async-storage/async-storage';

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
  return {
    archivedAtBySkywriteId,
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
