import { randomUUID } from 'node:crypto';

import { getUserById } from '../db/accountRepository.js';
import { loadAccountDatabase, persistAccountDatabase } from '../db/accountStore.js';

export interface FollowEdge {
  followerUserId: string;
  followedUserId: string;
  createdAt: number;
}

function db() {
  const store = loadAccountDatabase();
  if (!store.followEdges) store.followEdges = [];
  if (!store.skywrites) store.skywrites = [];
  if (!store.comments) store.comments = [];
  return store;
}

export function listFollowing(userId: string): string[] {
  return db()
    .followEdges!.filter((e) => e.followerUserId === userId)
    .map((e) => e.followedUserId);
}

export function listFollowers(userId: string): string[] {
  return db()
    .followEdges!.filter((e) => e.followedUserId === userId)
    .map((e) => e.followerUserId);
}

export function listBlocked(userId: string): string[] {
  return db()
    .blocks.filter((b) => b.blockerId === userId)
    .map((b) => b.blockedId);
}

export function isBlockedEitherDirection(userA: string, userB: string): boolean {
  return db().blocks.some(
    (b) =>
      (b.blockerId === userA && b.blockedId === userB) ||
      (b.blockerId === userB && b.blockedId === userA),
  );
}

export function addFollow(followerUserId: string, followedUserId: string): boolean {
  if (followerUserId === followedUserId) return false;
  if (!getUserById(followedUserId) || !getUserById(followerUserId)) return false;
  if (isBlockedEitherDirection(followerUserId, followedUserId)) return false;
  const store = db();
  const edges = store.followEdges!;
  const exists = edges.some(
    (e) => e.followerUserId === followerUserId && e.followedUserId === followedUserId,
  );
  if (exists) return true;
  edges.push({ followerUserId, followedUserId, createdAt: Date.now() });
  persistAccountDatabase();
  return true;
}

export function removeFollow(followerUserId: string, followedUserId: string): void {
  const store = db();
  store.followEdges = store.followEdges!.filter(
    (e) => !(e.followerUserId === followerUserId && e.followedUserId === followedUserId),
  );
  persistAccountDatabase();
}

export function addBlock(blockerId: string, blockedId: string): void {
  if (blockerId === blockedId) return;
  const store = db();
  if (!store.blocks.some((b) => b.blockerId === blockerId && b.blockedId === blockedId)) {
    store.blocks.push({ blockerId, blockedId, createdAt: Date.now() });
  }
  removeFollow(blockerId, blockedId);
  removeFollow(blockedId, blockerId);
  persistAccountDatabase();
}

export function removeBlock(blockerId: string, blockedId: string): void {
  const store = db();
  store.blocks = store.blocks.filter(
    (b) => !(b.blockerId === blockerId && b.blockedId === blockedId),
  );
  persistAccountDatabase();
}

export type { StoredSkywrite, CreateSkywriteInput } from './skywriteTypes.js';
import type { CreateSkywriteInput, StoredSkywrite, SkywriteVisibility } from './skywriteTypes.js';
import {
  attachAssetsToSkywrite,
  assertAssetsReadyForPublish,
  purgeMediaForSkywrite,
} from '../media/mediaRepository.js';
import { canViewerAccessSkywrite } from './contentVisibility.js';
import { SKYWRITE_RECOVERY_WINDOW_MS } from './skywriteDeletionConstants.js';
import { SKYREEL_WINDOW_MS, SKYWRITE_RECENT_RETENTION_MS } from './skyreelConstants.js';

export interface StoredComment {
  id: string;
  skywriteId: string;
  authorUserId: string;
  text: string;
  createdAt: number;
}

function isVisibility(v: unknown): v is SkywriteVisibility {
  return v === 'private' || v === 'orbit' || v === 'sky_friends' || v === 'public';
}

