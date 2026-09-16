import { SkywriteCopy } from '@/constants/skywriteCopy';
import type { SkywriteDraft, SkywriteMedia, SkywriteMediaMode, SkywriteRecord } from '@/skywrite/types';
import { EMPTY_SKYWRITE_MEDIA } from '@/skywrite/types';

export interface SkywriteMediaActionLabels {
  photoLabel: string;
  voiceLabel: string;
  photoA11y: string;
  voiceA11y: string;
}

export function deriveMediaMode(media: SkywriteMedia, text: string): SkywriteMediaMode {
  const hasPhoto = Boolean(media.photo);
  const hasAudio = Boolean(media.audio);
  if (hasPhoto && hasAudio) return 'photo_voiceover';
  if (hasPhoto) return 'photo';
  if (hasAudio) return 'voice';
  if (text.trim().length > 0) return 'text';
  return 'text';
}

/** Progressive media action labels — makes photo + voiceover combination obvious. */
export function getSkywriteMediaActionLabels(
  hasPhoto: boolean,
  hasVoice: boolean,
): SkywriteMediaActionLabels {
  if (!hasPhoto && !hasVoice) {
    return {
      photoLabel: SkywriteCopy.mediaPhoto,
      voiceLabel: SkywriteCopy.mediaVoice,
      photoA11y: 'Add photo',
      voiceA11y: 'Add voice note',
    };
  }
  if (hasPhoto && !hasVoice) {
    return {
      photoLabel: SkywriteCopy.mediaChangePhoto,
      voiceLabel: SkywriteCopy.mediaAddVoiceover,
      photoA11y: 'Change photo',
      voiceA11y: 'Add voiceover to this photo',
    };
  }
  if (!hasPhoto && hasVoice) {
    return {
      photoLabel: SkywriteCopy.mediaAddPhoto,
      voiceLabel: SkywriteCopy.mediaVoiceNoteDone,
      photoA11y: 'Add photo to this Skywrite',
      voiceA11y: 'Re-record voice note',
    };
  }
  return {
    photoLabel: SkywriteCopy.mediaChangePhoto,
    voiceLabel: SkywriteCopy.mediaReRecordVoiceover,
    photoA11y: 'Change photo',
    voiceA11y: 'Re-record voiceover',
  };
}

export function hasSkywriteContent(draft: Pick<SkywriteDraft, 'text' | 'media'>): boolean {
  return (
    draft.text.trim().length > 0 ||
    Boolean(draft.media.photo) ||
    Boolean(draft.media.audio)
  );
}

export function createEmptySkywriteDraft(
  defaults?: Partial<Pick<SkywriteDraft, 'visibility' | 'animateToSky' | 'allowAIContext'>>,
): SkywriteDraft {
  return {
    text: '',
    media: { ...EMPTY_SKYWRITE_MEDIA },
    visibility: defaults?.visibility ?? 'public',
    mood: null,
    showingUp: null,
    userHashtags: [],
    animateToSky: defaults?.animateToSky ?? true,
    allowAIContext: defaults?.allowAIContext ?? true,
  };
}

export function buildSkywriteRecord(
  draft: SkywriteDraft,
  id: string,
  createdAt: string,
): SkywriteRecord {
  const text = draft.text.trim();
  return {
    id,
    text,
    media: {
      photo: draft.media.photo,
      audio: draft.media.audio,
    },
    mediaMode: deriveMediaMode(draft.media, text),
    visibility: draft.visibility,
    mood: draft.mood,
    showingUp: draft.showingUp ?? null,
    userHashtags: draft.userHashtags,
    animateToSky: draft.animateToSky ?? true,
    allowAIContext: draft.allowAIContext ?? true,
    createdAt,
  };
}
