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
    .followEdges.filter((e) => e.followerUserId === userId)
    .map((e) => e.followedUserId);
}

export function listFollowers(userId: string): string[] {
  return db()
    .followEdges.filter((e) => e.followedUserId === userId)
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
  const exists = store.followEdges.some(
    (e) => e.followerUserId === followerUserId && e.followedUserId === followedUserId,
  );
  if (exists) return true;
  store.followEdges.push({ followerUserId, followedUserId, createdAt: Date.now() });
  persistAccountDatabase();
  return true;
}

export function removeFollow(followerUserId: string, followedUserId: string): void {
  const store = db();
  store.followEdges = store.followEdges.filter(
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

export interface StoredSkywrite {
  id: string;
  authorUserId: string;
  text: string;
  createdAt: number;
}

export interface StoredComment {
  id: string;
  skywriteId: string;
  authorUserId: string;
  text: string;
  createdAt: number;
}

export function createSkywrite(authorUserId: string, text: string): StoredSkywrite | null {
  if (!getUserById(authorUserId)) return null;
  const trimmed = text.trim();
  if (!trimmed) return null;
  const entry: StoredSkywrite = {
    id: randomUUID(),
    authorUserId,
    text: trimmed.slice(0, 4000),
    createdAt: Date.now(),
  };
  db().skywrites!.push(entry);
  persistAccountDatabase();
  return entry;
}

export function listSkywritesForAuthor(authorUserId: string): StoredSkywrite[] {
  return db()
    .skywrites!.filter((s) => s.authorUserId === authorUserId)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function getSkywrite(id: string): StoredSkywrite | undefined {
  return db().skywrites!.find((s) => s.id === id);
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
