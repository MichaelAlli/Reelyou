import type { config as AppConfig } from '../config.js';
import { isResendApiKeyFormatValid, normalizeEmailFrom } from './normalizeEmailFrom.js';
import { effectiveResendApiKey, effectiveEmailFromRaw } from './runtimeEmailSecrets.js';

type EmailRuntimeConfig = typeof AppConfig;

/** Password reset / transactional email transport. */
export type TransactionalEmailProvider = 'resend' | 'smtp' | 'none';

const DEV_FALLBACK_FROM = 'REELYOU <onboarding@resend.dev>';

function productionAppOriginValid(state: EmailRuntimeConfig): boolean {
  if (!state.isProduction) return true;
  try {
    const u = new URL(state.appOrigin);
    return u.protocol === 'https:' && u.hostname.length > 0;
  } catch {
    return false;
  }
}

function resolveFromForDelivery(state: EmailRuntimeConfig) {
  const raw = effectiveEmailFromRaw(state.email.fromAddress);
  if (raw) return normalizeEmailFrom(raw);
  if (!state.isProduction) return normalizeEmailFrom(DEV_FALLBACK_FROM);
  return { ok: false as const, reason: 'missing_email_from' };
}

/**
 * Deterministic provider for password recovery and transactional email.
 * If RESEND_API_KEY is non-empty after normalization → always Resend (never SMTP).
 */
export function selectTransactionalEmailProvider(state: EmailRuntimeConfig): TransactionalEmailProvider {
  if (effectiveResendApiKey(state.email.resendApiKey).length > 0) {
    return 'resend';
  }
  if (state.isProduction) {
    return 'none';
  }
  const smtpReady =
    state.email.smtpHost.length > 0 &&
    state.email.smtpUser.length > 0 &&
    state.email.smtpPass.length > 0;
  return smtpReady ? 'smtp' : 'none';
}

/** Resend Authorization header — key must already be normalizeResendApiKey output. */
export function buildResendAuthorizationHeader(normalizedApiKey: string): string {
  return `Bearer ${normalizedApiKey}`;
}

/**
 * True when password-reset email can be sent with the configured provider.
 * SMTP alone must not make this true in production (production requires Resend).
 */
export function passwordRecoveryEmailConfigured(state: EmailRuntimeConfig): boolean {
  const from = resolveFromForDelivery(state);
  if (!from.ok) return false;
  if (state.isProduction && from.domain === 'resend.dev') return false;
  if (!productionAppOriginValid(state)) return false;

  const resendKey = effectiveResendApiKey(state.email.resendApiKey);
  const provider = selectTransactionalEmailProvider(state);
  if (state.isProduction) {
    return provider === 'resend' && isResendApiKeyFormatValid(resendKey);
  }
  if (provider === 'resend') {
    return isResendApiKeyFormatValid(resendKey);
  }
  return provider === 'smtp';
}
