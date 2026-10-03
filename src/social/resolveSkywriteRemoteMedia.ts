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
  try {
    const resolved = await resolveMediaAccessUrl(assetId);
    if (!resolved) return { uri, ok: false };
    return { uri: resolved, ok: true };
  } catch {
    return { uri, ok: false };
  }
}

export async function resolveSkywriteMedia(
  media: SkywriteMedia,
  options?: { forceRefresh?: boolean },
): Promise<{ media: SkywriteMedia; allOk: boolean }> {
  try {
    let allOk = true;

    const photoTask = media.photo
      ? resolvePartUri(media.photo.uri, media.photo.remoteAssetId, options).then((result) => {
          if (!result.ok) allOk = false;
          return { ...media.photo!, uri: result.uri ?? media.photo!.uri };
        })
      : Promise.resolve(null);

    const audioTask = media.audio
      ? resolvePartUri(media.audio.uri, media.audio.remoteAssetId, options).then((result) => {
          if (!result.ok) allOk = false;
          return { ...media.audio!, uri: result.uri ?? media.audio!.uri };
        })
      : Promise.resolve(null);

    const videoTask = (async () => {
      const video = media.video;
      if (!video) return null;
      const main = await resolvePartUri(video.uri, video.remoteAssetId, options);
      if (!main.ok) allOk = false;
      const thumbAsset = parseRemoteAssetIdFromUri(video.thumbnailUri);
      let thumbnailUri = video.thumbnailUri;
      if (video.thumbnailUri) {
        const thumb = await resolvePartUri(video.thumbnailUri, thumbAsset ?? undefined, options);
        if (!thumb.ok) allOk = false;
        thumbnailUri = thumb.uri ?? video.thumbnailUri;
      }
      return { ...video, uri: main.uri ?? video.uri, thumbnailUri };
    })();

    const [photoResolved, audioResolved, video] = await Promise.all([
      photoTask,
      audioTask,
      videoTask,
    ]);

    return {
      media: { ...media, photo: photoResolved, video, audio: audioResolved },
      allOk,
    };
  } catch {
    return { media, allOk: false };
  }
}

export async function resolveSkywriteRecord(
  record: SkywriteRecord,
  options?: { forceRefresh?: boolean },
): Promise<{ record: SkywriteRecord; allOk: boolean }> {
  try {
    const { media, allOk } = await resolveSkywriteMedia(record.media, options);
    return { record: { ...record, media }, allOk };
  } catch {
    return { record, allOk: false };
  }
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
