import { isSharedSocialPersistenceEnabled } from '@/social/sharedSocialApi';
import { publishSkywriteToServer } from '@/social/sharedSkywriteApi';
import { cacheRemoteSkywrite } from '@/social/sharedSkywriteCache';
import { uploadSkywriteMediaForPublish } from '@/social/uploadSkywriteMedia';
import type { PublishSkywriteProgress } from '@/skywrite/publish/publishSkywriteDraft';
import type { SkywriteRecord } from '@/skywrite/types';

export type PublishServerPhase = PublishSkywriteProgress['phase'] | 'uploading_media' | 'finalizing';

export async function syncPublishedSkywriteToServer(
  record: SkywriteRecord,
  onProgress?: (progress: PublishSkywriteProgress & { phase: PublishServerPhase }) => void,
): Promise<
  | { ok: true; record: SkywriteRecord; timingMs: { uploadMs: number; serverMs: number } }
  | { ok: false; error: string; record?: SkywriteRecord }
> {
  if (!isSharedSocialPersistenceEnabled()) {
    return { ok: true, record };
  }

  const hasLocalMedia =
    Boolean(record.media.photo?.uri) ||
    Boolean(record.media.video?.uri) ||
    Boolean(record.media.audio?.uri);

  let media = record.media;
  let serverMediaRefs: import('@/social/sharedSkywriteApi').ServerSkywriteMediaRefs = {
    photoAssetId: record.media.photo?.remoteAssetId ?? null,
    videoAssetId: record.media.video?.remoteAssetId ?? null,
    audioAssetId: record.media.audio?.remoteAssetId ?? null,
    thumbnailAssetId: null,
    videoMeta: record.media.video
      ? {
          width: record.media.video.width,
          height: record.media.video.height,
          durationMs: record.media.video.durationMs,
          stageFit: record.media.video.stageFit,
          framingOffsetX: record.media.video.framingOffsetX,
          framingOffsetY: record.media.video.framingOffsetY,
        }
      : null,
    originalVideoAudio: record.media.originalVideoAudio,
    originalVideoVolume: record.media.originalVideoVolume,
    voiceoverVolume: record.media.voiceoverVolume,
  };

  const started = Date.now();
  const tick = (phase: PublishServerPhase) =>
    onProgress?.({ phase, elapsedMs: Date.now() - started });

  let uploadMs = 0;
  if (hasLocalMedia) {
    tick('uploading_media');
    const uploadStarted = Date.now();
    const uploaded = await uploadSkywriteMediaForPublish(record.media);
    if (!uploaded.ok) {
      return { ok: false, error: uploaded.error, record };
    }
    media = uploaded.media;
    serverMediaRefs = uploaded.serverMediaRefs;
    uploadMs = Date.now() - uploadStarted;
  }

  tick('finalizing');
  const syncedRecord: SkywriteRecord = { ...record, media };
  const serverStarted = Date.now();
  const published = await publishSkywriteToServer(syncedRecord, serverMediaRefs);
  const serverMs = Date.now() - serverStarted;
  if (!published) {
    return { ok: false, error: 'server_publish_failed', record: syncedRecord };
  }

  const authoritative = published.record;
  cacheRemoteSkywrite(authoritative);
  tick('saving');
  return { ok: true, record: authoritative, timingMs: { uploadMs, serverMs } };
}
