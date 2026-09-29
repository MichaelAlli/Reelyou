import type { SkywriteRecord } from '@/skywrite/types';

/** When the experience happened — optional; falls back to posted time. */
export function resolveSkywriteExperiencedAt(post: SkywriteRecord): string {
  if (post.experiencedAt && post.experiencedAt.length > 0) {
    return post.experiencedAt;
  }
  return post.createdAt;
}

export function resolveJourneySortKey(post: SkywriteRecord): string {
  return resolveSkywriteExperiencedAt(post);
}

export function compareJourneyTimelineNewestFirst(a: SkywriteRecord, b: SkywriteRecord): number {
  return resolveJourneySortKey(b).localeCompare(resolveJourneySortKey(a));
}
