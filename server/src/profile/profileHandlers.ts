import {
  getUserOnboardingSnapshot,
  getUserProfile,
  setUserOnboardingComplete,
  updateUserProfile,
} from './userProfileRepository.js';

export function handleGetProfile(userId: string) {
  const profile = getUserProfile(userId);
  if (!profile) return { ok: false as const, error: 'not_found' as const };
  return { ok: true as const, profile };
}

export function handlePatchProfile(
  userId: string,
  body: {
    fullName?: string;
    username?: string | null;
    bio?: string | null;
    avatarMediaKey?: string | null;
  },
) {
  const profile = updateUserProfile(userId, body);
  if (!profile) return { ok: false as const, error: 'not_found' as const };
  return { ok: true as const, profile };
}

export function handlePutOnboarding(
  userId: string,
  body: { complete?: boolean; snapshot?: Record<string, unknown> | null },
) {
  const complete = body.complete === true;
  const profile = setUserOnboardingComplete(userId, complete, body.snapshot ?? null);
  if (!profile) return { ok: false as const, error: 'not_found' as const };
  return { ok: true as const, profile };
}

export function handleGetOnboarding(userId: string) {
  const data = getUserOnboardingSnapshot(userId);
  if (!data) return { ok: false as const, error: 'not_found' as const };
  return { ok: true as const, complete: data.complete, snapshot: data.snapshot };
}
