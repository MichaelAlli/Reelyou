import {
  addBlock,
  addComment,
  addFollow,
  createSkywrite,
  listBlocked,
  listComments,
  listFollowers,
  listFollowing,
  listSkywritesForAuthor,
  removeBlock,
  removeFollow,
} from './socialRepository.js';

export function handleGetSocialState(userId: string) {
  return {
    followingUserIds: listFollowing(userId),
    followerUserIds: listFollowers(userId),
    blockedUserIds: listBlocked(userId),
  };
}

export function handleFollow(viewerId: string, targetUserId: string) {
  const ok = addFollow(viewerId, targetUserId);
  return ok ? { ok: true } : { ok: false, error: 'follow_failed' };
}

export function handleUnfollow(viewerId: string, targetUserId: string) {
  removeFollow(viewerId, targetUserId);
  return { ok: true };
}

export function handleBlock(viewerId: string, targetUserId: string) {
  addBlock(viewerId, targetUserId);
  return { ok: true };
}

export function handleUnblock(viewerId: string, targetUserId: string) {
  removeBlock(viewerId, targetUserId);
  return { ok: true };
}

export function handleCreateSkywrite(viewerId: string, body: { text?: string }) {
  const created = createSkywrite(viewerId, body.text ?? '');
  if (!created) return { ok: false as const, error: 'invalid_skywrite' };
  return { ok: true as const, skywrite: created };
}

export function handleListSkywrites(authorUserId: string) {
  return { skywrites: listSkywritesForAuthor(authorUserId) };
}

export function handleListComments(skywriteId: string) {
  return { comments: listComments(skywriteId) };
}

export function handleAddComment(viewerId: string, skywriteId: string, body: { text?: string }) {
  const created = addComment(skywriteId, viewerId, body.text ?? '');
  if (!created) return { ok: false as const, error: 'invalid_comment' };
  return { ok: true as const, comment: created };
}