export function createSkywrite(
  authorUserId: string,
  input: CreateSkywriteInput | string,
): StoredSkywrite | null {
  if (!getUserById(authorUserId)) return null;
  const body: CreateSkywriteInput =
    typeof input === 'string' ? { text: input } : input ?? {};
  const trimmed = (body.text ?? '').trim();
  const media = body.media ?? {};
  const hasMedia =
    Boolean(media.photoAssetId) ||
    Boolean(media.videoAssetId) ||
    Boolean(media.audioAssetId);
  if (!trimmed && !hasMedia) return null;

  const assetCheck = assertAssetsReadyForPublish(authorUserId, media);
  if (!assetCheck.ok) return null;

  const createdAt = body.createdAt ? Date.parse(body.createdAt) : Date.now();
  const entry: StoredSkywrite = {
    id: body.id?.trim() || randomUUID(),
    authorUserId,
    text: trimmed.slice(0, 4000),
    createdAt: Number.isFinite(createdAt) ? createdAt : Date.now(),
    visibility: isVisibility(body.visibility) ? body.visibility : 'orbit',
    mediaMode: body.mediaMode?.trim() || 'text',
    textStyle: body.textStyle,
    userHashtags: Array.isArray(body.userHashtags)
      ? body.userHashtags.filter((t) => typeof t === 'string').slice(0, 32)
      : [],
    mood: body.mood ?? null,
    showingUp: body.showingUp ?? null,
    skyAreaId: body.skyAreaId,
    intent: body.intent,
    animateToSky: body.animateToSky !== false,
    allowAIContext: body.allowAIContext !== false,
    experiencedAt: body.experiencedAt,
    media,
    deletedAt: null,
    deletionPurgeAfter: null,
    skyreelActiveUntilMs: (Number.isFinite(createdAt) ? createdAt : Date.now()) + SKYREEL_WINDOW_MS,
    skyreelRepostedAtMs: null,
    publishedAtMs: Number.isFinite(createdAt) ? createdAt : Date.now(),
    recentVisibleUntilMs:
      (Number.isFinite(createdAt) ? createdAt : Date.now()) + SKYWRITE_RECENT_RETENTION_MS,
    inYourJourney: body.inYourJourney === true,
    journeyAddedAtMs: body.inYourJourney === true ? Date.now() : null,
  };
  db().skywrites!.push(entry);
  attachAssetsToSkywrite(entry.id, authorUserId, media);
  persistAccountDatabase();
  return entry;
}

export function listSkywritesForAuthor(
  authorUserId: string,
  viewerId: string,
): StoredSkywrite[] {
  return db()
    .skywrites!.filter(
      (s) =>
        s.authorUserId === authorUserId &&
        !s.deletedAt &&
        canViewerAccessSkywrite({
          viewerId,
          authorId: s.authorUserId,
          visibility: s.visibility,
        }),
    )
    .sort((a, b) => b.createdAt - a.createdAt);
}

function findSkywriteRow(id: string): StoredSkywrite | undefined {
  return db().skywrites!.find((s) => s.id === id);
}

export function isSkywriteInRecovery(row: StoredSkywrite, now = Date.now()): boolean {
  if (!row.deletedAt) return false;
  const purgeAfter = row.deletionPurgeAfter ?? row.deletedAt + SKYWRITE_RECOVERY_WINDOW_MS;
  return now < purgeAfter;
}

export function getSkywrite(id: string): StoredSkywrite | undefined {
  const row = findSkywriteRow(id);
  if (!row || row.deletedAt) return undefined;
  return row;
}

export function getSkywriteRowIncludingDeleted(id: string): StoredSkywrite | undefined {
  const row = findSkywriteRow(id);
  if (!row) return undefined;
  if (row.deletedAt && !isSkywriteInRecovery(row)) return undefined;
  return row;
}

export function listRecoverableSkywritesForAuthor(authorUserId: string, now = Date.now()): StoredSkywrite[] {
  return db()
    .skywrites!.filter(
      (s) =>
        s.authorUserId === authorUserId &&
        s.deletedAt != null &&
        isSkywriteInRecovery(s, now),
    )
    .sort((a, b) => (b.deletedAt ?? 0) - (a.deletedAt ?? 0));
}

