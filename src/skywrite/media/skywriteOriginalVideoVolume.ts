import type { SkywriteMedia, SkywriteVideoOriginalAudioState } from '@/skywrite/types';

const LOWER_THRESHOLD = 0.35;

export function resolveOriginalVideoVolume(media: SkywriteMedia): number {
  if (typeof media.originalVideoVolume === 'number') {
    return clampVolume(media.originalVideoVolume);
  }
  const state = media.originalVideoAudio ?? 'on';
  if (state === 'off') return 0;
  if (state === 'lower') return 0.22;
  return 1;
}

export function syncOriginalVideoAudioState(volume: number): SkywriteVideoOriginalAudioState {
  const v = clampVolume(volume);
  if (v <= 0) return 'off';
  if (v <= LOWER_THRESHOLD) return 'lower';
  return 'on';
}

export function clampVolume(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.min(1, Math.max(0, value));
}

export function stepOriginalVideoVolume(current: number, delta: number): number {
  return clampVolume(Math.round((current + delta) * 20) / 20);
}
