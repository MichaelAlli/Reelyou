import {
  completeMediaUploadSession,
  createMediaUploadSession,
  putUploadWithRetry,
} from '@/social/sharedMediaApi';
import type { MediaAssetKind } from '@/social/sharedMediaTypes';
import {
  buildRemoteAssetPlaceholderUri,
  isEphemeralMediaUri,
} from '@/social/sharedMediaConstants';
import type { ServerSkywriteMediaRefs } from '@/social/sharedSkywriteApi';
import type { SkywriteMedia } from '@/skywrite/types';

async function blobFromUri(uri: string): Promise<{ blob: Blob; contentType: string } | null> {
  try {
    const res = await fetch(uri);
    if (!res.ok) return null;
    const blob = await res.blob();
    const contentType = blob.type || res.headers.get('content-type') || 'application/octet-stream';
    return { blob, contentType };
  } catch {
    return null;
  }
}

async function uploadLocalUri(
  uri: string,
  kind: MediaAssetKind,
): Promise<{ assetId: string; placeholderUri: string } | null> {
  const payload = await blobFromUri(uri);
  if (!payload) return null;
  const session = await createMediaUploadSession({
    kind,
    contentType: payload.contentType,
    sizeBytes: payload.blob.size,
  });
  if (!session) return null;
  const uploaded = await putUploadWithRetry(
    session.uploadUrl,
    payload.blob,
    session.uploadHeaders,
  );
  if (!uploaded) return null;
  const complete = await completeMediaUploadSession(session.assetId);
  if (!complete) return null;
  return {
    assetId: session.assetId,
    placeholderUri: buildRemoteAssetPlaceholderUri(session.assetId),
  };
}

export async function uploadSkywriteMediaForPublish(
  media: SkywriteMedia,
): Promise<
  | { ok: true; media: SkywriteMedia; serverMediaRefs: ServerSkywriteMediaRefs }
  | { ok: false; error: string }
> {
  const next: SkywriteMedia = {
    ...media,
    photo: media.photo ? { ...media.photo } : null,
    video: media.video ? { ...media.video } : null,
    audio: media.audio ? { ...media.audio } : null,
  };

  const serverRefs: ServerSkywriteMediaRefs = {
    videoMeta: next.video
      ? {
          width: next.video.width,
          height: next.video.height,
          durationMs: next.video.durationMs,
          stageFit: next.video.stageFit,
          framingOffsetX: next.video.framingOffsetX,
          framingOffsetY: next.video.framingOffsetY,
        }
      : null,
    originalVideoAudio: next.originalVideoAudio,
    originalVideoVolume: next.originalVideoVolume,
    voiceoverVolume: next.voiceoverVolume,
  };

  if (next.photo?.uri && !next.photo.remoteAssetId && isEphemeralMediaUri(next.photo.uri)) {
    const up = await uploadLocalUri(next.photo.uri, 'photo');
    if (!up) return { ok: false, error: 'photo_upload_failed' };
    next.photo = { ...next.photo, uri: up.placeholderUri, remoteAssetId: up.assetId };
    serverRefs.photoAssetId = up.assetId;
  } else if (next.photo?.remoteAssetId) {
    serverRefs.photoAssetId = next.photo.remoteAssetId;
  }

  if (next.video?.uri && !next.video.remoteAssetId && isEphemeralMediaUri(next.video.uri)) {
    const up = await uploadLocalUri(next.video.uri, 'video');
    if (!up) return { ok: false, error: 'video_upload_failed' };
    next.video = { ...next.video, uri: up.placeholderUri, remoteAssetId: up.assetId };
    serverRefs.videoAssetId = up.assetId;
  } else if (next.video?.remoteAssetId) {
    serverRefs.videoAssetId = next.video.remoteAssetId;
  }

  if (
    next.video?.thumbnailUri &&
    isEphemeralMediaUri(next.video.thumbnailUri)
  ) {
    const thumb = await uploadLocalUri(next.video.thumbnailUri, 'thumbnail');
    if (thumb) {
      next.video = {
        ...next.video,
        thumbnailUri: thumb.placeholderUri,
      };
      serverRefs.thumbnailAssetId = thumb.assetId;
    }
  }

  if (next.audio?.uri && !next.audio.remoteAssetId && isEphemeralMediaUri(next.audio.uri)) {
    const up = await uploadLocalUri(next.audio.uri, 'audio');
    if (!up) return { ok: false, error: 'audio_upload_failed' };
    next.audio = { ...next.audio, uri: up.placeholderUri, remoteAssetId: up.assetId };
    serverRefs.audioAssetId = up.assetId;
  } else if (next.audio?.remoteAssetId) {
    serverRefs.audioAssetId = next.audio.remoteAssetId;
  }

  return { ok: true, media: next, serverMediaRefs: serverRefs };
}
