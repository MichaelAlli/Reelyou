import {
  addBlock,
  addComment,
  addFollow,
  createSkywrite,
  listBlocked,
  listComments,
  listFollowers,
  listFollowing,
  deleteSkywrite,
  getSkywriteForViewer,
  listRecoverableSkywritesForAuthor,
  listSkywritesForAuthor,
  recoverSkywrite,
  repostSkyreel,
  removeBlock,
  removeFollow,
} from './socialRepository.js';
import type { CreateSkywriteInput } from './skywriteTypes.js';

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

export function handleCreateSkywrite(viewerId: string, body: CreateSkywriteInput) {
  const created = createSkywrite(viewerId, body);
  if (!created) return { ok: false as const, error: 'invalid_skywrite' };
  return { ok: true as const, skywrite: created };
}

export function handleListSkywrites(authorUserId: string, viewerId: string) {
  return { skywrites: listSkywritesForAuthor(authorUserId, viewerId) };
}

export function handleGetSkywrite(viewerId: string, skywriteId: string) {
  const skywrite = getSkywriteForViewer(skywriteId, viewerId);
  if (!skywrite) return { ok: false as const, error: 'not_found' };
  return { ok: true as const, skywrite };
}

export async function handleDeleteSkywrite(viewerId: string, skywriteId: string) {
  const ok = await deleteSkywrite(viewerId, skywriteId);
  return ok ? { ok: true as const } : { ok: false as const, error: 'not_found' };
}

export function handleRecoverSkywrite(viewerId: string, skywriteId: string) {
  const ok = recoverSkywrite(viewerId, skywriteId);
  return ok ? { ok: true as const } : { ok: false as const, error: 'not_recoverable' };
}

export function handleListRecoverableSkywrites(viewerId: string) {
  return { skywrites: listRecoverableSkywritesForAuthor(viewerId) };
}

export function handleRepostSkyreel(viewerId: string, skywriteId: string) {
  const skywrite = repostSkyreel(viewerId, skywriteId);
  if (!skywrite) return { ok: false as const, error: 'not_allowed' };
  return { ok: true as const, skywrite };
}

export function handleListComments(skywriteId: string) {
  return { comments: listComments(skywriteId) };
}

export function handleAddComment(viewerId: string, skywriteId: string, body: { text?: string }) {
  const created = addComment(skywriteId, viewerId, body.text ?? '');
  if (!created) return { ok: false as const, error: 'invalid_comment' };
  return { ok: true as const, comment: created };
}
