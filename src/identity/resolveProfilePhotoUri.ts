import type { UserAvatarIdentity } from '@/identity/userAvatarTypes';

/** Raw persisted profile photo URI when the user chose a real photo. */
export function resolveProfilePhotoUri(identity: UserAvatarIdentity): string | null {
  if (identity.avatarSourceType === 'profilePhoto' && identity.profilePhotoUri) {
    return identity.profilePhotoUri;
  }
  if (identity.profilePhotoUri) return identity.profilePhotoUri;
  return null;
}

export function withProfilePhotoCacheRevision(uri: string, revision: number): string {
  if (!revision) return uri;
  // Query params break data: and blob: URIs — rely on revision in React keys instead.
  if (uri.startsWith('data:') || uri.startsWith('blob:')) return uri;
  const separator = uri.includes('?') ? '&' : '?';
  return `${uri}${separator}avatarRev=${revision}`;
}
