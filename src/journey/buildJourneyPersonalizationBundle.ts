import type { UserPersonalizationProfile } from '@/onboarding/personalization/types';

import { filterRenderableSkywrites } from '@/journey/skywriteJourneyContent';

const MIN_POSTS_FOR_AREA_PATTERN = 2;
const MAX_PATTERN_AREAS = 4;

export interface JourneyPersonalizationBundle {
  northStarVision: string;
  explicitGoals: string[];
  explicitChallenges: string[];
  /** Today's Focus — temporary; must not overwrite north star in consumers. */
  todayFocusText: string | null;
  /** Selected Sky areas (“where you live in your Sky”) — explicit only. */
  skyContextAreaIds: string[];
  /** Inferred only after repeated, AI-permitted posts in the same area. */
  journeyPatternAreaIds: string[];
  renderableSkywriteIds: string[];
}

function countSkyAreasFromPermittedPosts(
  posts: readonly { skyAreaId?: string; allowAIContext?: boolean; visibility?: string }[],
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const post of posts) {
    if (post.visibility === 'private') continue;
    if (post.allowAIContext === false) continue;
    const area = post.skyAreaId?.trim();
    if (!area) continue;
    counts.set(area, (counts.get(area) ?? 0) + 1);
  }
  return counts;
}

/**
 * Combines explicit profile signals with conservative journey patterns.
 * Single posts or views must not become strong conclusions.
 */
export function buildJourneyPersonalizationBundle(input: {
  profile: UserPersonalizationProfile;
  selectedSkyAreaIds: readonly string[];
}): JourneyPersonalizationBundle {
  const renderable = filterRenderableSkywrites(input.profile.skywrites ?? []);
  const areaCounts = countSkyAreasFromPermittedPosts(renderable);

  const journeyPatternAreaIds = [...areaCounts.entries()]
    .filter(([, count]) => count >= MIN_POSTS_FOR_AREA_PATTERN)
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_PATTERN_AREAS)
    .map(([id]) => id);

  return {
    northStarVision: input.profile.northStar.originalVision.trim(),
    explicitGoals: [...(input.profile.goals ?? [])],
    explicitChallenges: [...(input.profile.challenges ?? [])],
    todayFocusText: input.profile.todayFocus?.value?.trim() || null,
    skyContextAreaIds: [...input.selectedSkyAreaIds],
    journeyPatternAreaIds,
    renderableSkywriteIds: renderable.map((post) => post.id),
  };
}
