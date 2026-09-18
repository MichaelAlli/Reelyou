import { getCommunityById } from '@/constants/communitiesData';
import type { MySkyStarDisplay } from '@/mySky/types';
import type { SkywriteRecord } from '@/skywrite/types';

export type StarNavigationTarget =
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
}

/** Resolve star tap → route using stable sourceId linkage from MY SKY 01. */
export function resolveStarNavigation(
  star: MySkyStarDisplay,
  context: StarNavigationContext | SkywriteRecord[],
): StarNavigationTarget {
  const skywrites = Array.isArray(context) ? context : context.skywrites;
  const joinedCommunityIds = Array.isArray(context)
    ? undefined
    : context.joinedCommunityIds;
  const guidanceActive = Array.isArray(context) ? undefined : context.guidanceActive;

  if (star.type === 'skywrite' && star.sourceId) {
    if (skywrites.some((post) => post.id === star.sourceId)) {
      return { kind: 'skywrite-detail', skywriteId: star.sourceId };
    }
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
