import AsyncStorage from '@react-native-async-storage/async-storage';

import type { StarPathViewportSnapshot } from '@/starpath/starpathPersistenceTypes';
import { clampNumber, safeJsonParse } from '@/starpath/starpathPersistenceRecovery';

const STORAGE_KEY = '@reellyou/starpath-viewport';

export async function loadStarPathViewport(): Promise<StarPathViewportSnapshot | null> {
  const { value, ok } = safeJsonParse<StarPathViewportSnapshot>(await AsyncStorage.getItem(STORAGE_KEY));
  if (!ok || !value) return null;
  return {
    scrollY: clampNumber(value.scrollY, 0, 1_000_000, 0),
    worldExpansionPx: clampNumber(value.worldExpansionPx, 0, 500_000, 0),
    viewportHeight: clampNumber(value.viewportHeight, 320, 1200, 852),
    savedAt: clampNumber(value.savedAt, 0, Date.now() + 86_400_000, 0),
  };
}

export async function saveStarPathViewport(snapshot: StarPathViewportSnapshot): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}
