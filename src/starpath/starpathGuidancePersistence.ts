import { readStarpathScopedJson, writeStarpathScopedJson } from '@/starpath/starpathScopedStorage';
import { EMPTY_GUIDANCE_STATE, type StarPathGuidanceState } from '@/starpath/starpathGuidanceTypes';

const STORAGE_KEY = '@reellyou/starpath-guidance';

export async function loadStarPathGuidanceState(): Promise<StarPathGuidanceState> {
  try {
    const raw = await readStarpathScopedJson(STORAGE_KEY, (value) => value);
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
  await writeStarpathScopedJson(STORAGE_KEY, state);
}
