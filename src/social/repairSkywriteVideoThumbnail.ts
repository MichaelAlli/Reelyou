import { authenticatedReellyouFetch } from '@/backend/authenticatedReellyouFetch';
import { isSharedSocialPersistenceEnabled } from '@/social/sharedSocialApi';
import { buildRemoteAssetPlaceholderUri, isEphemeralMediaUri } from '@/social/sharedMediaConstants';
import { cacheRemoteSkywrite } from '@/social/sharedSkywriteCache';
import { mapServerSkywriteToRecord } from '@/social/sharedSkywriteApi';
import { resolveMediaAccessUrl } from '@/social/sharedMediaApi';
import { uploadSkywriteMediaForPublish } from '@/social/uploadSkywriteMedia';
import { captureSkywriteVideoPosterUri } from '@/skywrite/publish/captureSkywriteVideoPoster';
import type { SkywriteRecord } from '@/skywrite/types';

const repairInFlight = new Set<string>();

export function skywriteNeedsPersistedVideoThumbnail(record: SkywriteRecord): boolean {
  const video = record.media.video;
  if (!video?.uri && !video?.remoteAssetId) return false;
  const thumb = video.thumbnailUri;
  if (!thumb) return true;
  if (isEphemeralMediaUri(thumb)) return true;
  return false;
}

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

/** Upload poster + attach durable thumbnail asset for an existing published video post. */
export async function repairSkywriteVideoThumbnailIfNeeded(
  record: SkywriteRecord,
): Promise<SkywriteRecord | null> {
  if (!skywriteNeedsPersistedVideoThumbnail(record)) return null;
  if (repairInFlight.has(record.id)) return null;
  repairInFlight.add(record.id);
  try {
    let video = record.media.video;
    if (!video) return null;

    let playableUri = video.uri;
    if (video.remoteAssetId) {
      const resolved = await resolveMediaAccessUrl(video.remoteAssetId);
      if (resolved) playableUri = resolved;
    }

    const posterUri = await captureSkywriteVideoPosterUri(playableUri);
    if (!posterUri) return null;

    const withPoster = { ...video, thumbnailUri: posterUri };
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
      return patched;
    }

    return {
      ...record,
      media: {
        ...record.media,
        video: {
          ...withPoster,
          thumbnailUri: buildRemoteAssetPlaceholderUri(uploaded.serverMediaRefs.thumbnailAssetId!),
        },
      },
    };
  } finally {
    repairInFlight.delete(record.id);
  }
}
