import { CelestialPalette } from '@/constants/celestialTokens';
import type { MySkyStarDisplay } from '@/mySky/types';
import type { SkywriteMediaMode, SkywriteRecord } from '@/skywrite/types';

/** Canonical semantic meaning for Skywrite stars (not voiceover layer). */
export type SkywriteStarMeaning = 'motion' | 'memory' | 'reflection';

export const SkywriteStarSemanticColors = {
  motion: CelestialPalette.skywriteGold,
  memory: CelestialPalette.growth,
  reflection: CelestialPalette.reflection,
} as const;

function hasVideoMedia(post: Pick<SkywriteRecord, 'media' | 'mediaMode'>): boolean {
  return Boolean(post.media.video?.uri || post.media.video?.remoteAssetId);
}

function hasPhotoMedia(post: Pick<SkywriteRecord, 'media' | 'mediaMode'>): boolean {
  return Boolean(post.media.photo?.uri || post.media.photo?.remoteAssetId);
}

export function resolveSkywriteStarMeaning(
  post: Pick<SkywriteRecord, 'text' | 'media' | 'mediaMode'>,
): SkywriteStarMeaning {
  if (hasVideoMedia(post)) return 'motion';
  if (post.mediaMode === 'video' || post.mediaMode === 'video_voiceover') return 'motion';
  if (hasPhotoMedia(post)) return 'memory';
  if (post.mediaMode === 'photo' || post.mediaMode === 'photo_voiceover') return 'memory';
  if (post.text.trim().length > 0) return 'reflection';
  return 'reflection';
}

export function getSkywriteStarColor(
  post: Pick<SkywriteRecord, 'text' | 'media' | 'mediaMode'>,
): string {
  return SkywriteStarSemanticColors[resolveSkywriteStarMeaning(post)];
}

export function getSkywriteStarAccessibilityLabel(
  post: Pick<SkywriteRecord, 'text' | 'media' | 'mediaMode'>,
): string {
  const meaning = resolveSkywriteStarMeaning(post);
  if (meaning === 'motion') return 'Video Skywrite — Motion';
  if (meaning === 'memory') return 'Photo Skywrite — Memory';
  return 'Text Skywrite — Reflection';
}

function accessibilityLabelFromMediaMode(mode: SkywriteMediaMode): string {
  if (mode === 'video' || mode === 'video_voiceover') return 'Video Skywrite — Motion';
  if (mode === 'photo' || mode === 'photo_voiceover') return 'Photo Skywrite — Memory';
  return 'Text Skywrite — Reflection';
}

/** Accessibility for canvas stars when full media is not loaded. */
export function resolveMySkyStarAccessibilityLabel(star: MySkyStarDisplay): string | null {
  if (star.type !== 'skywrite') return null;
  if (star.mediaMode) return accessibilityLabelFromMediaMode(star.mediaMode);
  return null;
}
