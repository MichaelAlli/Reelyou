import {
  completeMediaUploadSession,
  createMediaUploadSession,
  putUploadWithRetry,
} from '@/social/sharedMediaApi';
import type { MediaAssetKind } from '@/social/sharedMediaTypes';
import {
  buildRemoteAssetPlaceholderUri,
  isEphemeralMediaUri,
  parseRemoteAssetIdFromUri,
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

type UploadStage = 'sessions' | 'transfer' | 'finalize_asset';

async function uploadLocalUri(
  uri: string,
  kind: MediaAssetKind,
  onStage?: (stage: UploadStage, ms: number) => void,
): Promise<
  | { ok: true; assetId: string; placeholderUri: string }
  | { ok: false; error: string }
> {
  const payload = await blobFromUri(uri);
  if (!payload) return { ok: false, error: 'blob_read_failed' };
  const sessionStarted = Date.now();
  const sessionResult = await createMediaUploadSession({
    kind,
    contentType: payload.contentType,
    sizeBytes: payload.blob.size,
  });
  onStage?.('sessions', Date.now() - sessionStarted);
  if (!sessionResult.ok) return { ok: false, error: sessionResult.error };
  const session = sessionResult.session;
  const transferStarted = Date.now();
  const uploaded = await putUploadWithRetry(
    session.uploadUrl,
    payload.blob,
    session.uploadHeaders,
  );
  onStage?.('transfer', Date.now() - transferStarted);
  if (!uploaded.ok) return { ok: false, error: 'photo_upload_failed' };
  const finalizeStarted = Date.now();
  const complete = await completeMediaUploadSession(session.assetId);
  onStage?.('finalize_asset', Date.now() - finalizeStarted);
  if (!complete.ok) {
    return {
      ok: false,
      error: complete.error === 'not_signed_in' ? 'not_signed_in' : 'photo_upload_failed',
    };
  }
  return {
    ok: true,
    assetId: session.assetId,
    placeholderUri: buildRemoteAssetPlaceholderUri(session.assetId),
  };
}

type UploadSlot =
  | { slot: 'photo'; uri: string }
  | { slot: 'video'; uri: string }
  | { slot: 'audio'; uri: string }
  | { slot: 'thumbnail'; uri: string };

export async function uploadSkywriteMediaForPublish(
  media: SkywriteMedia,
  options?: {
    onStage?: (stage: UploadStage, ms: number) => void;
  },
): Promise<
  | { ok: true; media: SkywriteMedia; serverMediaRefs: ServerSkywriteMediaRefs }
  | { ok: false; error: string }
> {
  const onStage = options?.onStage;
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

  if (next.photo?.remoteAssetId) {
    serverRefs.photoAssetId = next.photo.remoteAssetId;
  }
  if (next.video?.remoteAssetId) {
    serverRefs.videoAssetId = next.video.remoteAssetId;
  }
  if (next.video?.thumbnailUri && parseRemoteAssetIdFromUri(next.video.thumbnailUri)) {
    serverRefs.thumbnailAssetId = parseRemoteAssetIdFromUri(next.video.thumbnailUri)!;
  }
  if (next.audio?.remoteAssetId) {
    serverRefs.audioAssetId = next.audio.remoteAssetId;
  }

  const pending: UploadSlot[] = [];
  if (next.photo?.uri && !next.photo.remoteAssetId && isEphemeralMediaUri(next.photo.uri)) {
    pending.push({ slot: 'photo', uri: next.photo.uri });
  }
  if (next.video?.uri && !next.video.remoteAssetId && isEphemeralMediaUri(next.video.uri)) {
    pending.push({ slot: 'video', uri: next.video.uri });
  }
  if (next.audio?.uri && !next.audio.remoteAssetId && isEphemeralMediaUri(next.audio.uri)) {
    pending.push({ slot: 'audio', uri: next.audio.uri });
  }
  if (next.video?.thumbnailUri && isEphemeralMediaUri(next.video.thumbnailUri)) {
    pending.push({ slot: 'thumbnail', uri: next.video.thumbnailUri });
  }

  if (pending.length > 0) {
    const results = await Promise.all(
      pending.map(async (item) => {
        const kind: MediaAssetKind =
          item.slot === 'photo'
            ? 'photo'
            : item.slot === 'video'
              ? 'video'
              : item.slot === 'audio'
                ? 'audio'
                : 'thumbnail';
        const up = await uploadLocalUri(item.uri, kind, onStage);
        return { slot: item.slot, up };
      }),
    );

    for (const { slot, up } of results) {
      if (!up.ok) {
        const error =
          slot === 'video' && up.error === 'photo_upload_failed'
            ? 'video_upload_failed'
            : slot === 'audio' && up.error === 'photo_upload_failed'
              ? 'audio_upload_failed'
              : up.error;
        return { ok: false, error };
      }
      if (slot === 'photo' && next.photo) {
        next.photo = { ...next.photo, uri: up.placeholderUri, remoteAssetId: up.assetId };
        serverRefs.photoAssetId = up.assetId;
      } else if (slot === 'video' && next.video) {
        next.video = { ...next.video, uri: up.placeholderUri, remoteAssetId: up.assetId };
        serverRefs.videoAssetId = up.assetId;
      } else if (slot === 'audio' && next.audio) {
        next.audio = { ...next.audio, uri: up.placeholderUri, remoteAssetId: up.assetId };
        serverRefs.audioAssetId = up.assetId;
      } else if (slot === 'thumbnail' && next.video) {
        next.video = {
          ...next.video,
          thumbnailUri: up.placeholderUri,
        };
        serverRefs.thumbnailAssetId = up.assetId;
      }
    }
  }

  return { ok: true, media: next, serverMediaRefs: serverRefs };
}
