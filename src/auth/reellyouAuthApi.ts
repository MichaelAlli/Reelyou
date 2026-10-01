import { resolveAuthApiBaseUrl } from '@/auth/reellyouAuthConfig';
import type { StoredAuthUser } from '@/auth/reellyouAuthPersistence';

export type AuthApiResult =
  | { ok: true; accessToken: string; user: StoredAuthUser }
  | { ok: false; error: string };

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
  const base = resolveAuthApiBaseUrl();
  if (!base) return { ok: false, error: 'auth_not_configured' };
  const res = await fetch(`${base}/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const body = (await res.json()) as AuthApiResult;
  return body;
}

export async function loginAccount(input: {
  email: string;
  password: string;
}): Promise<AuthApiResult> {
  const base = resolveAuthApiBaseUrl();
  if (!base) return { ok: false, error: 'auth_not_configured' };
  const res = await fetch(`${base}/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const body = (await res.json()) as AuthApiResult;
  return body;
}

export async function fetchSession(accessToken: string): Promise<StoredAuthUser | null> {
  const base = resolveAuthApiBaseUrl();
  if (!base) return null;
  const res = await fetch(`${base}/v1/auth/session`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return null;
  const body = (await res.json()) as { ok?: boolean; user?: StoredAuthUser };
  return body.user ?? null;
}
