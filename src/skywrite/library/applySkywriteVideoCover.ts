import { isSharedSocialPersistenceEnabled } from '@/social/sharedSocialApi';
import { buildRemoteAssetPlaceholderUri } from '@/social/sharedMediaConstants';
import { cacheRemoteSkywrite } from '@/social/sharedSkywriteCache';
import { mapServerSkywriteToRecord } from '@/social/sharedSkywriteApi';
import { resolveMediaAccessUrl } from '@/social/sharedMediaApi';
import { uploadSkywriteMediaForPublish } from '@/social/uploadSkywriteMedia';
import { authenticatedReellyouFetch } from '@/backend/authenticatedReellyouFetch';
import { captureSkywriteVideoPosterAtMs } from '@/skywrite/publish/captureSkywriteVideoPoster';
import { syncSkywriteLocalRecord } from '@/skywrite/library/skywriteLocalRecordSync';
import type { SkywriteRecord } from '@/skywrite/types';

async function patchThumbnailAssetOnServer(
  skywriteId: string,
  thumbnailAssetId: string,
): Promise<SkywriteRecord | null> {
  if (!isSharedSocialPersistenceEnabled()) return null;
  const res = await authenticatedReellyouFetch(
    `/v1/content/skywrites/${encodeURIComponent(skywriteId)}/media/thumbnail`,
    {
      method: 'POST',
      body: JSON.stringify({ thumbnailAssetId }),
    },
  );
  if (!res || !res.ok) return null;
  const body = (await res.json()) as { skywrite?: unknown };
  if (!body.skywrite) return null;
  return mapServerSkywriteToRecord(body.skywrite as Parameters<typeof mapServerSkywriteToRecord>[0]);
}

/** Persist user-selected cover on `media.video.thumbnailUri` (server: thumbnailAssetId). */
export async function applySkywriteVideoCover(
  record: SkywriteRecord,
  seekMs: number,
): Promise<SkywriteRecord | null> {
  const video = record.media.video;
  if (!video?.uri && !video?.remoteAssetId) return null;

  let playableUri = video.uri;
  if (video.remoteAssetId) {
    const resolved = await resolveMediaAccessUrl(video.remoteAssetId);
    if (resolved) playableUri = resolved;
  }
  if (!playableUri) return null;

  const posterUri = await captureSkywriteVideoPosterAtMs(playableUri, seekMs);
  if (!posterUri) return null;

  const withPoster = { ...video, thumbnailUri: posterUri };

  if (isSharedSocialPersistenceEnabled()) {
    const uploaded = await uploadSkywriteMediaForPublish({
      ...record.media,
      video: withPoster,
    });
    if (!uploaded.ok || !uploaded.serverMediaRefs.thumbnailAssetId) return null;

    const patched = await patchThumbnailAssetOnServer(
      record.id,
      uploaded.serverMediaRefs.thumbnailAssetId,
    );
    if (patched) {
      cacheRemoteSkywrite(patched);
      syncSkywriteLocalRecord(patched);
      return patched;
    }

    const fallback: SkywriteRecord = {
      ...record,
      media: {
        ...record.media,
        video: {
          ...withPoster,
          thumbnailUri: buildRemoteAssetPlaceholderUri(uploaded.serverMediaRefs.thumbnailAssetId!),
        },
      },
    };
    cacheRemoteSkywrite(fallback);
    syncSkywriteLocalRecord(fallback);
    return fallback;
  }

  const local: SkywriteRecord = {
    ...record,
    media: { ...record.media, video: withPoster },
  };
  syncSkywriteLocalRecord(local);
  return local;
}
