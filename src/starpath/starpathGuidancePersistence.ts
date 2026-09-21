import AsyncStorage from '@react-native-async-storage/async-storage';

import { EMPTY_GUIDANCE_STATE, type StarPathGuidanceState } from '@/starpath/starpathGuidanceTypes';

const STORAGE_KEY = '@reellyou/starpath-guidance';

export async function loadStarPathGuidanceState(): Promise<StarPathGuidanceState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY_GUIDANCE_STATE };
    const parsed = JSON.parse(raw) as StarPathGuidanceState;
    return {
      ...EMPTY_GUIDANCE_STATE,
      ...parsed,
      guideDismissedIds: parsed.guideDismissedIds ?? [],
      guideSnoozedUntil: parsed.guideSnoozedUntil ?? {},
    };
  } catch {
    return { ...EMPTY_GUIDANCE_STATE };
  }
}

export async function saveStarPathGuidanceState(state: StarPathGuidanceState): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
