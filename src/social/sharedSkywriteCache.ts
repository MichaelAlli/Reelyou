import type { SkywriteRecord } from '@/skywrite/types';

const byAuthor = new Map<string, SkywriteRecord[]>();
const byId = new Map<string, SkywriteRecord>();

export function cacheRemoteSkywrites(authorUserId: string, posts: SkywriteRecord[]): void {
  byAuthor.set(authorUserId, posts);
  for (const post of posts) {
    byId.set(post.id, post);
  }
}

export function cacheRemoteSkywrite(post: SkywriteRecord): void {
  byId.set(post.id, post);
  if (!post.authorId) return;
  const existing = byAuthor.get(post.authorId) ?? [];
  const next = [post, ...existing.filter((p) => p.id !== post.id)];
  byAuthor.set(post.authorId, next);
}

export function getCachedSkywrite(skywriteId: string): SkywriteRecord | undefined {
  return byId.get(skywriteId);
}

export function getCachedAuthorSkywrites(authorUserId: string): SkywriteRecord[] {
  return byAuthor.get(authorUserId) ?? [];
}

/** Server-backed posts for a profile owner — merged without duplicating ids. */
export function mergeCachedAuthorSkywrites(
  authorUserId: string,
  local: readonly SkywriteRecord[],
): SkywriteRecord[] {
  const cached = getCachedAuthorSkywrites(authorUserId);
  if (cached.length === 0) return [...local];
  const byId = new Map<string, SkywriteRecord>();
  for (const post of local) byId.set(post.id, post);
  for (const post of cached) byId.set(post.id, post);
  return [...byId.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
