import { normalizeResendApiKey, normalizeSecretEnv } from './normalizeEmailFrom.js';

/** Prefer live process.env on every send/health check (Render secrets), fall back to boot-time config snapshot. */
export function effectiveResendApiKey(fallbackFromConfig = ''): string {
  const fromEnv = normalizeResendApiKey(process.env.RESEND_API_KEY ?? '');
  if (fromEnv.length > 0) return fromEnv;
  return fallbackFromConfig;
}

export function effectiveEmailFromRaw(fallbackFromConfig = ''): string {
  const fromEnv = normalizeSecretEnv(process.env.EMAIL_FROM ?? '');
  if (fromEnv.length > 0) return fromEnv;
  return fallbackFromConfig.trim();
}
