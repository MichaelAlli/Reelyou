import { uploadLocalUri } from '@/social/uploadSkywriteMedia';
import { patchServerProfile } from '@/profile/serverProfileApi';
import { buildRemoteAssetPlaceholderUri } from '@/social/sharedMediaConstants';
import { resolveMediaAccessUrl } from '@/social/sharedMediaApi';
import { isReelyouAuthConfigured } from '@/auth/reellyouAuthConfig';

export async function uploadProfilePhotoToServer(
  localUri: string,
): Promise<
  | { ok: true; assetId: string; displayUri: string }
  | { ok: false; error: string }
> {
  if (!isReelyouAuthConfigured()) {
    return { ok: false, error: 'auth_not_configured' };
  }
  const uploaded = await uploadLocalUri(localUri, 'photo');
  if (!uploaded.ok) return uploaded;
  const patched = await patchServerProfile({ avatarMediaKey: uploaded.assetId });
  if (!patched.ok) {
    return { ok: false, error: patched.error ?? 'profile_patch_failed' };
  }
  const access = await resolveMediaAccessUrl(uploaded.assetId);
  return {
    ok: true,
    assetId: uploaded.assetId,
    displayUri: access ?? uploaded.placeholderUri,
  };
}

export async function clearProfilePhotoOnServer(): Promise<{ ok: boolean; error?: string }> {
  if (!isReelyouAuthConfigured()) return { ok: false, error: 'auth_not_configured' };
  return patchServerProfile({ avatarMediaKey: null });
}

export function profilePhotoUriFromAssetId(assetId: string): string {
  return buildRemoteAssetPlaceholderUri(assetId);
}

export async function resolveServerProfilePhotoDisplayUri(
  assetId: string | null | undefined,
): Promise<string | null> {
  if (!assetId?.trim()) return null;
  if (!isReelyouAuthConfigured()) return profilePhotoUriFromAssetId(assetId);
  const url = await resolveMediaAccessUrl(assetId);
  return url ?? profilePhotoUriFromAssetId(assetId);
}
