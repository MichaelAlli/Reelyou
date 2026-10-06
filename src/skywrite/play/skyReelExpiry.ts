import type { PlaySkySequenceRegistry } from '@/skywrite/play/playSkySequenceEligibility';
import { PLAY_SKY_SEQUENCE_WINDOW_MS } from '@/skywrite/play/playSkySequenceEligibility';
import {
  formatSkyReelAgeLabel,
  isSkyReelActive,
  resolveSkyReelActiveUntilMsForPost,
  resolveSkyReelAppearanceStartMs,
  type SkyReelTimingPost,
} from '@/skywrite/play/skyReelActive';

export {
  formatSkyReelAgeLabel,
  isSkyReelActive,
  resolveSkyReelActiveUntilMsForPost,
  resolveSkyReelAppearanceStartMs,
};

const MS_PER_HOUR = 60 * 60 * 1000;

/** @deprecated Prefer resolveSkyReelActiveUntilMsForPost with the full post record. */
export function resolveSkyReelActiveUntilMs(
  skywriteId: string,
  registry: PlaySkySequenceRegistry,
  options?: SkyReelTimingPost,
): number {
  if (options) {
    return resolveSkyReelActiveUntilMsForPost(options, registry);
  }
  const entry = registry[skywriteId];
  if (entry?.activeUntilMs && Number.isFinite(entry.activeUntilMs)) {
    return entry.activeUntilMs;
  }
  const start = entry?.appearancePublishedAtMs ?? Date.now();
  return start + PLAY_SKY_SEQUENCE_WINDOW_MS;
}

/** Server/client appearance start for the current SkyReel window (repost renews this only). */
export function resolveSkyReelAppearancePublishedAtMs(
  skywriteId: string,
  registry: PlaySkySequenceRegistry,
  options?: {
    createdAt?: string;
    skyreelRepostedAtMs?: number | null;
    skyreelActiveUntilMs?: number | null;
  },
): number | null {
  const entry = registry[skywriteId];
  if (entry?.repostedAtMs && Number.isFinite(entry.repostedAtMs)) {
    return entry.repostedAtMs;
  }
  if (entry?.appearancePublishedAtMs && Number.isFinite(entry.appearancePublishedAtMs)) {
    return entry.appearancePublishedAtMs;
  }
  if (entry?.activeUntilMs && Number.isFinite(entry.activeUntilMs)) {
    return entry.activeUntilMs - PLAY_SKY_SEQUENCE_WINDOW_MS;
  }
  if (options?.skyreelRepostedAtMs != null && Number.isFinite(options.skyreelRepostedAtMs)) {
    return options.skyreelRepostedAtMs;
  }
  if (options?.skyreelActiveUntilMs != null && Number.isFinite(options.skyreelActiveUntilMs)) {
    return options.skyreelActiveUntilMs - PLAY_SKY_SEQUENCE_WINDOW_MS;
  }
  if (options?.createdAt) {
    const ms = Date.parse(options.createdAt);
    if (Number.isFinite(ms)) return ms;
  }
  if (entry?.publishedAt) {
    const ms = Date.parse(entry.publishedAt);
    if (Number.isFinite(ms)) return ms;
  }
  return null;
}

export function isSkyReelAppearanceActive(
  activeUntilMs: number | null,
  nowMs = Date.now(),
): boolean {
  if (activeUntilMs == null || !Number.isFinite(activeUntilMs)) return false;
  return nowMs < activeUntilMs;
}

/** Count-up hour while appearance is active: floor(elapsedHours) + 1, capped at 24. */
export function resolveSkyReelDisplayHour(
  appearancePublishedAtMs: number | null,
  activeUntilMs: number | null,
  nowMs = Date.now(),
): number | null {
  if (activeUntilMs != null && nowMs >= activeUntilMs) return null;
  if (appearancePublishedAtMs == null || !Number.isFinite(appearancePublishedAtMs)) return null;
  const elapsedMs = Math.max(0, nowMs - appearancePublishedAtMs);
  const hour = Math.floor(elapsedMs / MS_PER_HOUR) + 1;
  return Math.min(24, Math.max(1, hour));
}

export function formatSkyReelHourLabel(hour: number | null): string | null {
  if (hour == null || hour < 1 || hour > 24) return null;
  return `Hour ${hour} of 24.`;
}

/** @deprecated Countdown label — prefer formatSkyReelHourLabel for SkyReel UI. */
export function formatSkyReelRemainingLabel(remainingMs: number): string {
  if (remainingMs <= 0) return 'Expired';
  const totalMinutes = Math.ceil(remainingMs / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
}
