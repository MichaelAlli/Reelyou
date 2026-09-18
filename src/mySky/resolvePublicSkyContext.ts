import type { CommunitiesRecord } from '@/onboarding/personalization/communities/types';
import type { SkyConnectionStatus } from '@/mySky/skyIdentity';
import type { SkyConnectionActivity } from '@/mySky/skyConnectionSources';
import type { AroundYourSkyHomeFeed } from '@/social/aroundYourSky/types';

export interface PublicSkyVisitorContext {
  connectionStatus: SkyConnectionStatus;
  sharedCommunityName?: string;
  mutualConnectionLabel?: string;
}

function resolveSharedCommunityName(
  ownerId: string,
  feed: AroundYourSkyHomeFeed,
  communities: CommunitiesRecord,
): string | undefined {
  for (const item of feed.items) {
    if (item.actorId !== ownerId || !item.communityId) continue;
    const joined = communities.joined.find((entry) => entry.id === item.communityId);
    if (joined) return joined.name;
  }
  return undefined;
}

/** Lightweight shared context for Public Sky visitors — no scores or rankings. */
export function resolvePublicSkyVisitorContext(
  ownerId: string,
  connectionStatus: SkyConnectionStatus,
  feed: AroundYourSkyHomeFeed,
  communities: CommunitiesRecord,
  connectionActivities: SkyConnectionActivity[],
): PublicSkyVisitorContext {
  const sharedCommunityName = resolveSharedCommunityName(ownerId, feed, communities);
  const connectedActivity = connectionActivities.find((entry) => entry.actorId === ownerId);

  let mutualConnectionLabel: string | undefined;
  if (connectionStatus === 'connected' && connectedActivity) {
    mutualConnectionLabel = `Connected through ${connectedActivity.title}`;
  } else if (sharedCommunityName) {
    mutualConnectionLabel = `Shared community · ${sharedCommunityName}`;
  }

  return {
    connectionStatus,
    sharedCommunityName,
    mutualConnectionLabel,
  };
}
