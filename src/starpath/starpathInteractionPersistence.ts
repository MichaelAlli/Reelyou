import { boundInteractionSignals } from '@/starpath/starpathInteractionBounds';
import { readStarpathScopedJson, writeStarpathScopedJson } from '@/starpath/starpathScopedStorage';
import { migrateInteractionSnapshot } from '@/starpath/starpathPersistenceMigrations';
import {
  EMPTY_STARPATH_INTERACTIONS,
  type StarPathInteractionSnapshot,
} from '@/starpath/starpathInteractionTypes';
import { safeJsonParse } from '@/starpath/starpathPersistenceRecovery';

const STORAGE_KEY = '@reellyou/starpath-interactions';

export async function loadStarPathInteractions(): Promise<StarPathInteractionSnapshot> {
  try {
    const raw = await readStarpathScopedJson(STORAGE_KEY, (value) => value);
    const { value, ok } = safeJsonParse<StarPathInteractionSnapshot>(raw);
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
  await writeStarpathScopedJson(STORAGE_KEY, bounded);
}
