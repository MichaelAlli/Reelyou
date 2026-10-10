import { BetaFeatures } from '@/constants/betaFeatures';
import { SkywriteCopy } from '@/constants/skywriteCopy';
import { buildSkywriteRecord, createEmptySkywriteDraft } from '@/skywrite/draft';
import type { SkywriteDraft, SkywriteRecord } from '@/skywrite/types';
import { isStandaloneAudioRecord } from '@/skywrite/voiceoverStepUtils';

export function standaloneAudioSkywritesEnabled(): boolean {
  return BetaFeatures.standaloneAudioSkywrites;
}

/** Audio-only primary content — not photo/video voiceover or text narration. */
export function isStandaloneAudioSkywrite(
  post: Pick<SkywriteRecord, 'text' | 'media' | 'mediaMode'>,
): boolean {
  return isStandaloneAudioRecord(post);
}

export function isStandaloneAudioDraft(draft: Pick<SkywriteDraft, 'text' | 'media'>): boolean {
  const record = buildSkywriteRecord(
    { ...createEmptySkywriteDraft(), ...draft, userHashtags: [] },
    'standalone-audio-check',
    new Date(0).toISOString(),
    'local',
  );
  return isStandaloneAudioSkywrite(record);
}

export function shouldHideStandaloneAudioSkywrite(
  post: Pick<SkywriteRecord, 'text' | 'media' | 'mediaMode'>,
): boolean {
  return !standaloneAudioSkywritesEnabled() && isStandaloneAudioSkywrite(post);
}

export function filterVisibleBetaSkywrites<T extends Pick<SkywriteRecord, 'text' | 'media' | 'mediaMode'>>(
  posts: readonly T[],
): T[] {
  if (standaloneAudioSkywritesEnabled()) return [...posts];
  return posts.filter((post) => !isStandaloneAudioSkywrite(post));
}

export function validateSkywriteDraftForBeta(draft: SkywriteDraft): string | null {
  if (standaloneAudioSkywritesEnabled()) return null;
  if (!isStandaloneAudioDraft(draft)) return null;
  return SkywriteCopy.standaloneAudioBetaDisabled;
}

export function composerAllowsVoiceCapture(input: {
  hasPhoto: boolean;
  hasVideo: boolean;
  hasText: boolean;
}): boolean {
  if (standaloneAudioSkywritesEnabled()) return true;
  return input.hasPhoto || input.hasVideo || input.hasText;
}
