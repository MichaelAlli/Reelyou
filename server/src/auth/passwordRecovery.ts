import { createHash, randomBytes } from 'node:crypto';

import { normalizeEmail } from '../friendMatch/identifierNormalize.js';
import { loadAccountDatabase, persistAccountDatabase } from '../db/accountStore.js';
import { hashPassword } from './password.js';
import { revokeRefreshTokensForUser } from './refreshTokens.js';
import { sendTransactionalEmail, emailProviderConfigured } from '../email/transactionalEmail.js';
import { config } from '../config.js';

interface RecoveryTokenRow {
  id: string;
  userId: string;
  purpose: 'password_reset' | 'username_reminder';
  tokenHash: string;
  expiresAt: number;
  usedAt: number | null;
  createdAt: number;
}

const RESET_TTL_MS = 60 * 60 * 1000;

function db() {
  const store = loadAccountDatabase();
  if (!store.recoveryTokens) store.recoveryTokens = [];
  return store;
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function findUserByEmail(email: string) {
  const normalized = normalizeEmail(email);
  if (!normalized) return undefined;
  return loadAccountDatabase().users.find(
    (u) => u.emailNormalized === normalized && u.deletedAt == null,
  );
}

function createRecoveryToken(userId: string, purpose: RecoveryTokenRow['purpose'], now = Date.now()) {
  const raw = randomBytes(32).toString('base64url');
  const row: RecoveryTokenRow = {
    id: randomBytes(10).toString('hex'),
    userId,
    purpose,
    tokenHash: hashToken(raw),
    expiresAt: now + RESET_TTL_MS,
    usedAt: null,
    createdAt: now,
  };
  db().recoveryTokens!.push(row);
  persistAccountDatabase();
  return raw;
}

export function emailDeliveryConfigured(): boolean {
  return emailProviderConfigured();
}

export async function requestPasswordReset(email: string): Promise<{ ok: true; emailSent: boolean }> {
  const user = findUserByEmail(email);
  if (!user) {
    return { ok: true, emailSent: false };
  }
  if (!emailProviderConfigured()) {
    return { ok: true, emailSent: false };
  }
  const token = createRecoveryToken(user.id, 'password_reset');
  const appOrigin = config.appOrigin.replace(/\/$/, '');
  const link = `${appOrigin}/reset-password?token=${encodeURIComponent(token)}`;
  const sent = await sendTransactionalEmail({
    to: user.emailNormalized,
    subject: 'Reset your REELYOU password',
    text: `Use this link within one hour to reset your password:\n\n${link}\n\nIf you did not request this, you can ignore this email.`,
  });
  return { ok: true, emailSent: sent === 'sent' };
}

export async function requestUsernameReminder(email: string): Promise<{ ok: true; emailSent: boolean }> {
  const user = findUserByEmail(email);
  if (!user) {
    return { ok: true, emailSent: false };
  }
  if (!emailProviderConfigured()) {
    return { ok: true, emailSent: false };
  }
  const sent = await sendTransactionalEmail({
    to: user.emailNormalized,
    subject: 'Your REELYOU sign-in email',
    text: `You asked for a reminder of the email address on your REELYOU account:\n\n${user.emailNormalized}\n\nSign in with this email and your password.`,
  });
  return { ok: true, emailSent: sent === 'sent' };
}

export function resetPasswordWithToken(
  rawToken: string,
  newPassword: string,
  now = Date.now(),
): { ok: true } | { ok: false; error: string } {
  if (newPassword.length < 8) return { ok: false, error: 'weak_password' };
  const hash = hashToken(rawToken);
  const row = db().recoveryTokens?.find(
    (t) =>
      t.tokenHash === hash &&
      t.purpose === 'password_reset' &&
      t.usedAt == null &&
      t.expiresAt > now,
  );
  if (!row) return { ok: false, error: 'invalid_or_expired_token' };
  const user = loadAccountDatabase().users.find((u) => u.id === row.userId && u.deletedAt == null);
  if (!user) return { ok: false, error: 'invalid_or_expired_token' };
  user.passwordHash = hashPassword(newPassword);
  row.usedAt = now;
  revokeRefreshTokensForUser(user.id, now);
  persistAccountDatabase();
  return { ok: true };
}
