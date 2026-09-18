import { EMPTY_SKY_EVOLUTION } from '@/mySky/skyEvolution';
import { buildMySkyViewFromSources, type MySkySources } from '@/mySky/mySkyState';
import {
  resolvePublicSkyOwnerProfile,
  type SkyConnectionStatus,
  type SkyOwnerProfile,
} from '@/mySky/skyIdentity';
import type { MySkyView } from '@/mySky/types';

export function buildPublicSkyView(
  userId: string,
  connectionStatus: SkyConnectionStatus = 'none',
): MySkyView | null {
  const owner = resolvePublicSkyOwnerProfile(userId, connectionStatus);
  if (!owner) return null;

  const sources: MySkySources = {
    northStarVision: '',
    skywrites: [],
    joinedCommunities: [],
    connectionActivities: [],
    participatingCommunityIds: [],
    growthGoals: [],
    guidance: null,
    impactActivities: [],
    evolution: EMPTY_SKY_EVOLUTION,
    lastUpdatedAt: null,
    skyOwner: owner,
  };

  return buildMySkyViewFromSources(sources);
}

export function resolvePublicSkyConnectionStatus(
  userId: string,
  connectedActorIds: string[],
): SkyConnectionStatus {
  return connectedActorIds.includes(userId) ? 'connected' : 'none';
}

export type { SkyOwnerProfile };
