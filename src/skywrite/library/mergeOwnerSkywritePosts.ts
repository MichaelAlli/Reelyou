import { mergeServerRetentionOntoRecord } from '@/skywrite/library/skywriteLibraryRetention';
import {
  isEphemeralMediaUri,
  parseRemoteAssetIdFromUri,
} from '@/social/sharedMediaConstants';
import type { SkywriteMedia, SkywriteRecord } from '@/skywrite/types';

function mediaHasPersistedRemoteRefs(media: SkywriteMedia): boolean {
  const uris = [media.photo?.uri, media.video?.uri, media.video?.thumbnailUri, media.audio?.uri];
  return uris.some(
    (uri) =>
      Boolean(parseRemoteAssetIdFromUri(uri)) ||
      (Boolean(uri) && uri!.startsWith('https://') && !isEphemeralMediaUri(uri)),
  );
}

function mergePublishedMedia(local: SkywriteMedia, remote: SkywriteMedia): SkywriteMedia {
  const remotePersisted = mediaHasPersistedRemoteRefs(remote);
  const localEphemeral =
    isEphemeralMediaUri(local.photo?.uri) ||
    isEphemeralMediaUri(local.video?.uri) ||
    isEphemeralMediaUri(local.audio?.uri);
  if (remotePersisted && (localEphemeral || !mediaHasPersistedRemoteRefs(local))) {
    return remote;
  }
  if (remote.video?.uri || remote.photo?.uri || remote.audio?.uri) {
    return remote;
  }
  return local;
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
  return [...byId.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
