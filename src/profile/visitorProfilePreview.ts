import type { SkyConnectionStatus } from '@/mySky/skyIdentity';
import {
  EMPTY_SKY_FOLLOW_GRAPH,
  type SkyFollowGraph,
} from '@/social/skyFollow/skyFollowTypes';

/** Simulated stranger viewer — never equals a real user id. */
export function buildPreviewGuestViewerId(viewerUserId: string): string {
  return `preview-guest:${viewerUserId}`;
}

export type VisitorPreviewAs = 'public' | 'connected';

export function resolvePreviewConnectionStatus(previewAs: VisitorPreviewAs): SkyConnectionStatus {
  return previewAs === 'connected' ? 'connected' : 'none';
}

/** Dev visitor preview — mutual Connected Sky simulation (both follow edges). */
export function buildPreviewSimulatedFollowGraph(
  guestViewerId: string,
  subjectUserId: string,
  previewAs: VisitorPreviewAs,
): SkyFollowGraph {
  if (previewAs === 'public') {
    return EMPTY_SKY_FOLLOW_GRAPH;
  }
  const now = Date.now();
  return {
    version: 'beta-v1',
    edges: [
      {
        followerUserId: guestViewerId,
        followedUserId: subjectUserId,
        createdAt: now,
        status: 'active',
      },
      {
        followerUserId: subjectUserId,
        followedUserId: guestViewerId,
        createdAt: now,
        status: 'active',
      },
    ],
  };
}

export function isPreviewSimulatedConnectedSky(previewAs: VisitorPreviewAs | undefined): boolean {
  return previewAs === 'connected';
}
