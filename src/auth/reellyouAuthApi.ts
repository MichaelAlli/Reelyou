import { resolveAuthApiBaseUrl } from '@/auth/reellyouAuthConfig';
import type { StoredAuthUser } from '@/auth/reellyouAuthPersistence';

export type AuthApiResult =
  | { ok: true; accessToken: string; refreshToken?: string | null; user: StoredAuthUser }
  | { ok: false; error: string };

function mapHttpStatusToAuthError(status: number): string {
  if (status === 404) return 'api_not_found';
  if (status === 429) return 'rate_limited';
  if (status === 503) return 'server_error';
  if (status >= 500) return 'server_error';
  if (status >= 400) return 'invalid_request';
  return 'network_error';
}

async function parseAuthResponse(res: Response): Promise<{ ok: boolean; error?: string; body?: Record<string, unknown> }> {
  let body: Record<string, unknown> = {};
  try {
    body = (await res.json()) as Record<string, unknown>;
  } catch {
    if (!res.ok) return { ok: false, error: mapHttpStatusToAuthError(res.status) };
    return { ok: false, error: 'server_error' };
  }
  if (body.ok === true) return { ok: true, body };
  const err = typeof body.error === 'string' ? body.error : undefined;
  if (!res.ok) return { ok: false, error: err ?? (res.status >= 500 ? 'server_error' : 'invalid_credentials') };
  return { ok: false, error: err ?? 'server_error' };
}

async function authPost(path: string, payload: unknown): Promise<AuthApiResult | { ok: false; error: string }> {
  const base = resolveAuthApiBaseUrl();
  if (!base) return { ok: false, error: 'auth_not_configured' };
  try {
    const res = await fetch(`${base}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const parsed = await parseAuthResponse(res);
    if (!parsed.ok || !parsed.body) return { ok: false, error: parsed.error ?? 'server_error' };
    const accessToken = parsed.body.accessToken;
    const user = parsed.body.user;
    if (typeof accessToken !== 'string' || !user || typeof user !== 'object') {
      return { ok: false, error: 'server_error' };
    }
    const refreshToken =
      typeof parsed.body.refreshToken === 'string' ? parsed.body.refreshToken : null;
    return {
      ok: true,
      accessToken,
      refreshToken,
      user: user as StoredAuthUser,
    };
  } catch {
    return { ok: false, error: 'network_error' };
  }
}

export async function registerAccount(input: {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  termsAccepted: boolean;
  termsVersion: string;
  privacyVersion: string;
  consentAcceptedAt: number;
}): Promise<AuthApiResult> {
  return authPost('/v1/auth/register', input);
}

export async function loginAccount(input: {
  email: string;
  password: string;
  rememberMe?: boolean;
}): Promise<AuthApiResult> {
  return authPost('/v1/auth/login', input);
}

export async function refreshAuthSession(refreshToken: string): Promise<AuthApiResult> {
  return authPost('/v1/auth/refresh', { refreshToken });
}

export async function fetchSession(accessToken: string): Promise<StoredAuthUser | null> {
  const base = resolveAuthApiBaseUrl();
  if (!base) return null;
  try {
    const res = await fetch(`${base}/v1/auth/session`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { ok?: boolean; user?: StoredAuthUser };
    if (!body.user) return null;
    return body.user;
  } catch {
    return null;
  }
}

export type PasswordForgotApiResult =
  | { ok: true; accountFound: false }
  | { ok: true; accountFound: true; maskedEmail: string }
  | { ok: false; error?: string };

export async function requestPasswordReset(email: string): Promise<PasswordForgotApiResult> {
  const base = resolveAuthApiBaseUrl();
  if (!base) return { ok: false, error: 'auth_not_configured' };
  try {
    const res = await fetch(`${base}/v1/auth/password/forgot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const body = (await res.json()) as {
      ok?: boolean;
      error?: string;
      accountFound?: boolean;
      maskedEmail?: string;
      emailSent?: boolean;
      emailConfigured?: boolean;
    };
    if (!res.ok) {
      if (body.error === 'email_delivery_failed') {
        return { ok: false, error: 'email_delivery_failed' };
      }
      return { ok: false, error: body.error ?? 'server_error' };
    }
    if (body.ok !== true) return { ok: false, error: body.error ?? 'server_error' };
    if (body.accountFound === false) return { ok: true, accountFound: false };
    if (body.emailConfigured === false || body.emailSent === false) {
      return { ok: false, error: 'email_delivery_failed' };
    }
    if (body.accountFound === true && typeof body.maskedEmail === 'string') {
      return { ok: true, accountFound: true, maskedEmail: body.maskedEmail };
    }
    return { ok: false, error: 'server_error' };
  } catch {
    return { ok: false, error: 'network_error' };
  }
}

export async function resetPasswordWithToken(input: {
  token: string;
  password: string;
}): Promise<{ ok: boolean; error?: string }> {
  const base = resolveAuthApiBaseUrl();
  if (!base) return { ok: false, error: 'auth_not_configured' };
  try {
    const res = await fetch(`${base}/v1/auth/password/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const body = (await res.json()) as { ok?: boolean; error?: string };
    return { ok: body.ok === true, error: body.error };
  } catch {
    return { ok: false, error: 'network_error' };
  }
}

export async function requestUsernameRecovery(email: string): Promise<PasswordForgotApiResult> {
  const base = resolveAuthApiBaseUrl();
  if (!base) return { ok: false, error: 'auth_not_configured' };
  try {
    const res = await fetch(`${base}/v1/auth/username/forgot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const body = (await res.json()) as {
      ok?: boolean;
      error?: string;
      accountFound?: boolean;
      maskedEmail?: string;
    };
    if (!res.ok) return { ok: false, error: body.error ?? 'server_error' };
    if (body.ok !== true) return { ok: false, error: body.error ?? 'server_error' };
    if (body.accountFound === false) return { ok: true, accountFound: false };
    if (body.accountFound === true && typeof body.maskedEmail === 'string') {
      return { ok: true, accountFound: true, maskedEmail: body.maskedEmail };
    }
    return { ok: false, error: 'server_error' };
  } catch {
    return { ok: false, error: 'network_error' };
  }
}
