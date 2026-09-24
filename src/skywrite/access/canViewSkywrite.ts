import { normalizeSkywriteVisibility } from '@/skywrite/skywriteVisibility';
import type { Privacy } from '@/types';

export interface CanViewSkywriteInput {
  viewerId: string;
  authorId: string;
  visibility: Privacy;
  /** Viewer follows author's Sky (active). */
  viewerFollowsAuthor: boolean;
  /** Author follows viewer's Sky (active). */
  authorFollowsViewer: boolean;
  /** Viewer has blocked the author. */
  viewerBlockedAuthor: boolean;
  /** Author has blocked the viewer (when known). */
  authorBlockedViewer?: boolean;
}

/**
 * Central Skywrite visibility gate — enforce in selectors, routes, and discovery.
 * Block overrides all non-owner access.
 */
export function canViewSkywrite(input: CanViewSkywriteInput): boolean {
  if (input.viewerId === input.authorId) return true;
  if (input.viewerBlockedAuthor) return false;
  if (input.authorBlockedViewer) return false;

  const level = normalizeSkywriteVisibility(input.visibility);
  if (level === 'private') return false;
  if (level === 'sky_friends') {
    return input.viewerFollowsAuthor && input.authorFollowsViewer;
  }
  return true;
}

export function isSkyInvitationEligibleVisibility(visibility: Privacy): boolean {
  return normalizeSkywriteVisibility(visibility) === 'public';
}
