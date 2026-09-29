import {
  isMutualSkyFriends,
  listFollowers,
  listFollowing,
} from '@/social/skyFollow/skyFollowLogic';
import type { SkyFollowGraph } from '@/social/skyFollow/skyFollowTypes';

export interface ProfileRelationshipCounts {
  /** Accounts the profile owner follows (one-way edges out). */
  exploringSkies: number;
  /** Accounts following the profile owner (one-way edges in). */
  skyExplorers: number;
  /** Overlap of explicit follow relationships between viewer and profile owner. */
  sharedConnections: number;
}

function explicitConnectionSet(graph: SkyFollowGraph, userId: string): Set<string> {
  const ids = [...listFollowing(graph, userId), ...listFollowers(graph, userId)];
  return new Set(ids.filter((id) => id !== userId));
}

/**
 * Shared Connections = users (other than viewer and profile owner) who appear in
 * BOTH the viewer's and the profile owner's explicit follow graph
 * (following ∪ followers). Browsing or Explore mode does not add edges.
 */
export function buildProfileRelationshipCounts(input: {
  graph: SkyFollowGraph;
  profileOwnerId: string;
  viewerId: string;
  isOwnProfile: boolean;
}): ProfileRelationshipCounts {
  const exploringSkies = listFollowing(input.graph, input.profileOwnerId).length;
  const skyExplorers = listFollowers(input.graph, input.profileOwnerId).length;

  if (input.isOwnProfile) {
    return { exploringSkies, skyExplorers, sharedConnections: 0 };
  }

  const ownerSet = explicitConnectionSet(input.graph, input.profileOwnerId);
  const viewerSet = explicitConnectionSet(input.graph, input.viewerId);
  let shared = 0;
  for (const id of ownerSet) {
    if (id === input.viewerId) continue;
    if (viewerSet.has(id)) shared += 1;
  }

  return { exploringSkies, skyExplorers, sharedConnections: shared };
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
