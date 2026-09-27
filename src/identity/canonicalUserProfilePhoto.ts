import {
  resolveProfilePhotoUri,
  withProfilePhotoCacheRevision,
} from '@/identity/resolveProfilePhotoUri';
import type { UserAvatarIdentity } from '@/identity/userAvatarTypes';

/** Non-React read path for profile builders (owner/visitor/sky identity). */
let snapshot: {
  displayUri: string | null;
  rawUri: string | null;
  revision: number;
} = {
  displayUri: null,
  rawUri: null,
  revision: 0,
};

export function syncCanonicalProfilePhotoFromIdentity(
  identity: UserAvatarIdentity,
  revision: number,
): void {
  const rawUri = resolveProfilePhotoUri(identity);
  snapshot = {
    rawUri,
    displayUri: rawUri ? withProfilePhotoCacheRevision(rawUri, revision) : null,
    revision,
  };
}

export function getCanonicalProfilePhotoDisplayUri(): string | null {
  return snapshot.displayUri;
}

export function getCanonicalProfilePhotoRevision(): number {
  return snapshot.revision;
}

/** Test-only reset */
export function resetCanonicalProfilePhotoSnapshotForTests(): void {
  snapshot = { displayUri: null, rawUri: null, revision: 0 };
}
