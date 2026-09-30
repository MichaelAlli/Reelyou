import { isBlockedEitherDirection, listFollowing } from './socialRepository.js';
import type { SkywriteVisibility } from './skywriteTypes.js';

function normalizeVisibility(v: SkywriteVisibility): SkywriteVisibility {
  return v;
}

export function canViewerAccessSkywrite(input: {
  viewerId: string;
  authorId: string;
  visibility: SkywriteVisibility;
}): boolean {
  const { viewerId, authorId, visibility } = input;
  if (viewerId === authorId) return true;
  if (isBlockedEitherDirection(viewerId, authorId)) return false;

  const level = normalizeVisibility(visibility);
  if (level === 'private') return false;
  if (level === 'sky_friends') {
    const viewerFollows = listFollowing(viewerId).includes(authorId);
    const authorFollows = listFollowing(authorId).includes(viewerId);
    return viewerFollows && authorFollows;
  }
  return true;
}

export function canViewerAccessMediaAsset(input: {
  viewerId: string;
  ownerUserId: string;
  skywriteId: string | null;
  skywriteVisibility: SkywriteVisibility | null;
}): boolean {
  if (input.viewerId === input.ownerUserId) return true;
  if (!input.skywriteId || !input.skywriteVisibility) return false;
  return canViewerAccessSkywrite({
    viewerId: input.viewerId,
    authorId: input.ownerUserId,
    visibility: input.skywriteVisibility,
  });
}
