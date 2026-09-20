import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  EMPTY_STARPATH_INTERACTIONS,
  type StarPathInteractionSnapshot,
} from '@/starpath/starpathInteractionTypes';

const STORAGE_KEY = '@reellyou/starpath-interactions';

export async function loadStarPathInteractions(): Promise<StarPathInteractionSnapshot> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY_STARPATH_INTERACTIONS, softHighlightNodeIds: [], activeBranchIds: [] };
    const parsed = JSON.parse(raw) as StarPathInteractionSnapshot;
    return {
      version: parsed.version ?? 1,
      signals: Array.isArray(parsed.signals) ? parsed.signals : [],
      softHighlightNodeIds: parsed.softHighlightNodeIds ?? [],
      activeBranchIds: parsed.activeBranchIds ?? [],
    };
  } catch {
    return { ...EMPTY_STARPATH_INTERACTIONS };
  }
}

export async function saveStarPathInteractions(snapshot: StarPathInteractionSnapshot): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}
