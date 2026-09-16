import type { CommunitiesRecord } from '@/onboarding/personalization/communities/types';
import {
  AROUND_YOUR_SKY_FIXTURES,
  AROUND_YOUR_SKY_FORCE_QUIET,
} from '@/social/aroundYourSky/fixtures';
import type {
  AroundYourSkyActivityRecord,
  AroundYourSkyDisplayItem,
  AroundYourSkyHomeFeed,
  AroundYourSkyState,
} from '@/social/aroundYourSky/types';

const HOME_ACTIVITY_LIMIT = 3;

function scoreItem(item: AroundYourSkyDisplayItem, joinedIds: Set<string>): number {
  let score = 0;
  if (item.communityId && joinedIds.has(item.communityId)) {
    score += 3;
  }
  if (item.relevanceSource === 'connection') {
    score += 1;
  }
  const ageMs = Date.now() - new Date(item.timestamp).getTime();
  if (ageMs < 6 * 60 * 60 * 1000) {
    score += 1;
  }
  return score;
}

function toRecord(item: AroundYourSkyDisplayItem): AroundYourSkyActivityRecord {
  return {
    id: item.id,
    type: item.type,
    actorId: item.actorId,
    communityId: item.communityId,
    contentId: item.contentId,
    timestamp: item.timestamp,
    relevanceSource: item.relevanceSource,
  };
}

/** Select a finite Home slice — relationship + community relevance, not engagement. */
export function buildAroundYourSkyHomeFeed(
  communities: CommunitiesRecord,
): AroundYourSkyHomeFeed {
  if (AROUND_YOUR_SKY_FORCE_QUIET) {
    return { items: [], isQuiet: true };
  }

  const joinedIds = new Set(communities.explicitInterests);

  const ranked = [...AROUND_YOUR_SKY_FIXTURES].sort((a, b) => {
    const scoreDiff = scoreItem(b, joinedIds) - scoreItem(a, joinedIds);
    if (scoreDiff !== 0) return scoreDiff;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  const items = ranked.slice(0, HOME_ACTIVITY_LIMIT);
  return {
    items,
    isQuiet: items.length === 0,
  };
}

export function toAroundYourSkyState(feed: AroundYourSkyHomeFeed): AroundYourSkyState {
  return {
    items: feed.items.map(toRecord),
  };
}
