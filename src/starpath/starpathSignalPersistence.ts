import { readStarpathScopedJson, writeStarpathScopedJson } from '@/starpath/starpathScopedStorage';
import { EMPTY_SIGNAL_STATE, type StarPathSignalState } from '@/starpath/starpathSignalTypes';

const STORAGE_KEY = '@reellyou/starpath-signals';

export async function loadStarPathSignalState(): Promise<StarPathSignalState> {
  try {
    const raw = await readStarpathScopedJson(STORAGE_KEY, (value) => value);
    if (!raw) return { ...EMPTY_SIGNAL_STATE };
    const parsed = JSON.parse(raw) as StarPathSignalState;
    return {
      ...EMPTY_SIGNAL_STATE,
      ...parsed,
      acknowledgedSignalIds: parsed.acknowledgedSignalIds ?? [],
      dismissedSignalIds: parsed.dismissedSignalIds ?? [],
    };
  } catch {
    return { ...EMPTY_SIGNAL_STATE };
  }
}

export async function saveStarPathSignalState(state: StarPathSignalState): Promise<void> {
  await writeStarpathScopedJson(STORAGE_KEY, state);
}
