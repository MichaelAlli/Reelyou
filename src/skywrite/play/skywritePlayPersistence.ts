import AsyncStorage from '@react-native-async-storage/async-storage';

import type { SkywritePlaySequenceState } from '@/skywrite/play/skywritePlayTypes';
import { EMPTY_SKYWRITE_PLAY_SEQUENCE } from '@/skywrite/play/skywritePlayTypes';

const STORAGE_KEY = '@reelyou/skywrite-play-sequence/v1';

function parseState(raw: unknown): SkywritePlaySequenceState {
  if (!raw || typeof raw !== 'object') return { ...EMPTY_SKYWRITE_PLAY_SEQUENCE };
  const entry = raw as Partial<SkywritePlaySequenceState>;
  return {
    focusedSky: {
      orderedSkywriteIds: Array.isArray(entry.focusedSky?.orderedSkywriteIds)
        ? entry.focusedSky!.orderedSkywriteIds.filter((id): id is string => typeof id === 'string')
        : [],
      excludedSkywriteIds: Array.isArray(entry.focusedSky?.excludedSkywriteIds)
        ? entry.focusedSky!.excludedSkywriteIds.filter((id): id is string => typeof id === 'string')
        : [],
    },
    singleBySkywriteId:
      entry.singleBySkywriteId && typeof entry.singleBySkywriteId === 'object'
        ? (entry.singleBySkywriteId as SkywritePlaySequenceState['singleBySkywriteId'])
        : {},
    updatedAt: typeof entry.updatedAt === 'number' ? entry.updatedAt : 0,
  };
}

export async function loadSkywritePlaySequence(): Promise<SkywritePlaySequenceState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY_SKYWRITE_PLAY_SEQUENCE };
    return parseState(JSON.parse(raw));
  } catch {
    return { ...EMPTY_SKYWRITE_PLAY_SEQUENCE };
  }
}

export async function saveSkywritePlaySequence(state: SkywritePlaySequenceState): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
