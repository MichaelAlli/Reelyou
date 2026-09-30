import { randomUUID } from 'node:crypto';

import { hashPassword, verifyPassword } from '../auth/password.js';
import { rebuildUserDiscoverabilityIndexes } from '../friendMatch/discoverabilityIndex.js';
import { normalizeEmail, normalizePhone } from '../friendMatch/identifierNormalize.js';
import {
  loadAccountDatabase,
  persistAccountDatabase,
  type StoredUser,
} from './accountStore.js';

export interface PublicUser {
  id: string;
  fullName: string;
  email: string;
}

function findUserByEmail(emailNormalized: string): StoredUser | undefined {
  const db = loadAccountDatabase();
  return db.users.find((u) => u.emailNormalized === emailNormalized && u.deletedAt == null);
}

export function createUser(input: {
  email: string;
  password: string;
  fullName: string;
  phone?: string | null;
}): PublicUser {
  const emailNormalized = normalizeEmail(input.email);
  if (!emailNormalized) throw new Error('invalid_email');
  if (findUserByEmail(emailNormalized)) throw new Error('UNIQUE email');
  const phoneE164 = input.phone ? normalizePhone(input.phone) : null;
  const id = randomUUID();
  const now = Date.now();
  const user: StoredUser = {
    id,
    emailNormalized,
    passwordHash: hashPassword(input.password),
    fullName: input.fullName.trim(),
    phoneE164,
    createdAt: now,
    deletedAt: null,
  };
  const db = loadAccountDatabase();
  db.users.push(user);
  db.discoveryPreferences[id] = {
    discoverableByPhone: false,
    discoverableByEmail: false,
    updatedAt: now,
  };
  persistAccountDatabase();
  return { id, fullName: user.fullName, email: emailNormalized };
}

export function authenticateUser(email: string, password: string): PublicUser | null {
  const emailNormalized = normalizeEmail(email);
  if (!emailNormalized) return null;
  const row = findUserByEmail(emailNormalized);
  if (!row || !verifyPassword(password, row.passwordHash)) return null;
  return { id: row.id, fullName: row.fullName, email: row.emailNormalized };
}

export function getUserById(userId: string): PublicUser | null {
  const db = loadAccountDatabase();
  const row = db.users.find((u) => u.id === userId && u.deletedAt == null);
  if (!row) return null;
  return { id: row.id, fullName: row.fullName, email: row.emailNormalized };
}

export function getDiscoveryPreferences(userId: string): {
  discoverableByPhone: boolean;
  discoverableByEmail: boolean;
  updatedAt: number;
} {
  const db = loadAccountDatabase();
  const row = db.discoveryPreferences[userId];
  if (!row) return { discoverableByPhone: false, discoverableByEmail: false, updatedAt: 0 };
  return row;
}

export function updateDiscoveryPreferences(
  userId: string,
  patch: { discoverableByPhone?: boolean; discoverableByEmail?: boolean },
): { discoverableByPhone: boolean; discoverableByEmail: boolean; updatedAt: number } {
  const current = getDiscoveryPreferences(userId);
  const next = {
    discoverableByPhone: patch.discoverableByPhone ?? current.discoverableByPhone,
    discoverableByEmail: patch.discoverableByEmail ?? current.discoverableByEmail,
    updatedAt: Date.now(),
  };
  const db = loadAccountDatabase();
  db.discoveryPreferences[userId] = next;
  rebuildUserDiscoverabilityIndexes(userId);
  persistAccountDatabase();
  return next;
}

export function blockUser(blockerId: string, blockedId: string): void {
  if (blockerId === blockedId) return;
  const db = loadAccountDatabase();
  const exists = db.blocks.some(
    (b) => b.blockerId === blockerId && b.blockedId === blockedId,
  );
  if (!exists) {
    db.blocks.push({ blockerId, blockedId, createdAt: Date.now() });
    persistAccountDatabase();
  }
}

export function areUsersBlocked(userA: string, userB: string): boolean {
  const db = loadAccountDatabase();
  return db.blocks.some(
    (b) =>
      (b.blockerId === userA && b.blockedId === userB) ||
      (b.blockerId === userB && b.blockedId === userA),
  );
}

export function clearImportedDiscoveryData(userId: string): void {
  const db = loadAccountDatabase();
  db.friendImport[userId] = { hasImportedContactData: false, updatedAt: Date.now() };
  persistAccountDatabase();
}

export function markImportedDiscoveryData(userId: string): void {
  const db = loadAccountDatabase();
  db.friendImport[userId] = { hasImportedContactData: true, updatedAt: Date.now() };
  persistAccountDatabase();
}

export function getUserRecord(userId: string): StoredUser | null {
  const db = loadAccountDatabase();
  const row = db.users.find((u) => u.id === userId && u.deletedAt == null);
  return row ?? null;
}
