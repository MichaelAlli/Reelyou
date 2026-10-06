import { createHash, randomBytes } from 'node:crypto';

import { loadAccountDatabase, persistAccountDatabase } from '../db/accountStore.js';

export interface StoredRefreshToken {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: number;
  revokedAt: number | null;
  createdAt: number;
}

const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function db() {
  const store = loadAccountDatabase();
  if (!store.refreshTokens) store.refreshTokens = [];
  return store;
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function issueRefreshToken(userId: string, now = Date.now()): string {
  const raw = randomBytes(32).toString('base64url');
  const entry: StoredRefreshToken = {
    id: randomBytes(12).toString('hex'),
    userId,
    tokenHash: hashToken(raw),
    expiresAt: now + REFRESH_TTL_MS,
    revokedAt: null,
    createdAt: now,
  };
  db().refreshTokens!.push(entry);
  persistAccountDatabase();
  return raw;
}

export function revokeRefreshTokensForUser(userId: string, now = Date.now()): void {
  for (const row of db().refreshTokens ?? []) {
    if (row.userId === userId && row.revokedAt == null) {
      row.revokedAt = now;
    }
  }
  persistAccountDatabase();
}

export function consumeRefreshToken(raw: string, now = Date.now()): string | null {
  const hash = hashToken(raw);
  const row = db().refreshTokens?.find(
    (t) => t.tokenHash === hash && t.revokedAt == null && t.expiresAt > now,
  );
  if (!row) return null;
  row.revokedAt = now;
  persistAccountDatabase();
  return row.userId;
}
