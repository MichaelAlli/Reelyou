import {
  pickSkywritePhotoFromLibrary,
  takeSkywritePhoto,
  type PhotoPickResult,
} from '@/skywrite/mediaActions';

export const PROFILE_PHOTO_MAX_BYTES = 12 * 1024 * 1024;

export type ProfilePhotoPickFailureReason =
  | 'cancelled'
  | 'denied'
  | 'unavailable'
  | 'too_large'
  | 'invalid_type';

export type ProfilePhotoPickResult =
  | { ok: true; uri: string; width?: number; height?: number }
  | { ok: false; reason: ProfilePhotoPickFailureReason; message?: string };

const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
]);

function mapPhotoResult(result: PhotoPickResult): ProfilePhotoPickResult {
  if (!result.ok) {
    return result;
  }
  return {
    ok: true,
    uri: result.photo.uri,
    width: result.photo.width,
    height: result.photo.height,
  };
}

function validateWebFile(file: File): ProfilePhotoPickResult | null {
  if (!ALLOWED_IMAGE_TYPES.has(file.type) && !file.type.startsWith('image/')) {
    return {
      ok: false,
      reason: 'invalid_type',
      message: 'Please choose a JPEG, PNG, or WebP image.',
    };
  }
  if (file.size > PROFILE_PHOTO_MAX_BYTES) {
    return {
      ok: false,
      reason: 'too_large',
      message: 'That image is too large. Try a smaller photo.',
    };
  }
  return null;
}

/** Re-read web blob size when pick returns object URL (file size not in PhotoPickResult). */
export async function pickProfilePhotoFromLibrary(): Promise<ProfilePhotoPickResult> {
  const result = await pickSkywritePhotoFromLibrary();
  const mapped = mapPhotoResult(result);
  if (!mapped.ok || typeof fetch === 'undefined') {
    return mapped;
  }
  try {
    const response = await fetch(mapped.uri);
    const blob = await response.blob();
    if (blob.size > PROFILE_PHOTO_MAX_BYTES) {
      return {
        ok: false,
        reason: 'too_large',
        message: 'That image is too large. Try a smaller photo.',
      };
    }
    if (blob.type && !blob.type.startsWith('image/')) {
      return {
        ok: false,
        reason: 'invalid_type',
        message: 'Please choose a JPEG, PNG, or WebP image.',
      };
    }
  } catch {
    // Keep URI — native/web may not support blob fetch for all schemes.
  }
  return mapped;
}

export async function takeProfilePhoto(): Promise<ProfilePhotoPickResult> {
  return mapPhotoResult(await takeSkywritePhoto());
}

export { validateWebFile };