export function getSkywriteForViewer(id: string, viewerId: string): StoredSkywrite | undefined {
  const row = getSkywriteRowIncludingDeleted(id);
  if (!row) return undefined;
  if (row.deletedAt) {
    return viewerId === row.authorUserId ? row : undefined;
  }
  if (
    !canViewerAccessSkywrite({
      viewerId,
      authorId: row.authorUserId,
      visibility: row.visibility,
    })
  ) {
    return undefined;
  }
  return row;
}

export function isSkyreelActive(row: StoredSkywrite, now = Date.now()): boolean {
  if (row.deletedAt) return false;
  const until =
    row.skyreelActiveUntilMs ??
    row.createdAt + SKYREEL_WINDOW_MS;
  return now < until;
}

export function addSkywriteToYourJourney(
  authorUserId: string,
  skywriteId: string,
  now = Date.now(),
): StoredSkywrite | null {
  const row = findSkywriteRow(skywriteId);
  if (!row || row.authorUserId !== authorUserId || row.deletedAt) return null;
  if (row.inYourJourney) return row;
  row.inYourJourney = true;
  row.journeyAddedAtMs = now;
  if (row.publishedAtMs == null || !Number.isFinite(row.publishedAtMs)) {
    row.publishedAtMs = row.createdAt;
  }
  if (row.recentVisibleUntilMs == null || !Number.isFinite(row.recentVisibleUntilMs)) {
    row.recentVisibleUntilMs = row.publishedAtMs + SKYWRITE_RECENT_RETENTION_MS;
  }
  persistAccountDatabase();
  return row;
}

export function repostSkyreel(authorUserId: string, skywriteId: string, now = Date.now()): StoredSkywrite | null {
  const row = findSkywriteRow(skywriteId);
  if (!row || row.authorUserId !== authorUserId || row.deletedAt) return null;
  row.skyreelActiveUntilMs = now + SKYREEL_WINDOW_MS;
  row.skyreelRepostedAtMs = now;
  persistAccountDatabase();
  return row;
}

export async function deleteSkywrite(authorUserId: string, skywriteId: string): Promise<boolean> {
  const row = findSkywriteRow(skywriteId);
  if (!row || row.authorUserId !== authorUserId || row.deletedAt) return false;
  const now = Date.now();
  row.deletedAt = now;
  row.deletionPurgeAfter = now + SKYWRITE_RECOVERY_WINDOW_MS;
  persistAccountDatabase();
  return true;
}

export function recoverSkywrite(authorUserId: string, skywriteId: string): boolean {
  const row = findSkywriteRow(skywriteId);
  if (!row || row.authorUserId !== authorUserId || !row.deletedAt) return false;
  if (!isSkywriteInRecovery(row)) return false;
  row.deletedAt = null;
  row.deletionPurgeAfter = null;
  persistAccountDatabase();
  return true;
}

export async function purgeSkywritePermanently(skywriteId: string): Promise<void> {
  const row = findSkywriteRow(skywriteId);
  if (!row) return;
  await purgeMediaForSkywrite(skywriteId, row.authorUserId);
  const store = db();
  store.skywrites = store.skywrites!.filter((s) => s.id !== skywriteId);
  store.comments = (store.comments ?? []).filter((c) => c.skywriteId !== skywriteId);
  persistAccountDatabase();
}

export async function processScheduledSkywritePurges(now = Date.now()): Promise<number> {
  const pending = db().skywrites!.filter(
    (s) => s.deletedAt != null && !isSkywriteInRecovery(s, now),
  );
  for (const row of pending) {
    await purgeSkywritePermanently(row.id);
  }
  return pending.length;
}

export function addComment(skywriteId: string, authorUserId: string, text: string): StoredComment | null {
  if (!getSkywrite(skywriteId) || !getUserById(authorUserId)) return null;
  const trimmed = text.trim();
  if (!trimmed) return null;
  const entry: StoredComment = {
    id: randomUUID(),
    skywriteId,
    authorUserId,
    text: trimmed.slice(0, 2000),
    createdAt: Date.now(),
  };
  db().comments!.push(entry);
  persistAccountDatabase();
  return entry;
}

export function listComments(skywriteId: string): StoredComment[] {
  return db()
    .comments!.filter((c) => c.skywriteId === skywriteId)
    .sort((a, b) => a.createdAt - b.createdAt);
}
