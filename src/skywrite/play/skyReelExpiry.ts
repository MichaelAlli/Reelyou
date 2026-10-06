import type { PlaySkySequenceRegistry } from '@/skywrite/play/playSkySequenceEligibility';
import { PLAY_SKY_SEQUENCE_WINDOW_MS } from '@/skywrite/play/playSkySequenceEligibility';

const MS_PER_HOUR = 60 * 60 * 1000;

/** Persisted SkyReel visibility end — not playback duration. */
export function resolveSkyReelActiveUntilMs(
  skywriteId: string,
  registry: PlaySkySequenceRegistry,
  _createdAt?: string,
): number | null {
  const entry = registry[skywriteId];
  if (entry?.activeUntilMs && Number.isFinite(entry.activeUntilMs)) {
    return entry.activeUntilMs;
  }
  return null;
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
  if (activeUntilMs == null || !Number.isFinite(activeUntilMs)) return true;
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
