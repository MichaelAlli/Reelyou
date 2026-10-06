import { readStarpathScopedJson, writeStarpathScopedJson } from '@/starpath/starpathScopedStorage';
import { EMPTY_RESOURCE_STATE, type StarPathResourceState } from '@/starpath/starpathOpportunityTypes';

const STORAGE_KEY = '@reellyou/starpath-resources';

export async function loadStarPathResourceState(): Promise<StarPathResourceState> {
  try {
    const raw = await readStarpathScopedJson(STORAGE_KEY, (value) => value);
    if (!raw) return { ...EMPTY_RESOURCE_STATE };
    const parsed = JSON.parse(raw) as StarPathResourceState;
    return {
      ...EMPTY_RESOURCE_STATE,
      ...parsed,
      placedNodes: parsed.placedNodes ?? [],
      activeResourceIds: parsed.activeResourceIds ?? [],
      savedResourceIds: parsed.savedResourceIds ?? [],
      dismissedResourceIds: parsed.dismissedResourceIds ?? [],
      snoozedResourceUntil: parsed.snoozedResourceUntil ?? {},
    };
  } catch {
    return { ...EMPTY_RESOURCE_STATE };
  }
}

export async function saveStarPathResourceState(state: StarPathResourceState): Promise<void> {
  await writeStarpathScopedJson(STORAGE_KEY, state);
}
