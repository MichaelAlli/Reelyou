import { BetaFeatures } from '@/constants/betaFeatures';
import type { SkywritePlayStepKind } from '@/skywrite/play/skywritePlayTypes';
import type { SkywriteMediaMode, SkywriteRecord } from '@/skywrite/types';

/** Narration attached to text, photo, or video — not a standalone audio slide. */
export function isAttachedVoiceoverRecord(
  record: Pick<SkywriteRecord, 'text' | 'media' | 'mediaMode'>,
): boolean {
  if (!record.media.audio?.uri) return false;
  if (record.mediaMode === 'video_voiceover') return true;
  if (record.mediaMode === 'photo_voiceover') return true;
  if (record.mediaMode === 'text_voiceover') return true;
  if (record.media.video?.uri) return true;
  if (record.media.photo?.uri) return true;
  if (record.text.trim().length > 0 && !record.media.photo?.uri && !record.media.video?.uri) {
    return true;
  }
  return false;
}

/** Only-voice Skywrite (optional empty text, no photo/video). */
export function isStandaloneAudioRecord(
  record: Pick<SkywriteRecord, 'text' | 'media' | 'mediaMode'>,
): boolean {
  if (!record.media.audio?.uri) return false;
  if (record.media.video?.uri || record.media.photo?.uri) return false;
  if (isAttachedVoiceoverRecord(record)) return false;
  if (record.mediaMode === 'voice') return true;
  return record.text.trim().length === 0;
}

export function stepUsesAttachedVoiceover(
  record: Pick<SkywriteRecord, 'text' | 'media' | 'mediaMode'>,
  stepKind: SkywritePlayStepKind,
): boolean {
  if (!isAttachedVoiceoverRecord(record)) return false;
  return stepKind === 'text' || stepKind === 'photo' || stepKind === 'video';
}

export function inferMediaModeFromParts(input: {
  text: string;
  hasPhoto: boolean;
  hasVideo: boolean;
  hasAudio: boolean;
}): SkywriteMediaMode {
  const { text, hasPhoto, hasVideo, hasAudio } = input;
  if (hasVideo && hasAudio) return 'video_voiceover';
  if (hasVideo) return 'video';
  if (hasPhoto && hasAudio) return 'photo_voiceover';
  if (hasPhoto) return 'photo';
  if (hasAudio && text.trim().length > 0) return 'text_voiceover';
  if (hasAudio && BetaFeatures.standaloneAudioSkywrites) return 'voice';
  if (text.trim().length > 0) return 'text';
  return 'text';
}
