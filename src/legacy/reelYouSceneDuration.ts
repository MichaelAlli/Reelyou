import type { LegacyMoment } from '@/legacy/legacyMomentTypes';

export const REEL_SCENE_MIN_MS = 3000;
export const REEL_SCENE_TEXT_MS = 4500;
export const REEL_SCENE_IMAGE_MS = 5500;
export const REEL_SCENE_IMPACT_RIPPLE_MS = 5500;
export const REEL_SCENE_AUDIO_MS = 5000;

/** Beta pacing — timer-driven progression (not media onEnded). */
export function reelSceneDurationMs(moment: LegacyMoment | undefined): number {
  if (!moment) return REEL_SCENE_TEXT_MS;

  if (moment.eventType === 'impact' || moment.eventType === 'ripple') {
    return REEL_SCENE_IMPACT_RIPPLE_MS;
  }

  const media = moment.mediaRefs;
  if (media?.photoUri && !moment.sourceContentDeleted) {
    return REEL_SCENE_IMAGE_MS;
  }
  if (media?.audioUri && !media?.photoUri) {
    return REEL_SCENE_AUDIO_MS;
  }

  return REEL_SCENE_TEXT_MS;
}
