import { randomBytes } from 'node:crypto';

import { rebuildUserDiscoverabilityIndexes } from '../friendMatch/discoverabilityIndex.js';
import { purgeSkywritePermanently } from '../social/socialRepository.js';
import { loadAccountDatabase, persistAccountDatabase, type StoredUser } from '../db/accountStore.js';
import { getUserRecord } from '../db/accountRepository.js';
import {
  DELETION_CANCEL_WINDOW_MS,
  DELETION_PURGE_WINDOW_MS,
} from './accountDeletionConstants.js';

export interface AccountDeletionStatus {
  deletionPending: boolean;
  requestedAt: number | null;
  cancelUntil: number | null;
  purgeAfter: number | null;
  lockedOut: boolean;
}

export function getAccountDeletionStatus(user: StoredUser, now = Date.now()): AccountDeletionStatus {
  const requestedAt = user.deletionRequestedAt ?? null;
  if (!requestedAt) {
    return {
      deletionPending: false,
      requestedAt: null,
      cancelUntil: null,
      purgeAfter: null,
      lockedOut: user.deletedAt != null,
    };
  }
  const cancelUntil = requestedAt + DELETION_CANCEL_WINDOW_MS;
  const purgeAfter = user.deletionPurgeAfter ?? requestedAt + DELETION_PURGE_WINDOW_MS;
  const lockedOut = user.deletedAt != null || now > cancelUntil;
  return {
    deletionPending: true,
    requestedAt,
    cancelUntil,
    purgeAfter,
    lockedOut,
  };
}

export function isUserHiddenFromOthers(userId: string): boolean {
  const user = getUserRecord(userId);
  if (!user) return true;
  if (user.deletedAt != null) return true;
  return user.deletionRequestedAt != null;
}

export function requestAccountDeletion(userId: string):
  | { ok: true; status: AccountDeletionStatus }
  | { ok: false; error: string } {
  const db = loadAccountDatabase();
  const user = db.users.find((u) => u.id === userId && u.deletedAt == null);
  if (!user) return { ok: false, error: 'not_found' };
  if (user.deletionRequestedAt) {
    return { ok: true, status: getAccountDeletionStatus(user) };
  }
  const now = Date.now();
  user.deletionRequestedAt = now;
  user.deletionPurgeAfter = now + DELETION_PURGE_WINDOW_MS;
  db.discoveryPreferences[userId] = {
    discoverableByPhone: false,
    discoverableByEmail: false,
    updatedAt: now,
  };
  rebuildUserDiscoverabilityIndexes(userId);
  persistAccountDatabase();
  return { ok: true, status: getAccountDeletionStatus(user) };
}

export function cancelAccountDeletion(userId: string):
  | { ok: true; status: AccountDeletionStatus }
  | { ok: false; error: string } {
  const db = loadAccountDatabase();
  const user = db.users.find((u) => u.id === userId && u.deletedAt == null);
  if (!user?.deletionRequestedAt) return { ok: false, error: 'not_pending' };
  const now = Date.now();
  if (now > user.deletionRequestedAt + DELETION_CANCEL_WINDOW_MS) {
    return { ok: false, error: 'cancel_window_closed' };
  }
  user.deletionRequestedAt = null;
  user.deletionPurgeAfter = null;
  rebuildUserDiscoverabilityIndexes(userId);
  persistAccountDatabase();
  return { ok: true, status: getAccountDeletionStatus(user) };
}

async function scrubUserContent(userId: string): Promise<void> {
  const db = loadAccountDatabase();
  const toDelete = (db.skywrites ?? []).filter((s) => s.authorUserId === userId);
  for (const sw of toDelete) {
    await purgeSkywritePermanently(sw.id);
  }
  db.comments = (db.comments ?? []).filter((c) => c.authorUserId !== userId);
  db.followEdges = (db.followEdges ?? []).filter(
    (e) => e.followerUserId !== userId && e.followedUserId !== userId,
  );
  db.blocks = db.blocks.filter((b) => b.blockerId !== userId && b.blockedId !== userId);
  delete db.discoveryPreferences[userId];
  delete db.friendImport[userId];
  for (const [idx, owner] of Object.entries(db.phoneIndex)) {
    if (owner === userId) delete db.phoneIndex[idx];
  }
  for (const [idx, owner] of Object.entries(db.emailIndex)) {
    if (owner === userId) delete db.emailIndex[idx];
  }
}

function finalizeLockedAccount(user: StoredUser, now: number): void {
  if (user.deletedAt == null) {
    user.deletedAt = now;
  }
}

async function purgeUserRecord(user: StoredUser, now: number): Promise<void> {
  await scrubUserContent(user.id);
  user.emailNormalized = `deleted+${user.id}@reellyou.invalid`;
  user.fullName = 'Deleted user';
  user.phoneE164 = null;
  user.passwordHash = randomBytes(32).toString('hex');
  user.deletedAt = user.deletedAt ?? now;
  user.deletionRequestedAt = user.deletionRequestedAt ?? now;
  user.deletionPurgeAfter = user.deletionPurgeAfter ?? now;
}

/** Run on startup and after deletion mutations. */
export async function processScheduledAccountDeletions(now = Date.now()): Promise<number> {
  const db = loadAccountDatabase();
  let processed = 0;
  for (const user of db.users) {
    if (!user.deletionRequestedAt) continue;
    if (user.emailNormalized.startsWith('deleted+')) continue;
    const cancelUntil = user.deletionRequestedAt + DELETION_CANCEL_WINDOW_MS;
    const purgeAfter = user.deletionPurgeAfter ?? user.deletionRequestedAt + DELETION_PURGE_WINDOW_MS;
    if (now >= purgeAfter) {
      await purgeUserRecord(user, now);
      processed += 1;
      continue;
    }
    if (now >= cancelUntil && user.deletedAt == null) {
      finalizeLockedAccount(user, now);
      processed += 1;
    }
  }
  if (processed > 0) persistAccountDatabase();
  return processed;
}

export function assertUserMayAuthenticate(userId: string, now = Date.now()): boolean {
  const user = getUserRecord(userId);
  if (!user) return false;
  if (user.deletedAt != null && user.emailNormalized.startsWith('deleted+')) return false;
  const status = getAccountDeletionStatus(user, now);
  if (status.deletionPending && status.lockedOut) return false;
  return true;
}
