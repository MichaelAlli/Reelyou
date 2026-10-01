import { getCommunityById } from '@/constants/communitiesData';
import type { SkyNode } from '@/mySky/skyNodeTypes';
import type { MySkyStarDisplay } from '@/mySky/types';
import { pushSkyreelPlay } from '@/skywrite/play/skyreelNavigation';
import { resolveSkywriteById } from '@/skywrite/resolveSkywriteById';
import type { SkywriteRecord } from '@/skywrite/types';

export type StarNavigationTarget =
  | { kind: 'skywrite-play'; skywriteId: string }
  | { kind: 'skywrite-detail'; skywriteId: string }
  | { kind: 'skywrite-compose' }
  | { kind: 'public-sky'; param: string }
  | { kind: 'community-detail'; communityId: string }
  | { kind: 'starpath' }
  | { kind: 'impact-tab' }
  | { kind: 'star-detail'; nodeId: string }
  | { kind: 'none'; reason?: 'missing-skywrite' };

export interface StarNavigationContext {
  skywrites: SkywriteRecord[];
  joinedCommunityIds?: string[];
  guidanceActive?: boolean;
  nodes?: SkyNode[];
}

/** Canonical Skywrite id for a My Sky content star (node graph wins over display projection). */
export function resolveCanonicalSkywriteIdForStar(
  star: MySkyStarDisplay,
  nodes?: SkyNode[],
): string | null {
  const node = nodes?.find((entry) => entry.id === star.id);
  if (node?.sourceType === 'skywrite' && node.sourceId) {
    return node.sourceId;
  }
  if (star.type === 'skywrite' && star.sourceId) {
    return star.sourceId;
  }
  return null;
}

function isSkywriteAvailableForPlay(
  skywrites: readonly SkywriteRecord[],
  skywriteId: string,
): boolean {
  if (skywrites.some((post) => post.id === skywriteId)) return true;
  return Boolean(resolveSkywriteById(skywrites, skywriteId));
}

/** Resolve star tap → route using stable sourceId linkage from MY SKY 01. */
export function resolveStarNavigation(
  star: MySkyStarDisplay,
  context: StarNavigationContext | SkywriteRecord[],
): StarNavigationTarget {
  const skywrites = Array.isArray(context) ? context : context.skywrites;
  const nodes = Array.isArray(context) ? undefined : context.nodes;
  const joinedCommunityIds = Array.isArray(context)
    ? undefined
    : context.joinedCommunityIds;
  const guidanceActive = Array.isArray(context) ? undefined : context.guidanceActive;

  const skywriteId = resolveCanonicalSkywriteIdForStar(star, nodes);
  if (skywriteId && isSkywriteAvailableForPlay(skywrites, skywriteId)) {
    return { kind: 'skywrite-play', skywriteId };
  }
  if (skywriteId) {
    return { kind: 'none', reason: 'missing-skywrite' };
  }

  if (star.type === 'guidance' || star.destination === 'starpath') {
    if (guidanceActive ?? true) {
      return { kind: 'starpath' };
    }
    return { kind: 'star-detail', nodeId: star.id };
  }

  if (star.type === 'contribution' || star.destination === 'impact') {
    if (star.sourceId && skywrites.some((post) => post.id === star.sourceId)) {
      return { kind: 'impact-tab' };
    }
    if (star.destination === 'impact') {
      return { kind: 'impact-tab' };
    }
    return { kind: 'star-detail', nodeId: star.id };
  }

  if (star.destination === 'community' && star.destinationParam) {
    const community = getCommunityById(star.destinationParam);
    const isJoined = joinedCommunityIds?.includes(star.destinationParam) ?? Boolean(community);
    if (community && isJoined) {
      return { kind: 'community-detail', communityId: star.destinationParam };
    }
    return { kind: 'star-detail', nodeId: star.id };
  }

  if (star.type === 'community' && star.sourceId) {
    const community = getCommunityById(star.sourceId);
    const isJoined = joinedCommunityIds?.includes(star.sourceId) ?? Boolean(community);
    if (community && isJoined) {
      return { kind: 'community-detail', communityId: star.sourceId };
    }
    return { kind: 'star-detail', nodeId: star.id };
  }

  if (star.destination === 'public-sky' && star.destinationParam) {
    return { kind: 'public-sky', param: star.destinationParam };
  }

  if (star.type === 'connection' && star.destination === 'public-sky' && star.destinationParam) {
    return { kind: 'public-sky', param: star.destinationParam };
  }

  if (star.destination === 'skywrite') {
    return { kind: 'skywrite-compose' };
  }

  if (star.type !== 'skywrite') {
    return { kind: 'star-detail', nodeId: star.id };
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

/** Shared route wiring — My Sky, Public Sky, constellation sheets. */
export function pushStarNavigationTarget(
  router: { push: (href: never) => void },
  target: StarNavigationTarget,
  options: {
    visitorMode?: boolean;
    publicSkyOwnerId?: string;
    skyOwnerId: string;
  },
): void {
  const { visitorMode = false, publicSkyOwnerId, skyOwnerId } = options;
  switch (target.kind) {
    case 'skywrite-play':
      pushSkyreelPlay(router, `/skywrite/play?scope=single&id=${target.skywriteId}`);
      return;
    case 'skywrite-detail':
      router.push(`/skywrite/${target.skywriteId}` as never);
      return;
    case 'skywrite-compose':
      router.push('/skywrite/compose' as never);
      return;
    case 'public-sky':
      router.push(`/public-sky?id=${target.param}` as never);
      return;
    case 'community-detail':
      router.push(`/community?id=${target.communityId}` as never);
      return;
    case 'starpath':
      router.push('/starpath' as never);
      return;
    case 'impact-tab':
      router.push('/(tabs)/impact' as never);
      return;
    case 'star-detail':
      router.push(
        visitorMode
          ? (`/my-sky-star/${target.nodeId}?ownerId=${publicSkyOwnerId ?? skyOwnerId}` as never)
          : (`/my-sky-star/${target.nodeId}` as never),
      );
      return;
    default:
      return;
  }
}
