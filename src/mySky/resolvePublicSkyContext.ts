import type { CommunitiesRecord } from '@/onboarding/personalization/communities/types';
import type { SkyConnectionStatus } from '@/mySky/skyIdentity';
import type { SkyConnectionActivity } from '@/mySky/skyConnectionSources';
import {
  resolveSkyVisibilitySettingsForOwner,
  type SkyVisibilityLevel,
} from '@/mySky/skyVisibilitySettings';
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

function contextVisibilityAllows(
  level: SkyVisibilityLevel | undefined,
  connectionStatus: SkyConnectionStatus,
): boolean {
  const visibility = level ?? 'private';
  if (visibility === 'public') return true;
  if (visibility === 'orbit') return connectionStatus === 'connected';
  return false;
}

/** Lightweight shared context for Public Sky visitors — no scores or rankings. */
export function resolvePublicSkyVisitorContext(
  ownerId: string,
  connectionStatus: SkyConnectionStatus,
  feed: AroundYourSkyHomeFeed,
  communities: CommunitiesRecord,
  connectionActivities: SkyConnectionActivity[],
): PublicSkyVisitorContext {
  const settings = resolveSkyVisibilitySettingsForOwner(ownerId);
  const sharedCommunityName = resolveSharedCommunityName(ownerId, feed, communities);
  const connectedActivity = connectionActivities.find((entry) => entry.actorId === ownerId);

  let mutualConnectionLabel: string | undefined;

  const connectionsAllowed = contextVisibilityAllows(
    settings.contentOverrides.connections ?? settings.defaultVisibility,
    connectionStatus,
  );
  const communitiesAllowed = contextVisibilityAllows(
    settings.contentOverrides.communities ?? settings.defaultVisibility,
    connectionStatus,
  );

  if (connectionsAllowed && connectionStatus === 'connected' && connectedActivity) {
    mutualConnectionLabel = `Connected through ${connectedActivity.title}`;
  } else if (communitiesAllowed && sharedCommunityName) {
    mutualConnectionLabel = `Shared community · ${sharedCommunityName}`;
  }

  return {
    connectionStatus,
    sharedCommunityName: communitiesAllowed ? sharedCommunityName : undefined,
    mutualConnectionLabel,
  };
}
