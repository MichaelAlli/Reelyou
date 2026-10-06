import { SKYREEL_WINDOW_MS } from './skyreelConstants.js';
import type { StoredSkywrite } from './skywriteTypes.js';

/** Idempotent repair for legacy ms/s skew and missing SkyReel fields. */
export function normalizeStoredSkyreelFields(
  row: StoredSkywrite,
  now = Date.now(),
): StoredSkywrite {
  let createdAt = row.createdAt;
  if (!Number.isFinite(createdAt) || createdAt <= 0) {
    createdAt = now;
  }
  // Legacy rows stored seconds instead of milliseconds.
  if (createdAt < 1_000_000_000_000) {
    createdAt *= 1000;
  }

  const publishedAtMs =
    typeof row.publishedAtMs === 'number' && Number.isFinite(row.publishedAtMs) && row.publishedAtMs > 0
      ? row.publishedAtMs < 1_000_000_000_000
        ? row.publishedAtMs * 1000
        : row.publishedAtMs
      : createdAt;

  let appearanceStartMs = row.skyreelRepostedAtMs ?? publishedAtMs;
  if (!Number.isFinite(appearanceStartMs) || appearanceStartMs <= 0) {
    appearanceStartMs = publishedAtMs;
  }
  if (appearanceStartMs < 1_000_000_000_000) {
    appearanceStartMs *= 1000;
  }

  let activeUntilMs = row.skyreelActiveUntilMs ?? appearanceStartMs + SKYREEL_WINDOW_MS;
  if (!Number.isFinite(activeUntilMs) || activeUntilMs <= 0) {
    activeUntilMs = appearanceStartMs + SKYREEL_WINDOW_MS;
  }
  if (activeUntilMs < 1_000_000_000_000) {
    activeUntilMs *= 1000;
  }
  const expectedUntil = appearanceStartMs + SKYREEL_WINDOW_MS;
  if (Math.abs(activeUntilMs - expectedUntil) > 60_000) {
    activeUntilMs = expectedUntil;
  }

  return {
    ...row,
    createdAt,
    publishedAtMs,
    skyreelActiveUntilMs: activeUntilMs,
    skyreelRepostedAtMs: row.skyreelRepostedAtMs ?? null,
  };
}

export function isSkyreelAppearanceEligible(row: StoredSkywrite, now = Date.now()): boolean {
  const normalized = normalizeStoredSkyreelFields(row, now);
  return now < (normalized.skyreelActiveUntilMs ?? 0);
}
