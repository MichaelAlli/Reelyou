import { mergeServerRetentionOntoRecord } from '@/skywrite/library/skywriteLibraryRetention';
import { mergeSkywriteAudioMedia } from '@/skywrite/media/getSkywriteAudioSource';
import {
  isEphemeralMediaUri,
  parseRemoteAssetIdFromUri,
} from '@/social/sharedMediaConstants';
import { filterVisibleBetaSkywrites } from '@/skywrite/standaloneAudioSkywrite';
import type {
  SkywriteMedia,
  SkywritePhotoMedia,
  SkywriteRecord,
  SkywriteVideoMedia,
} from '@/skywrite/types';

function mediaHasPersistedRemoteRefs(media: SkywriteMedia): boolean {
  const uris = [media.photo?.uri, media.video?.uri, media.video?.thumbnailUri, media.audio?.uri];
  return uris.some(
    (uri) =>
      Boolean(parseRemoteAssetIdFromUri(uri)) ||
      (Boolean(uri) && uri!.startsWith('https://') && !isEphemeralMediaUri(uri)),
  );
}

function pickVideoThumbnailUri(
  local: SkywriteVideoMedia | null | undefined,
  remote: SkywriteVideoMedia | null | undefined,
): string | undefined {
  const remoteThumb = remote?.thumbnailUri;
  const localThumb = local?.thumbnailUri;
  if (remoteThumb && parseRemoteAssetIdFromUri(remoteThumb)) return remoteThumb;
  if (localThumb && parseRemoteAssetIdFromUri(localThumb)) return localThumb;
  if (localThumb && isEphemeralMediaUri(localThumb)) return localThumb;
  if (remoteThumb) return remoteThumb;
  return localThumb;
}

function mergePhotoMedia(
  local: SkywritePhotoMedia | null,
  remote: SkywritePhotoMedia | null,
): SkywritePhotoMedia | null {
  if (!local && !remote) return null;
  if (!remote) return local;
  if (!local) return remote;
  return {
    ...remote,
    ...local,
    uri: remote.remoteAssetId ? remote.uri : (local.uri ?? remote.uri),
    remoteAssetId: remote.remoteAssetId ?? local.remoteAssetId,
    width: remote.width ?? local.width,
    height: remote.height ?? local.height,
    stageFit: remote.stageFit ?? local.stageFit,
    framingOffsetX: remote.framingOffsetX ?? local.framingOffsetX,
    framingOffsetY: remote.framingOffsetY ?? local.framingOffsetY,
  };
}

function mergeVideoMedia(
  local: SkywriteVideoMedia | null,
  remote: SkywriteVideoMedia | null,
): SkywriteVideoMedia | null {
  if (!local && !remote) return null;
  if (!remote) return local;
  if (!local) return remote;
  return {
    ...remote,
    ...local,
    uri: remote.remoteAssetId ? remote.uri : (local.uri ?? remote.uri),
    remoteAssetId: remote.remoteAssetId ?? local.remoteAssetId,
    thumbnailUri: pickVideoThumbnailUri(local, remote),
    width: remote.width ?? local.width,
    height: remote.height ?? local.height,
    durationMs: remote.durationMs ?? local.durationMs,
    stageFit: remote.stageFit ?? local.stageFit,
    framingOffsetX: remote.framingOffsetX ?? local.framingOffsetX,
    framingOffsetY: remote.framingOffsetY ?? local.framingOffsetY,
  };
}

function mergePublishedMedia(local: SkywriteMedia, remote: SkywriteMedia): SkywriteMedia {
  const remotePersisted = mediaHasPersistedRemoteRefs(remote);
  const localEphemeral =
    isEphemeralMediaUri(local.photo?.uri) ||
    isEphemeralMediaUri(local.video?.uri) ||
    isEphemeralMediaUri(local.audio?.uri);

  const mergedVideo = mergeVideoMedia(local.video, remote.video);
  const mergedPhoto = mergePhotoMedia(local.photo, remote.photo);

  const mergedAudio = mergeSkywriteAudioMedia(local.audio, remote.audio);

  if (remotePersisted && (localEphemeral || !mediaHasPersistedRemoteRefs(local))) {
    return {
      ...remote,
      photo: mergedPhoto,
      video: mergedVideo,
      audio: mergedAudio,
    };
  }
  if (remote.video?.uri || remote.photo?.uri || remote.audio?.uri) {
    return {
      ...remote,
      photo: mergedPhoto,
      audio: mergedAudio,
      video: mergedVideo,
      originalVideoAudio: remote.originalVideoAudio ?? local.originalVideoAudio,
      originalVideoVolume: remote.originalVideoVolume ?? local.originalVideoVolume,
      voiceoverVolume: remote.voiceoverVolume ?? local.voiceoverVolume,
    };
  }
  return {
    ...local,
    photo: mergedPhoto,
    video: mergedVideo,
    audio: mergedAudio,
  };
}

/** Merge server-authoritative posts with local cache without dropping retention or owner fields. */
export function mergeOwnerSkywritePosts(
  localPosts: readonly SkywriteRecord[],
  remotePosts: readonly SkywriteRecord[],
): SkywriteRecord[] {
  const byId = new Map<string, SkywriteRecord>();
  for (const post of localPosts) {
    byId.set(post.id, post);
  }
  for (const remote of remotePosts) {
    const existing = byId.get(remote.id);
    if (!existing) {
      byId.set(remote.id, remote);
      continue;
    }
    const remotePublished =
      typeof remote.publishedAtMs === 'number' && Number.isFinite(remote.publishedAtMs)
        ? remote.publishedAtMs
        : 0;
    const localPublished =
      typeof existing.publishedAtMs === 'number' && Number.isFinite(existing.publishedAtMs)
        ? existing.publishedAtMs
        : 0;
    const preferRemoteBody = remotePublished >= localPublished;
    const merged = mergeServerRetentionOntoRecord(
      {
        ...(preferRemoteBody ? existing : remote),
        ...(preferRemoteBody ? remote : existing),
        authorId: remote.authorId ?? existing.authorId,
        media: mergePublishedMedia(existing.media, remote.media),
      },
      remote,
    );
    byId.set(remote.id, merged);
  }
  return filterVisibleBetaSkywrites(
    [...byId.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  );
}
