import type { SkyFollowGraph } from '@/social/skyFollow/skyFollowTypes';
import {
  isFollowingSkyUser,
  isMutualSkyFriends,
} from '@/social/skyFollow/skyFollowLogic';

export type SkyRelationshipKind =
  | 'self'
  | 'sky_friend'
  | 'following'
  | 'follows_you'
  | 'none';

export interface SkyRelationshipPresentation {
  kind: SkyRelationshipKind;
  /** Primary label for lists and follow button. */
  label: string;
  /** Secondary hint — calm, non-judgmental. */
  detail?: string;
}

export function resolveSkyRelationship(
  graph: SkyFollowGraph,
  viewerId: string,
  otherUserId: string,
): SkyRelationshipPresentation {
  if (viewerId === otherUserId) {
    return { kind: 'self', label: 'You' };
  }

  const viewerFollows = isFollowingSkyUser(graph, viewerId, otherUserId);
  const otherFollowsViewer = isFollowingSkyUser(graph, otherUserId, viewerId);

  if (isMutualSkyFriends(graph, viewerId, otherUserId)) {
    return {
      kind: 'sky_friend',
      label: 'Connected Sky',
      detail: 'Mutual Sky follow',
    };
  }

  if (viewerFollows && !otherFollowsViewer) {
    return {
      kind: 'following',
      label: 'Following',
      detail: 'Following their Sky',
    };
  }

  if (!viewerFollows && otherFollowsViewer) {
    return {
      kind: 'follows_you',
      label: 'Follows your Sky',
      detail: 'You don’t follow yet',
    };
  }

  return { kind: 'none', label: 'Follow Sky' };
}
