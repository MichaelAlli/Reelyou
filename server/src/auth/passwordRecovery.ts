import { createHash, randomBytes } from 'node:crypto';

import { normalizeEmail } from '../friendMatch/identifierNormalize.js';
import { loadAccountDatabase, persistAccountDatabase } from '../db/accountStore.js';
import { hashPassword } from './password.js';
import { revokeRefreshTokensForUser } from './refreshTokens.js';
import {
  buildPasswordResetEmail,
  sendTransactionalEmail,
  emailProviderConfigured,
  resendSendDiagnostics,
} from '../email/transactionalEmail.js';
import { maskEmail } from './maskEmail.js';
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

function buildResetLink(rawToken: string): string {
  const appOrigin = config.appOrigin.replace(/\/$/, '');
  return `${appOrigin}/reset-password?token=${encodeURIComponent(rawToken)}`;
}

export { emailProviderConfigured as emailDeliveryConfigured };

export type PasswordResetRequestResult =
  | { ok: true; accountFound: false }
  | { ok: true; accountFound: true; emailSent: true; maskedEmail: string }
  | { ok: false; error: 'invalid_email' | 'email_delivery_failed' };

export async function requestPasswordReset(email: string): Promise<PasswordResetRequestResult> {
  console.log('[password-reset] handler-start');
  const normalized = normalizeEmail(email);
  if (!normalized) {
    return { ok: false, error: 'invalid_email' };
  }

  const user = findUserByEmail(email);
  if (!user) {
    console.log('[password-reset] user-found=false');
    return { ok: true, accountFound: false };
  }

  console.log('[password-reset] user-found=true');
  let token: string;
  try {
    token = createRecoveryToken(user.id, 'password_reset');
    console.log('[password-reset] reset-record-created=true');
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('[password-reset] reset-record-created=false', {
      exceptionName: err.name,
      exceptionMessage: err.message.slice(0, 300),
    });
    throw error;
  }

  let link: string;
  let text: string;
  let html: string;
  try {
    link = buildResetLink(token);
    ({ text, html } = buildPasswordResetEmail(link));
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('[password-reset] email-template-failed', {
      exceptionName: err.name,
      exceptionMessage: err.message.slice(0, 300),
    });
    throw error;
  }

  const providerReady = emailProviderConfigured();
  console.log('[password-reset] email-provider-configured=' + providerReady, {
    ...resendSendDiagnostics(),
  });

  if (!providerReady) {
    if (!config.isProduction) {
      console.warn(
        `[reellyou-auth] Email not configured — password reset link for ${user.emailNormalized}:\n${link}`,
      );
    } else {
      console.error('[reellyou-auth] password_reset_email_failed', {
        ...resendSendDiagnostics(),
        phase: 'before_resend_api_call',
        reason: 'email_provider_not_configured',
      });
    }
    return { ok: false, error: 'email_delivery_failed' };
  }

  let sent: Awaited<ReturnType<typeof sendTransactionalEmail>>;
  try {
    sent = await sendTransactionalEmail({
      to: user.emailNormalized,
      subject: 'Reset your REELYOU password',
      text,
      html,
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('[password-reset] send-threw', {
      exceptionName: err.name,
      exceptionMessage: err.message.slice(0, 300),
      ...resendSendDiagnostics(),
    });
    return { ok: false, error: 'email_delivery_failed' };
  }

  if (sent !== 'sent') {
    console.error('[reellyou-auth] password_reset_email_failed', {
      ...resendSendDiagnostics(),
      phase:
        sent === 'not_configured' || sent === 'invalid_from'
          ? 'before_resend_api_call'
          : 'from_resend_response',
      reason: sent,
    });
    return { ok: false, error: 'email_delivery_failed' };
  }

  return {
    ok: true,
    accountFound: true,
    emailSent: true,
    maskedEmail: maskEmail(user.emailNormalized),
  };
}

export type UsernameReminderRequestResult =
  | { ok: true; accountFound: false }
  | { ok: true; accountFound: true; emailSent: true; maskedEmail: string }
  | { ok: false; error: 'invalid_email' | 'email_delivery_failed' };

export async function requestUsernameReminder(
  email: string,
): Promise<UsernameReminderRequestResult> {
  const normalized = normalizeEmail(email);
  if (!normalized) {
    return { ok: false, error: 'invalid_email' };
  }

  const user = findUserByEmail(email);
  if (!user) {
    return { ok: true, accountFound: false };
  }

  if (!emailProviderConfigured()) {
    if (!config.isProduction) {
      console.warn(
        `[reellyou-auth] Email not configured — sign-in email reminder for ${user.emailNormalized}: ${user.emailNormalized}`,
      );
    }
    return { ok: false, error: 'email_delivery_failed' };
  }

  const sent = await sendTransactionalEmail({
    to: user.emailNormalized,
    subject: 'Your REELYOU sign-in email',
    text: `You asked for a reminder of the email address on your REELYOU account:\n\n${user.emailNormalized}\n\nSign in with this email and your password.`,
  });

  if (sent !== 'sent') {
    return { ok: false, error: 'email_delivery_failed' };
  }

  return {
    ok: true,
    accountFound: true,
    emailSent: true,
    maskedEmail: maskEmail(user.emailNormalized),
  };
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
