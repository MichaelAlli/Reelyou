import { parseRemoteAssetIdFromUri } from '@/social/sharedMediaConstants';
import { invalidateMediaAccessCache, resolveMediaAccessUrl } from '@/social/sharedMediaApi';
import type { SkywriteMedia, SkywriteRecord } from '@/skywrite/types';

async function resolvePartUri(
  uri: string | undefined,
  remoteAssetId?: string,
  options?: { forceRefresh?: boolean },
): Promise<{ uri: string | undefined; ok: boolean }> {
  const assetId = remoteAssetId ?? parseRemoteAssetIdFromUri(uri);
  if (!assetId) return { uri, ok: true };
  if (options?.forceRefresh) invalidateMediaAccessCache(assetId);
  const resolved = await resolveMediaAccessUrl(assetId);
  if (!resolved) return { uri, ok: false };
  return { uri: resolved, ok: true };
}

export async function resolveSkywriteMedia(
  media: SkywriteMedia,
  options?: { forceRefresh?: boolean },
): Promise<{ media: SkywriteMedia; allOk: boolean }> {
  let allOk = true;

  const photoResolved = media.photo
    ? await (async () => {
        const result = await resolvePartUri(media.photo!.uri, media.photo!.remoteAssetId, options);
        if (!result.ok) allOk = false;
        return { ...media.photo!, uri: result.uri ?? media.photo!.uri };
      })()
    : null;

  const audioResolved = media.audio
    ? await (async () => {
        const result = await resolvePartUri(media.audio!.uri, media.audio!.remoteAssetId, options);
        if (!result.ok) allOk = false;
        return { ...media.audio!, uri: result.uri ?? media.audio!.uri };
      })()
    : null;

  let video = media.video;
  if (video) {
    const main = await resolvePartUri(video.uri, video.remoteAssetId, options);
    if (!main.ok) allOk = false;
    const thumbAsset = parseRemoteAssetIdFromUri(video.thumbnailUri);
    let thumbnailUri = video.thumbnailUri;
    if (video.thumbnailUri) {
      const thumb = await resolvePartUri(video.thumbnailUri, thumbAsset ?? undefined, options);
      if (!thumb.ok) allOk = false;
      thumbnailUri = thumb.uri ?? video.thumbnailUri;
    }
    video = { ...video, uri: main.uri ?? video.uri, thumbnailUri };
  }

  return {
    media: { ...media, photo: photoResolved, video, audio: audioResolved },
    allOk,
  };
}

export async function resolveSkywriteRecord(
  record: SkywriteRecord,
  options?: { forceRefresh?: boolean },
): Promise<{ record: SkywriteRecord; allOk: boolean }> {
  const { media, allOk } = await resolveSkywriteMedia(record.media, options);
  return { record: { ...record, media }, allOk };
}

export function collectRemoteAssetIds(record: SkywriteRecord): string[] {
  const ids: string[] = [];
  const push = (uri?: string, remoteAssetId?: string) => {
    const id = remoteAssetId ?? parseRemoteAssetIdFromUri(uri);
    if (id) ids.push(id);
  };
  push(record.media.photo?.uri, record.media.photo?.remoteAssetId);
  push(record.media.video?.uri, record.media.video?.remoteAssetId);
  push(record.media.video?.thumbnailUri);
  push(record.media.audio?.uri, record.media.audio?.remoteAssetId);
  return ids;
}

export function invalidateSkywriteRemoteMediaCache(record: SkywriteRecord): void {
  for (const id of collectRemoteAssetIds(record)) {
    invalidateMediaAccessCache(id);
  }
}
