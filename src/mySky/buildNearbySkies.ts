import { currentUser } from '@/data/mockData';
import {
  buildSkyIdentityNodeId,
  resolvePublicSkyOwnerProfile,
  type SkyConnectionStatus,
  type SkyOwnerProfile,
} from '@/mySky/skyIdentity';
import {
  buildSkySearchResults,
  type SkySearchConnectionContext,
  type SkySearchResult,
} from '@/mySky/skySearchSources';
import type { CommunitiesRecord } from '@/onboarding/personalization/communities/types';
import type { AroundYourSkyHomeFeed } from '@/social/aroundYourSky/types';
import type { MySkyStarDisplay } from '@/mySky/types';

import type { SkyConnectionActivity } from './skyConnectionSources';
import { stableSlotIndexForId } from './skyLayout';

export type NearbySkyTier = 'connected' | 'shared-community' | 'explore';

export interface NearbySkyAnchor {
  id: string;
  ownerId: string;
  owner: SkyOwnerProfile;
  tier: NearbySkyTier;
  connectionContext: SkySearchConnectionContext;
  x: number;
  y: number;
  identityStar: MySkyStarDisplay;
  canViewFullSky: boolean;
}

const CONNECTED_RING = 0.34;
const EXPLORE_RING = 0.58;
const MAX_CONNECTED = 8;
const MAX_EXPLORE = 6;

function mapTier(context: SkySearchConnectionContext): NearbySkyTier {
  if (context === 'shared-community') return 'shared-community';
  if (context === 'discoverable') return 'explore';
  return 'connected';
}

function layoutNearbyPosition(
  ownerId: string,
  index: number,
  total: number,
  ring: number,
): { x: number; y: number } {
  const slot = stableSlotIndexForId(ownerId, 360);
  const angleJitter = (slot / 360) * 0.28 - 0.14;
  const angle = (index / Math.max(total, 1)) * Math.PI * 2 - Math.PI / 2 + angleJitter;
  return {
    x: 0.5 + Math.cos(angle) * ring,
    y: 0.5 + Math.sin(angle) * ring,
  };
}

function connectionStatusFor(context: SkySearchConnectionContext): SkyConnectionStatus {
  return context === 'discoverable' ? 'none' : 'connected';
}

function buildIdentityDisplay(
  owner: SkyOwnerProfile,
  position: { x: number; y: number },
  tier: NearbySkyTier,
): MySkyStarDisplay {
  const isExplore = tier === 'explore';
  return {
    id: buildSkyIdentityNodeId(owner.id),
    type: 'identity',
    title: owner.name,
    x: position.x,
    y: position.y,
    color: isExplore ? '#E8C872' : '#FFD57A',
    destination: 'public-sky',
    destinationParam: owner.id,
    visualSize: isExplore ? 6.4 : 7.4,
    visualBrightness: isExplore ? 0.74 : 1.08,
    visualGlow: isExplore ? 0.62 : 1.02,
    isIdentityStar: true,
  };
}

function toAnchor(result: SkySearchResult, index: number, total: number): NearbySkyAnchor | null {
  const tier = mapTier(result.connectionContext);
  const ring = tier === 'explore' ? EXPLORE_RING : CONNECTED_RING;
  const position = layoutNearbyPosition(result.id, index, total, ring);
  const owner = resolvePublicSkyOwnerProfile(
    result.id,
    connectionStatusFor(result.connectionContext),
  );
  if (!owner) return null;

  return {
    id: `nearby-sky-${result.id}`,
    ownerId: result.id,
    owner,
    tier,
    connectionContext: result.connectionContext,
    x: position.x,
    y: position.y,
    identityStar: buildIdentityDisplay(owner, position, tier),
    canViewFullSky: result.canViewSky,
  };
}

/** Nearby sky anchors — connected by default; explore tier only when enabled. */
export function buildNearbySkies(
  feed: AroundYourSkyHomeFeed,
  connectionActivities: SkyConnectionActivity[],
  communities: CommunitiesRecord,
  exploreEnabled: boolean,
  selfId: string = currentUser.id,
): NearbySkyAnchor[] {
  const catalog = buildSkySearchResults('', feed, connectionActivities, communities).filter(
    (entry) => entry.id !== selfId,
  );

  const connectedResults = catalog
    .filter(
      (entry) =>
        entry.connectionContext === 'connected' ||
        entry.connectionContext === 'mutual' ||
        entry.connectionContext === 'shared-community',
    )
    .slice(0, MAX_CONNECTED);

  const exploreResults = exploreEnabled
    ? catalog.filter((entry) => entry.connectionContext === 'discoverable').slice(0, MAX_EXPLORE)
    : [];

  const connectedAnchors = connectedResults
    .map((result, index) => toAnchor(result, index, connectedResults.length))
    .filter((entry): entry is NearbySkyAnchor => Boolean(entry));

  const exploreAnchors = exploreResults
    .map((result, index) => toAnchor(result, index, exploreResults.length))
    .filter((entry): entry is NearbySkyAnchor => Boolean(entry));

  return [...connectedAnchors, ...exploreAnchors];
}

export function findNearbySkyAnchor(
  anchors: NearbySkyAnchor[],
  ownerId: string,
): NearbySkyAnchor | null {
  return anchors.find((anchor) => anchor.ownerId === ownerId) ?? null;
}
