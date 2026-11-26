/** Owner-chosen Sky moments. Three is the product maximum. */
export const LIVING_SKY_FEATURED_MAX = 3;

export interface LivingSkyFeaturedToggle {
  ids: string[];
  changed: boolean;
  reason: 'added' | 'removed' | 'limit' | 'unchanged';
}

export function sanitizeLivingSkyFeaturedIds(ids: readonly string[]): string[] {
  const next: string[] = [];
  for (const id of ids) {
    if (typeof id !== 'string') continue;
    const trimmed = id.trim();
    if (!trimmed || trimmed.length > 80) continue;
    if (next.includes(trimmed)) continue;
    next.push(trimmed);
    if (next.length >= LIVING_SKY_FEATURED_MAX) break;
  }
  return next;
}

export function applyLivingSkyFeaturedToggle(
  current: readonly string[],
  postId: string,
): LivingSkyFeaturedToggle {
  const ids = sanitizeLivingSkyFeaturedIds(current);
  const trimmed = postId.trim();
  if (!trimmed) return { ids, changed: false, reason: 'unchanged' };
  const index = ids.indexOf(trimmed);
  if (index >= 0) {
    const next = ids.filter((id) => id !== trimmed);
    return { ids: next, changed: true, reason: 'removed' };
  }
  if (ids.length >= LIVING_SKY_FEATURED_MAX) {
    return { ids, changed: false, reason: 'limit' };
  }
  return { ids: [...ids, trimmed], changed: true, reason: 'added' };
}

/**
 * Visitors never receive the signed-in user's featured list.
 * `override` is an explicit list for this sky (QA or a future owner record).
 * null forces automatic. undefined uses the owner's device draft only.
 */
export function resolveFeaturedIdsForSky(input: {
  viewerIsOwner: boolean;
  deviceDraftIds: readonly string[];
  override?: readonly string[] | null;
}): readonly string[] | null {
  if (input.override === null) return null;
  if (input.override) return sanitizeLivingSkyFeaturedIds(input.override);
  if (input.viewerIsOwner && input.deviceDraftIds.length > 0) {
    return sanitizeLivingSkyFeaturedIds(input.deviceDraftIds);
  }
  return null;
}
