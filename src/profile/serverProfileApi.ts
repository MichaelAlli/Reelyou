import { authenticatedReellyouFetch } from '@/backend/authenticatedReellyouFetch';
import { isReelyouAuthConfigured } from '@/auth/reellyouAuthConfig';
import type { OnboardingState } from '@/onboarding/onboardingState';

export interface ServerUserProfile {
  userId: string;
  fullName: string;
  email: string;
  username: string | null;
  bio: string | null;
  avatarMediaKey: string | null;
  onboardingComplete: boolean;
  updatedAt: number;
}

export async function fetchServerProfile(): Promise<ServerUserProfile | null> {
  if (!isReelyouAuthConfigured()) return null;
  const res = await authenticatedReellyouFetch('/v1/profile/me', { method: 'GET' });
  if (!res?.ok) return null;
  const body = (await res.json()) as { ok?: boolean; profile?: ServerUserProfile };
  return body.profile ?? null;
}

export async function patchServerProfile(patch: {
  fullName?: string;
  username?: string | null;
  bio?: string | null;
  avatarMediaKey?: string | null;
}): Promise<{ ok: boolean; profile?: ServerUserProfile; error?: string }> {
  if (!isReelyouAuthConfigured()) return { ok: false, error: 'auth_not_configured' };
  const res = await authenticatedReellyouFetch('/v1/profile/me', {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
  if (!res?.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    return { ok: false, error: body.error ?? 'server_error' };
  }
  const body = (await res.json()) as { ok?: boolean; profile?: ServerUserProfile };
  if (body.ok !== true || !body.profile) return { ok: false, error: 'server_error' };
  return { ok: true, profile: body.profile };
}

export async function syncOnboardingCompleteToServer(
  complete: boolean,
  snapshot?: OnboardingState,
): Promise<{ ok: boolean; profile?: ServerUserProfile; error?: string }> {
  if (!isReelyouAuthConfigured()) return { ok: false, error: 'auth_not_configured' };
  const res = await authenticatedReellyouFetch('/v1/onboarding/me', {
    method: 'PUT',
    body: JSON.stringify({
      complete,
      snapshot: snapshot ? { ...snapshot } : null,
    }),
  });
  if (!res?.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    return { ok: false, error: body.error ?? 'server_error' };
  }
  const body = (await res.json()) as { ok?: boolean; profile?: ServerUserProfile };
  if (body.ok !== true || !body.profile) return { ok: false, error: 'server_error' };
  return { ok: true, profile: body.profile };
}

export function mergeOnboardingWithServerProfile(
  local: OnboardingState,
  server: ServerUserProfile | null,
): OnboardingState {
  if (!server) return local;
  const bio = server.bio?.trim() ?? '';
  return {
    ...local,
    isOnboardingComplete: server.onboardingComplete === true || local.isOnboardingComplete === true,
    northStar: bio.length > 0 ? { originalVision: bio } : local.northStar,
  };
}
