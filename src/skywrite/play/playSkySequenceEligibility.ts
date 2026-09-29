import { currentUser } from '@/data/mockData';
import type { SkywriteRecord } from '@/skywrite/types';

/** Rolling Play Sky window from publication or explicit repost. */
export const PLAY_SKY_SEQUENCE_WINDOW_MS = 24 * 60 * 60 * 1000;

export interface PlaySkySequenceEntry {
  skywriteId: string;
  ownerId: string;
  /** Original post creation — never changes on repost. */
  publishedAt: string;
  /** When sequence eligibility ends (UTC ms). */
  activeUntilMs: number;
  /** Last explicit repost into Play Sky. */
  repostedAtMs?: number;
}

export type PlaySkySequenceRegistry = Record<string, PlaySkySequenceEntry>;

export function playSkyActiveUntilFromTimestamp(startMs: number): number {
  return startMs + PLAY_SKY_SEQUENCE_WINDOW_MS;
}

export function registerPlaySkyPublication(
  registry: PlaySkySequenceRegistry,
  record: Pick<SkywriteRecord, 'id' | 'authorId' | 'createdAt'>,
): PlaySkySequenceRegistry {
  const ownerId = record.authorId ?? currentUser.id;
  const publishedMs = Date.parse(record.createdAt);
  const startMs = Number.isFinite(publishedMs) ? publishedMs : Date.now();
  return {
    ...registry,
    [record.id]: {
      skywriteId: record.id,
      ownerId,
      publishedAt: record.createdAt,
      activeUntilMs: playSkyActiveUntilFromTimestamp(startMs),
    },
  };
}

export function repostIntoPlaySkySequence(
  registry: PlaySkySequenceRegistry,
  skywriteId: string,
  nowMs = Date.now(),
): PlaySkySequenceRegistry {
  const existing = registry[skywriteId];
  if (!existing) return registry;
  return {
    ...registry,
    [skywriteId]: {
      ...existing,
      activeUntilMs: playSkyActiveUntilFromTimestamp(nowMs),
      repostedAtMs: nowMs,
    },
  };
}

export function isPlaySkySequenceEligible(
  entry: PlaySkySequenceEntry | undefined,
  nowMs = Date.now(),
): boolean {
  if (!entry) return false;
  return nowMs < entry.activeUntilMs;
}

export function filterSkywriteIdsForPlaySkySequence(
  skywriteIds: readonly string[],
  registry: PlaySkySequenceRegistry,
  skywritesById: Map<string, SkywriteRecord>,
  ownerId: string = currentUser.id,
  nowMs = Date.now(),
): string[] {
  return skywriteIds.filter((id) => {
    const post = skywritesById.get(id);
    if (!post) return false;
    if ((post.authorId ?? ownerId) !== ownerId) return true;
    const entry = registry[id];
    if (entry) return isPlaySkySequenceEligible(entry, nowMs);
    const publishedMs = Date.parse(post.createdAt);
    if (!Number.isFinite(publishedMs)) return true;
    return nowMs < playSkyActiveUntilFromTimestamp(publishedMs);
  });
}
