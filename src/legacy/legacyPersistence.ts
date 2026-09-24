import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  EMPTY_LEGACY_USER_STATE,
  type LegacyUserState,
} from '@/legacy/legacyMomentTypes';

const STORAGE_KEY = '@reellyou/legacy-user-state';

function normalize(raw: unknown): LegacyUserState {
  if (!raw || typeof raw !== 'object') return EMPTY_LEGACY_USER_STATE;
  const entry = raw as Partial<LegacyUserState>;
  const momentOverrides =
    entry.momentOverrides && typeof entry.momentOverrides === 'object'
      ? { ...entry.momentOverrides }
      : {};
  const reelRaw = entry.reelReview;
  const reelReview = {
    userReviewed: reelRaw?.userReviewed === true,
    hiddenMomentIds: Array.isArray(reelRaw?.hiddenMomentIds)
      ? reelRaw!.hiddenMomentIds.filter((id): id is string => typeof id === 'string')
      : [],
    updatedAt: typeof reelRaw?.updatedAt === 'number' ? reelRaw.updatedAt : 0,
  };
  return {
    momentOverrides,
    reelReview,
    updatedAt: typeof entry.updatedAt === 'number' ? entry.updatedAt : Date.now(),
  };
}

export async function loadLegacyUserState(): Promise<LegacyUserState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_LEGACY_USER_STATE;
    return normalize(JSON.parse(raw));
  } catch {
    return EMPTY_LEGACY_USER_STATE;
  }
}

export async function saveLegacyUserState(state: LegacyUserState): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
