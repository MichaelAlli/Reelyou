import { filterRenderableSkywrites } from '@/journey/skywriteJourneyContent';
import type { SkywriteRecord } from '@/skywrite/types';

/** Skywrites the user permitted for personalization (not playback order). */
export function isSkywriteEligibleForStarpathPersonalization(
  post: Pick<SkywriteRecord, 'visibility' | 'allowAIContext' | 'authorId'>,
): boolean {
  if (post.visibility === 'private') return false;
  if (post.allowAIContext === false) return false;
  if (post.authorId?.startsWith('demo-sky-')) return false;
  return true;
}

export function filterSkywritesForStarpathPersonalization(
  posts: readonly SkywriteRecord[],
): SkywriteRecord[] {
  return filterRenderableSkywrites(posts).filter(isSkywriteEligibleForStarpathPersonalization);
}

export function filterJourneyLibraryForStarpathPersonalization(
  posts: readonly SkywriteRecord[],
): SkywriteRecord[] {
  return filterSkywritesForStarpathPersonalization(posts).filter(
    (post) => post.inYourJourney === true,
  );
}

export function countSkyAreaPatterns(
  posts: readonly Pick<SkywriteRecord, 'skyAreaId'>[],
  minPosts: number,
  maxAreas: number,
): string[] {
  const counts = new Map<string, number>();
  for (const post of posts) {
    const area = post.skyAreaId?.trim();
    if (!area) continue;
    counts.set(area, (counts.get(area) ?? 0) + 1);
  }
  return [...counts.entries()]
    .filter(([, count]) => count >= minPosts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxAreas)
    .map(([id]) => id);
}
