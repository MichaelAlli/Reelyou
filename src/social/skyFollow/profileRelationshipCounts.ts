import {
  isMutualSkyFriends,
  listFollowers,
  listFollowing,
} from '@/social/skyFollow/skyFollowLogic';
import type { SkyFollowGraph } from '@/social/skyFollow/skyFollowTypes';

export interface ProfileRelationshipCounts {
  /** Mutual explore/follow between profile owner and each other account. */
  connectedSkies: number;
  /** Accounts the profile owner follows (one-way out). */
  followedSkies: number;
  /** Accounts following the profile owner (one-way in). */
  skyFollowing: number;
  /** Shared reciprocal connections between viewer and profile owner (excludes viewer + owner). */
  mutualConnectionsWithViewer: number;
}

function explicitConnectionSet(graph: SkyFollowGraph, userId: string): Set<string> {
  const ids = [...listFollowing(graph, userId), ...listFollowers(graph, userId)];
  return new Set(ids.filter((id) => id !== userId));
}

export function buildProfileRelationshipCounts(input: {
  graph: SkyFollowGraph;
  profileOwnerId: string;
  viewerId: string;
  isOwnProfile: boolean;
}): ProfileRelationshipCounts {
  const followedSkies = listFollowing(input.graph, input.profileOwnerId).length;
  const skyFollowing = listFollowers(input.graph, input.profileOwnerId).length;
  const connectedSkies = listFollowing(input.graph, input.profileOwnerId).filter((otherId) =>
    isMutualSkyFriends(input.graph, input.profileOwnerId, otherId),
  ).length;

  if (input.isOwnProfile) {
    return {
      connectedSkies,
      followedSkies,
      skyFollowing,
      mutualConnectionsWithViewer: 0,
    };
  }

  const ownerSet = explicitConnectionSet(input.graph, input.profileOwnerId);
  const viewerSet = explicitConnectionSet(input.graph, input.viewerId);
  let mutualConnectionsWithViewer = 0;
  for (const id of ownerSet) {
    if (id === input.viewerId) continue;
    if (viewerSet.has(id)) mutualConnectionsWithViewer += 1;
  }

  return {
    connectedSkies,
    followedSkies,
    skyFollowing,
    mutualConnectionsWithViewer,
  };
}

export function listSharedConnectionUserIds(
  graph: SkyFollowGraph,
  profileOwnerId: string,
  viewerId: string,
): string[] {
  const ownerSet = explicitConnectionSet(graph, profileOwnerId);
  const viewerSet = explicitConnectionSet(graph, viewerId);
  return [...ownerSet].filter((id) => id !== viewerId && viewerSet.has(id));
}

export function listMutualConnectedSkyUserIds(
  graph: SkyFollowGraph,
  userId: string,
): string[] {
  return listFollowing(graph, userId).filter((otherId) =>
    isMutualSkyFriends(graph, userId, otherId),
  );
}
