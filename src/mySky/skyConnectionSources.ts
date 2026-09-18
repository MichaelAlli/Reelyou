import type { AroundYourSkyHomeFeed } from '@/social/aroundYourSky/types';

/** Explicit human connection — derived from Around Your Sky, never inferred. */
export interface SkyConnectionActivity {
  id: string;
  title: string;
  actorId: string;
  destination: 'public-sky' | null;
  destinationParam: string | null;
  createdAt: string;
}

const MAX_CONNECTION_NODES = 6;

/** Build stable connection nodes from explicit social activity records. */
export function resolveSkyConnectionActivities(
  feed: AroundYourSkyHomeFeed,
): SkyConnectionActivity[] {
  const seen = new Set<string>();
  const result: SkyConnectionActivity[] = [];

  for (const item of feed.items) {
    if (item.type !== 'connection' && item.type !== 'social') continue;
    if (!item.actorId) continue;

    const id = `connection-${item.actorId}`;
    if (seen.has(id)) continue;
    seen.add(id);

    result.push({
      id,
      title: item.actorName,
      actorId: item.actorId,
      destination: item.destination === 'public-sky' ? 'public-sky' : null,
      destinationParam: item.destinationParam,
      createdAt: item.timestamp,
    });
  }

  return result.slice(0, MAX_CONNECTION_NODES);
}

/** Communities with explicit recent participation in the user's feed. */
export function resolveParticipatingCommunityIds(feed: AroundYourSkyHomeFeed): string[] {
  const ids = new Set<string>();
  for (const item of feed.items) {
    if (item.type === 'community' && item.communityId) {
      ids.add(item.communityId);
    }
  }
  return [...ids];
}
