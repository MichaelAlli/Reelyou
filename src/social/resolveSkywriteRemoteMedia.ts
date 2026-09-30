import { parseRemoteAssetIdFromUri } from '@/social/sharedMediaConstants';
import { resolveMediaAccessUrl } from '@/social/sharedMediaApi';
import type { SkywriteMedia, SkywriteRecord } from '@/skywrite/types';

async function resolvePartUri(uri: string | undefined, remoteAssetId?: string): Promise<string | undefined> {
  const assetId = remoteAssetId ?? parseRemoteAssetIdFromUri(uri);
  if (!assetId) return uri;
  const resolved = await resolveMediaAccessUrl(assetId);
  return resolved ?? uri;
}

export async function resolveSkywriteMedia(media: SkywriteMedia): Promise<SkywriteMedia> {
  const photo = media.photo
    ? {
        ...media.photo,
        uri: (await resolvePartUri(media.photo.uri, media.photo.remoteAssetId)) ?? media.photo.uri,
      }
    : null;
  const audio = media.audio
    ? {
        ...media.audio,
        uri: (await resolvePartUri(media.audio.uri, media.audio.remoteAssetId)) ?? media.audio.uri,
      }
    : null;
  let video = media.video;
  if (video) {
    const uri = (await resolvePartUri(video.uri, video.remoteAssetId)) ?? video.uri;
    const thumbAsset = parseRemoteAssetIdFromUri(video.thumbnailUri);
    const thumbnailUri = video.thumbnailUri
      ? (await resolvePartUri(video.thumbnailUri, thumbAsset ?? undefined)) ?? video.thumbnailUri
      : undefined;
    video = { ...video, uri, thumbnailUri };
  }
  return { ...media, photo, video, audio };
}

export async function resolveSkywriteRecord(record: SkywriteRecord): Promise<SkywriteRecord> {
  return { ...record, media: await resolveSkywriteMedia(record.media) };
}
