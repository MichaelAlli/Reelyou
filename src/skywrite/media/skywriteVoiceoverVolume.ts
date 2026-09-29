import type { SkywriteMedia } from '@/skywrite/types';

import { clampVolume, stepOriginalVideoVolume } from '@/skywrite/media/skywriteOriginalVideoVolume';

export function resolveVoiceoverVolume(media: SkywriteMedia): number {
  if (typeof media.voiceoverVolume === 'number') {
    return clampVolume(media.voiceoverVolume);
  }
  return 1;
}

export function stepVoiceoverVolume(current: number, delta: number): number {
  return stepOriginalVideoVolume(current, delta);
}

export { clampVolume };
