export type SkyFollowStatus = 'active';

/** Canonical one-way Sky follow edge — mutual edges imply Sky Friends. */
export interface SkyFollowEdge {
  followerUserId: string;
  followedUserId: string;
  createdAt: number;
  status: SkyFollowStatus;
}

export interface SkyFollowGraph {
  edges: SkyFollowEdge[];
  version: 'beta-v1';
}

export const EMPTY_SKY_FOLLOW_GRAPH: SkyFollowGraph = {
  edges: [],
  version: 'beta-v1',
};
