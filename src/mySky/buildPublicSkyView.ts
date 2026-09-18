import { orbitUsers } from '@/data/mockData';
import { EMPTY_SKY_EVOLUTION } from '@/mySky/skyEvolution';
import { buildMySkyViewFromSources, type MySkySources } from '@/mySky/mySkyState';
import {
  resolvePublicSkyOwnerProfile,
  type SkyConnectionStatus,
  type SkyOwnerProfile,
} from '@/mySky/skyIdentity';
import { filterPublicSkyView } from '@/mySky/skyPublicVisibility';
import { DEFAULT_MY_SKY_VISIBLE_LAYERS } from '@/mySky/skyLayers';
import type { MySkyView } from '@/mySky/types';

/** Beta placeholder north stars — public-facing only. */
const PUBLIC_NORTH_STARS: Record<string, string> = {
  'orbit-jordan': 'Building confidence one step at a time.',
  'orbit-1': 'Healing through entrepreneurship and creative courage.',
  'orbit-2': 'Making art that honors faith and everyday beauty.',
  'orbit-3': 'Helping others find purpose in small, brave steps.',
  'orbit-4': 'Creativity as a path to meaningful work.',
  'orbit-5': 'Faith, healing, and showing up with heart.',
};

const PUBLIC_VISITOR_LAYERS = {
  ...DEFAULT_MY_SKY_VISIBLE_LAYERS,
  stars: true,
  communities: true,
  connections: false,
  growth: false,
  guidance: false,
  impact: true,
  history: false,
};

export function resolvePublicSkyConnectionStatus(
  userId: string,
  connectedActorIds: string[],
): SkyConnectionStatus {
  return connectedActorIds.includes(userId) ? 'connected' : 'none';
}

function resolveNorthStarVision(userId: string): string {
  return PUBLIC_NORTH_STARS[userId]?.trim() ?? '';
}

export function buildPublicSkyView(
  userId: string,
  connectionStatus: SkyConnectionStatus = 'none',
): MySkyView | null {
  const owner = resolvePublicSkyOwnerProfile(userId, connectionStatus);
  if (!owner) return null;

  const sources: MySkySources = {
    northStarVision: resolveNorthStarVision(userId),
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

  const rawView = buildMySkyViewFromSources(sources, PUBLIC_VISITOR_LAYERS);
  const filtered = filterPublicSkyView(rawView, connectionStatus);

  return {
    ...filtered,
    northStar: { originalVision: sources.northStarVision },
    skyOwner: {
      ...owner,
      northStarSummary: sources.northStarVision || undefined,
    },
  };
}

export function buildPublicSkyViewForOwner(owner: SkyOwnerProfile): MySkyView | null {
  return buildPublicSkyView(owner.id, owner.connectionStatus ?? 'none');
}

export function isPublicSkyAvailable(userId: string): boolean {
  return orbitUsers.some((user) => user.id === userId);
}

export type { SkyOwnerProfile };
