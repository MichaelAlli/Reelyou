import type { MySkyStarDisplay } from '@/mySky/types';
import type { SkywriteRecord } from '@/skywrite/types';

export type StarNavigationTarget =
  | { kind: 'skywrite-detail'; skywriteId: string }
  | { kind: 'skywrite-compose' }
  | { kind: 'public-sky'; param: string }
  | { kind: 'none'; reason?: 'missing-skywrite' };

/** Resolve star tap → route using stable sourceId linkage from MY SKY 01. */
export function resolveStarNavigation(
  star: MySkyStarDisplay,
  skywrites: SkywriteRecord[],
): StarNavigationTarget {
  if (star.type === 'skywrite' && star.sourceId) {
    if (skywrites.some((post) => post.id === star.sourceId)) {
      return { kind: 'skywrite-detail', skywriteId: star.sourceId };
    }
    return { kind: 'none', reason: 'missing-skywrite' };
  }

  if (star.destination === 'public-sky' && star.destinationParam) {
    return { kind: 'public-sky', param: star.destinationParam };
  }

  if (star.destination === 'skywrite') {
    return { kind: 'skywrite-compose' };
  }

  return { kind: 'none' };
}

export function findSkywriteById(
  skywrites: SkywriteRecord[],
  skywriteId: string | undefined,
): SkywriteRecord | null {
  if (!skywriteId) return null;
  return skywrites.find((post) => post.id === skywriteId) ?? null;
}
