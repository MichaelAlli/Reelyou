import { isSharedSocialPersistenceEnabled } from '@/social/sharedSocialApi';
import { publishSkywriteToServer } from '@/social/sharedSkywriteApi';
import { cacheRemoteSkywrite } from '@/social/sharedSkywriteCache';
import { uploadSkywriteMediaForPublish } from '@/social/uploadSkywriteMedia';
import type { SkywriteRecord } from '@/skywrite/types';

export async function syncPublishedSkywriteToServer(
  record: SkywriteRecord,
): Promise<
  | { ok: true; record: SkywriteRecord }
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

  if (hasLocalMedia) {
    const uploaded = await uploadSkywriteMediaForPublish(record.media);
    if (!uploaded.ok) {
      return { ok: false, error: uploaded.error, record };
    }
    media = uploaded.media;
    serverMediaRefs = uploaded.serverMediaRefs;
  }

  const syncedRecord: SkywriteRecord = { ...record, media };
  const published = await publishSkywriteToServer(syncedRecord, serverMediaRefs);
  if (!published) {
    return { ok: false, error: 'server_publish_failed', record: syncedRecord };
  }

  cacheRemoteSkywrite(syncedRecord);
  return { ok: true, record: syncedRecord };
}
