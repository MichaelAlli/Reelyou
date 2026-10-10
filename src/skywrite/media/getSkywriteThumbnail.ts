import {
  isEphemeralMediaUri,
  parseRemoteAssetIdFromUri,
} from '@/social/sharedMediaConstants';
import { skywriteAudioNeedsRemoteResolve } from '@/skywrite/media/getSkywriteAudioSource';
import { pickSkywriteMediaSource } from '@/skywrite/media/skywriteMediaPreviewUtils';
import type { SkywriteRecord } from '@/skywrite/types';

/** Canonical persisted video still — `media.video.thumbnailUri` (server: `thumbnailAssetId`). */
export function getSkywriteThumbnail(
  record: Pick<SkywriteRecord, 'media' | 'mediaMode' | 'text'>,
): string | null {
  const source = pickSkywriteMediaSource(record);
  if (source.kind === 'photo' || source.kind === 'photo_audio') {
    return source.photoUri;
  }
  if (source.kind === 'video' || source.kind === 'video_audio') {
    return source.videoThumbnailUri;
  }
  return null;
}

export function skywriteHasVideoMedia(record: Pick<SkywriteRecord, 'media' | 'mediaMode'>): boolean {
  const kind = pickSkywriteMediaSource({ ...record, text: '' }).kind;
  return kind === 'video' || kind === 'video_audio';
}

/** Durable server-backed thumbnail asset (survives refresh). */
export function hasPersistedVideoThumbnailAsset(record: SkywriteRecord): boolean {
  const thumb = record.media.video?.thumbnailUri;
  return Boolean(thumb && parseRemoteAssetIdFromUri(thumb));
}

/** Grid / repair pipeline — resolve signed URLs and/or generate + upload poster. */
export function recordNeedsLibraryThumbnailPipeline(
  record: SkywriteRecord | null | undefined,
): boolean {
  if (!record) return false;
  const video = record.media.video;
  if (video?.uri || video?.remoteAssetId) {
    const thumb = video.thumbnailUri;
    if (!thumb) return true;
    if (parseRemoteAssetIdFromUri(thumb)) return true;
    if (video.remoteAssetId && !parseRemoteAssetIdFromUri(thumb)) return true;
    if (isEphemeralMediaUri(thumb)) return true;
  }
  if (parseRemoteAssetIdFromUri(record.media.photo?.uri)) return true;
  if (skywriteAudioNeedsRemoteResolve(record)) return true;
  return false;
}
