import { parsePublishedAtMs } from '@/skywrite/library/skywriteLibraryRetention';
import {
  PLAY_SKY_SEQUENCE_WINDOW_MS,
  playSkyActiveUntilFromTimestamp,
  type PlaySkySequenceRegistry,
} from '@/skywrite/play/playSkySequenceEligibility';
import type { SkywriteRecord } from '@/skywrite/types';

export type SkyReelTimingPost = Pick<
  SkywriteRecord,
  'id' | 'createdAt' | 'publishedAtMs'
> & {
  skyreelActiveUntilMs?: number | null;
  skyreelRepostedAtMs?: number | null;
};

/** Canonical appearance start for age + expiration (repost renews appearance only). */
export function resolveSkyReelAppearanceStartMs(
  post: SkyReelTimingPost,
  registry: PlaySkySequenceRegistry,
): number {
  const entry = registry[post.id];
  if (entry?.repostedAtMs && Number.isFinite(entry.repostedAtMs)) {
    return entry.repostedAtMs;
  }
  if (entry?.appearancePublishedAtMs && Number.isFinite(entry.appearancePublishedAtMs)) {
    return entry.appearancePublishedAtMs;
  }
  if (post.skyreelRepostedAtMs != null && Number.isFinite(post.skyreelRepostedAtMs)) {
    return post.skyreelRepostedAtMs;
  }
  if (entry?.activeUntilMs && Number.isFinite(entry.activeUntilMs)) {
    return entry.activeUntilMs - PLAY_SKY_SEQUENCE_WINDOW_MS;
  }
  if (post.skyreelActiveUntilMs != null && Number.isFinite(post.skyreelActiveUntilMs)) {
    return post.skyreelActiveUntilMs - PLAY_SKY_SEQUENCE_WINDOW_MS;
  }
  return parsePublishedAtMs(post);
}

/** UTC ms when the current SkyReel appearance ends — always computed (never “unknown active”). */
export function resolveSkyReelActiveUntilMsForPost(
  post: SkyReelTimingPost,
  registry: PlaySkySequenceRegistry,
): number {
  const entry = registry[post.id];
  if (entry?.activeUntilMs && Number.isFinite(entry.activeUntilMs)) {
    return entry.activeUntilMs;
  }
  if (post.skyreelActiveUntilMs != null && Number.isFinite(post.skyreelActiveUntilMs)) {
    return post.skyreelActiveUntilMs;
  }
  const start = resolveSkyReelAppearanceStartMs(post, registry);
  return playSkyActiveUntilFromTimestamp(start);
}

export function isSkyReelActive(
  post: SkyReelTimingPost,
  registry: PlaySkySequenceRegistry,
  nowMs = Date.now(),
): boolean {
  return nowMs < resolveSkyReelActiveUntilMsForPost(post, registry);
}

/** Instagram-style age beside username; uses the same start as expiration. */
export function formatSkyReelAgeLabel(appearanceStartMs: number, nowMs = Date.now()): string {
  const elapsed = Math.max(0, nowMs - appearanceStartMs);
  if (elapsed < 60_000) return 'now';
  const totalMinutes = Math.floor(elapsed / 60_000);
  if (totalMinutes < 60) return `${totalMinutes}m`;
  const hours = Math.floor(totalMinutes / 60);
  if (hours < 24) return `${hours}h`;
  return '23h';
}
