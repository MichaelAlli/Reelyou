import type { MediaAssetKind } from './mediaTypes.js';

const PHOTO_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
]);
const VIDEO_TYPES = new Set(['video/mp4', 'video/quicktime', 'video/webm']);
const AUDIO_TYPES = new Set([
  'audio/mpeg',
  'audio/mp4',
  'audio/aac',
  'audio/wav',
  'audio/x-m4a',
  'audio/webm',
]);
const THUMB_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export const MEDIA_MAX_BYTES: Record<MediaAssetKind, number> = {
  photo: 12 * 1024 * 1024,
  video: 200 * 1024 * 1024,
  audio: 25 * 1024 * 1024,
  thumbnail: 2 * 1024 * 1024,
};

export function normalizeContentType(raw: string): string {
  return raw.split(';')[0]?.trim().toLowerCase() ?? '';
}

export function isAllowedMediaType(kind: MediaAssetKind, contentType: string): boolean {
  const ct = normalizeContentType(contentType);
  switch (kind) {
    case 'photo':
      return PHOTO_TYPES.has(ct);
    case 'video':
      return VIDEO_TYPES.has(ct);
    case 'audio':
      return AUDIO_TYPES.has(ct);
    case 'thumbnail':
      return THUMB_TYPES.has(ct);
    default:
      return false;
  }
}

export function validateUploadRequest(
  kind: MediaAssetKind,
  contentType: string,
  sizeBytes: number,
): { ok: true } | { ok: false; error: string } {
  if (!Number.isFinite(sizeBytes) || sizeBytes <= 0) {
    return { ok: false, error: 'invalid_size' };
  }
  const max = MEDIA_MAX_BYTES[kind];
  if (sizeBytes > max) return { ok: false, error: 'too_large' };
  if (!isAllowedMediaType(kind, contentType)) return { ok: false, error: 'invalid_type' };
  return { ok: true };
}
