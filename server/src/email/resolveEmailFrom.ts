import { config } from '../config.js';
import { normalizeEmailFrom, type NormalizeEmailFromResult } from './normalizeEmailFrom.js';

const DEV_FALLBACK_FROM = 'REELYOU <onboarding@resend.dev>';

export function rawEmailFromEnv(): string {
  return config.email.fromAddress.trim();
}

export function resolveTransactionalEmailFrom(): NormalizeEmailFromResult {
  const raw = rawEmailFromEnv();
  if (raw) return normalizeEmailFrom(raw);
  if (!config.isProduction) return normalizeEmailFrom(DEV_FALLBACK_FROM);
  return { ok: false, reason: 'missing_email_from' };
}
