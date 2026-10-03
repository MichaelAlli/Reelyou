import { FetchTimeoutError } from '@/backend/fetchWithTimeout';
import { reconcilePublishedSkywriteById } from '@/social/reconcilePublishedSkywrite';
import { isSharedSocialPersistenceEnabled } from '@/social/sharedSocialApi';
import { publishSkywriteToServer } from '@/social/sharedSkywriteApi';
import { cacheRemoteSkywrite } from '@/social/sharedSkywriteCache';
import { uploadSkywriteMediaForPublish } from '@/social/uploadSkywriteMedia';
import type {
  PublishSkywriteProgress,
  PublishStageTimingMs,
} from '@/skywrite/publish/publishSkywriteDraft';
import type { SkywriteRecord } from '@/skywrite/types';

export type PublishServerPhase = PublishSkywriteProgress['phase'];

export async function syncPublishedSkywriteToServer(
  record: SkywriteRecord,
  onProgress?: (progress: PublishSkywriteProgress) => void,
): Promise<
  | {
      ok: true;
      record: SkywriteRecord;
      timingMs: { uploadMs: number; serverMs: number; stages: PublishStageTimingMs };
    }
  | { ok: false; error: string; record?: SkywriteRecord }
> {
  if (!isSharedSocialPersistenceEnabled()) {
    return {
      ok: true,
      record,
      timingMs: { uploadMs: 0, serverMs: 0, stages: {} },
    };
  }

  const stages: PublishStageTimingMs = {};
  const started = Date.now();
  const tick = (phase: PublishServerPhase) =>
    onProgress?.({ phase, elapsedMs: Date.now() - started });

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

  let uploadMs = 0;
  if (hasLocalMedia) {
    tick('uploading_media');
    const uploadStarted = Date.now();
    const uploaded = await uploadSkywriteMediaForPublish(record.media, {
      onStage: (stage, ms) => {
        if (stage === 'sessions') stages.uploadSessionMs = (stages.uploadSessionMs ?? 0) + ms;
        if (stage === 'transfer') stages.uploadTransferMs = (stages.uploadTransferMs ?? 0) + ms;
        if (stage === 'finalize_asset') {
          stages.finalizeAssetsMs = (stages.finalizeAssetsMs ?? 0) + ms;
        }
      },
    });
    uploadMs = Date.now() - uploadStarted;
    if (!uploaded.ok) {
      return { ok: false, error: uploaded.error, record };
    }
    media = uploaded.media;
    serverMediaRefs = uploaded.serverMediaRefs;
  }

  tick('finalizing');
  const syncedRecord: SkywriteRecord = { ...record, media };
  const serverStarted = Date.now();
  let published: { id: string; record: SkywriteRecord } | null = null;
  try {
    published = await publishSkywriteToServer(syncedRecord, serverMediaRefs);
  } catch (err) {
    if (err instanceof FetchTimeoutError) {
      const reconciled = await reconcilePublishedSkywriteById(syncedRecord.id);
      if (reconciled) {
        cacheRemoteSkywrite(reconciled);
        tick('posting');
        stages.createPostMs = Date.now() - serverStarted;
        return {
          ok: true,
          record: reconciled,
          timingMs: { uploadMs, serverMs: stages.createPostMs, stages },
        };
      }
      return { ok: false, error: 'server_publish_timeout', record: syncedRecord };
    }
    return { ok: false, error: 'server_publish_failed', record: syncedRecord };
  }
  stages.createPostMs = Date.now() - serverStarted;
  const serverMs = stages.createPostMs;

  if (!published) {
    const reconciled = await reconcilePublishedSkywriteById(syncedRecord.id);
    if (reconciled) {
      cacheRemoteSkywrite(reconciled);
      tick('posting');
      return {
        ok: true,
        record: reconciled,
        timingMs: { uploadMs, serverMs, stages },
      };
    }
    return { ok: false, error: 'server_publish_failed', record: syncedRecord };
  }

  const authoritative = published.record;
  cacheRemoteSkywrite(authoritative);
  tick('posting');
  return { ok: true, record: authoritative, timingMs: { uploadMs, serverMs, stages } };
}
