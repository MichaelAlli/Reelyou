import type { PlaySkySequenceRegistry } from '@/skywrite/play/playSkySequenceEligibility';

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

export function isSkyReelAppearanceActive(
  activeUntilMs: number | null,
  nowMs = Date.now(),
): boolean {
  if (activeUntilMs == null || !Number.isFinite(activeUntilMs)) return true;
  return nowMs < activeUntilMs;
}

export function formatSkyReelRemainingLabel(remainingMs: number): string {
  if (remainingMs <= 0) return 'Expired';
  const totalMinutes = Math.ceil(remainingMs / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
}
