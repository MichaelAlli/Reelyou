import type { AroundYourSkyHomeFeed } from '@/social/aroundYourSky/types';
import type { SkySearchConnectionContext, SkySearchResult } from '@/mySky/skySearchSources';

/** Latest permitted feed activity for an owner — no inference beyond explicit records. */
export function resolveLatestFeedActivityMs(
  feed: AroundYourSkyHomeFeed,
  actorId: string,
): number {
  let max = 0;
  for (const item of feed.items) {
    if (item.actorId !== actorId) continue;
    const ts = Date.parse(item.timestamp);
    if (Number.isFinite(ts) && ts > max) max = ts;
  }
  return max;
}

export function sortOwnerIdsByRecentActivity(
  ownerIds: readonly string[],
  feed: AroundYourSkyHomeFeed,
): string[] {
  return [...ownerIds].sort(
    (a, b) => resolveLatestFeedActivityMs(feed, b) - resolveLatestFeedActivityMs(feed, a),
  );
}

function connectionTierRank(context: SkySearchConnectionContext): number {
  if (context === 'connected') return 0;
  if (context === 'mutual') return 1;
  if (context === 'shared-community') return 2;
  return 3;
}

/** Explore discovery order — followed first, then recent activity within tier. */
export function compareSkySearchResultsForExplore(
  a: SkySearchResult,
  b: SkySearchResult,
  feed: AroundYourSkyHomeFeed,
  followingSet: ReadonlySet<string>,
): number {
  const aFollowed = followingSet.has(a.id);
  const bFollowed = followingSet.has(b.id);
  if (aFollowed !== bFollowed) return aFollowed ? -1 : 1;

  const tierDiff = connectionTierRank(a.connectionContext) - connectionTierRank(b.connectionContext);
  if (tierDiff !== 0) return tierDiff;

  const activityDiff =
    resolveLatestFeedActivityMs(feed, b.id) - resolveLatestFeedActivityMs(feed, a.id);
  if (activityDiff !== 0) return activityDiff;

  return a.name.localeCompare(b.name);
}
