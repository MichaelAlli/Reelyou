import type { Privacy, SkywriteVisibility } from '@/types';

export function normalizeSkywriteVisibility(visibility: Privacy): SkywriteVisibility {
  if (visibility === 'orbit') return 'sky_friends';
  return visibility;
}

export function isSkyFriendsVisibility(visibility: Privacy): boolean {
  return normalizeSkywriteVisibility(visibility) === 'sky_friends';
}

export function isPublicSkywriteVisibility(visibility: Privacy): boolean {
  return normalizeSkywriteVisibility(visibility) === 'public';
}

export function privacyValuesEquivalent(a: Privacy, b: Privacy): boolean {
  return normalizeSkywriteVisibility(a) === normalizeSkywriteVisibility(b);
}

/** Map stored value to composer option id (sky_friends). */
export function resolveVisibilityOptionId(visibility: Privacy): SkywriteVisibility {
  return normalizeSkywriteVisibility(visibility);
}
