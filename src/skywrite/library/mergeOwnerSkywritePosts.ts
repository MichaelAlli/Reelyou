import { mergeServerRetentionOntoRecord } from '@/skywrite/library/skywriteLibraryRetention';
import type { SkywriteRecord } from '@/skywrite/types';

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
    const merged = mergeServerRetentionOntoRecord(
      {
        ...existing,
        ...remote,
        authorId: remote.authorId ?? existing.authorId,
        media: remote.media?.video?.uri || remote.media?.photo?.uri || remote.media?.audio?.uri
          ? remote.media
          : existing.media,
      },
      remote,
    );
    byId.set(remote.id, merged);
  }
  return [...byId.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
