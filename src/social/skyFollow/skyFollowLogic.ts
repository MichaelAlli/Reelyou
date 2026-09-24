import { currentUser } from '@/data/mockData';

import type { SkyFollowEdge, SkyFollowGraph } from '@/social/skyFollow/skyFollowTypes';

function edgeKey(followerUserId: string, followedUserId: string): string {
  return `${followerUserId}->${followedUserId}`;
}

export function activeEdges(graph: SkyFollowGraph): SkyFollowEdge[] {
  return graph.edges.filter((e) => e.status === 'active');
}

export function isFollowingSkyUser(
  graph: SkyFollowGraph,
  followerUserId: string,
  followedUserId: string,
): boolean {
  return activeEdges(graph).some(
    (e) => e.followerUserId === followerUserId && e.followedUserId === followedUserId,
  );
}

export function isMutualSkyFriends(
  graph: SkyFollowGraph,
  userA: string,
  userB: string,
): boolean {
  if (userA === userB) return false;
  return (
    isFollowingSkyUser(graph, userA, userB) && isFollowingSkyUser(graph, userB, userA)
  );
}

export function listFollowing(graph: SkyFollowGraph, userId: string): string[] {
  const ids = activeEdges(graph)
    .filter((e) => e.followerUserId === userId)
    .map((e) => e.followedUserId);
  return [...new Set(ids)];
}

export function listFollowers(graph: SkyFollowGraph, userId: string): string[] {
  const ids = activeEdges(graph)
    .filter((e) => e.followedUserId === userId)
    .map((e) => e.followerUserId);
  return [...new Set(ids)];
}

export function countSkyFriends(graph: SkyFollowGraph, userId: string): number {
  const following = listFollowing(graph, userId);
  return following.filter((otherId) => isMutualSkyFriends(graph, userId, otherId)).length;
}

export function listSkyFriendUserIds(graph: SkyFollowGraph, userId: string): string[] {
  return listFollowing(graph, userId).filter((otherId) =>
    isMutualSkyFriends(graph, userId, otherId),
  );
}

export function addSkyFollowEdge(
  graph: SkyFollowGraph,
  followerUserId: string,
  followedUserId: string,
  now: number = Date.now(),
): SkyFollowGraph {
  if (followerUserId === followedUserId) return graph;
  const exists = graph.edges.some(
    (e) =>
      e.followerUserId === followerUserId &&
      e.followedUserId === followedUserId &&
      e.status === 'active',
  );
  if (exists) return graph;
  const withoutInactive = graph.edges.filter(
    (e) => !(e.followerUserId === followerUserId && e.followedUserId === followedUserId),
  );
  return {
    ...graph,
    edges: [
      ...withoutInactive,
      { followerUserId, followedUserId, createdAt: now, status: 'active' },
    ],
  };
}

export function removeSkyFollowEdge(
  graph: SkyFollowGraph,
  followerUserId: string,
  followedUserId: string,
): SkyFollowGraph {
  return {
    ...graph,
    edges: graph.edges.filter(
      (e) =>
        !(
          e.followerUserId === followerUserId &&
          e.followedUserId === followedUserId &&
          e.status === 'active'
        ),
    ),
  };
}

export function removeAllFollowEdgesForUser(
  graph: SkyFollowGraph,
  userId: string,
): SkyFollowGraph {
  return {
    ...graph,
    edges: graph.edges.filter(
      (e) =>
        e.status !== 'active' ||
        (e.followerUserId !== userId && e.followedUserId !== userId),
    ),
  };
}

/** Beta inbound follows for Michael — simulates other users following the owner Sky. */
export const BETA_FOLLOWERS_OF_OWNER: readonly string[] = [
  'orbit-jordan',
  'orbit-1',
  'orbit-3',
] as const;

export function seedBetaInboundFollowers(graph: SkyFollowGraph): SkyFollowGraph {
  let next = graph;
  const ownerId = currentUser.id;
  for (const followerId of BETA_FOLLOWERS_OF_OWNER) {
    next = addSkyFollowEdge(next, followerId, ownerId, Date.now());
  }
  return next;
}

export function migrateLegacyFollowedIds(
  graph: SkyFollowGraph,
  followedIds: string[],
): SkyFollowGraph {
  let next = graph;
  const ownerId = currentUser.id;
  for (const followedUserId of followedIds) {
    next = addSkyFollowEdge(next, ownerId, followedUserId, Date.now());
  }
  return next;
}

export function dedupeEdges(edges: SkyFollowEdge[]): SkyFollowEdge[] {
  const seen = new Set<string>();
  const out: SkyFollowEdge[] = [];
  for (const edge of edges) {
    const key = edgeKey(edge.followerUserId, edge.followedUserId);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(edge);
  }
  return out;
}
