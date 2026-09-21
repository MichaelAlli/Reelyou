import AsyncStorage from '@react-native-async-storage/async-storage';

import { boundInteractionSignals } from '@/starpath/starpathInteractionBounds';
import { migrateInteractionSnapshot } from '@/starpath/starpathPersistenceMigrations';
import {
  EMPTY_STARPATH_INTERACTIONS,
  type StarPathInteractionSnapshot,
} from '@/starpath/starpathInteractionTypes';
import { safeJsonParse } from '@/starpath/starpathPersistenceRecovery';

const STORAGE_KEY = '@reellyou/starpath-interactions';

export async function loadStarPathInteractions(): Promise<StarPathInteractionSnapshot> {
  try {
    const { value, ok } = safeJsonParse<StarPathInteractionSnapshot>(await AsyncStorage.getItem(STORAGE_KEY));
    if (!ok || !value) return { ...EMPTY_STARPATH_INTERACTIONS };
    const migrated = migrateInteractionSnapshot(value);
    return {
      ...migrated,
      signals: boundInteractionSignals(migrated.signals),
    };
  } catch {
    return { ...EMPTY_STARPATH_INTERACTIONS };
  }
}

export async function saveStarPathInteractions(snapshot: StarPathInteractionSnapshot): Promise<void> {
  const bounded = {
    ...snapshot,
    signals: boundInteractionSignals(snapshot.signals),
  };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(bounded));
}
