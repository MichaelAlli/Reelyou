import { PROFILE_BETA_PREVIEW_CATEGORY_IDS, isSkyAreaCategoryId } from '@/skyAreas/skyAreaCategory';
import { getSkyAreaCategory } from '@/skyAreas/skyAreaCategory';
import { focusTextRelevanceScore } from '@/todayFocus/recommendations/focusKeywordRelevance';

/** Explicit area inference from focus text — never mutates user preferences. */
export function inferSkyAreaIdsForFocus(
  focusText: string,
  selectedSkyAreaIds: readonly string[],
): string[] {
  const merged = new Set<string>(selectedSkyAreaIds);
  for (const areaId of PROFILE_BETA_PREVIEW_CATEGORY_IDS) {
    if (!isSkyAreaCategoryId(areaId)) continue;
    const label = getSkyAreaCategory(areaId).label;
    if (focusTextRelevanceScore(focusText, label) >= 0.34) {
      merged.add(areaId);
    }
  }
  if (focusTextRelevanceScore(focusText, 'interview career job role sales') >= 0.25) {
    merged.add('career');
  }
  return [...merged];
}
