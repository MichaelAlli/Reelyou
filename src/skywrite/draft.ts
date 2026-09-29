import { SkywriteCopy } from '@/constants/skywriteCopy';
import { inferSkywriteIntentFromShowingUp } from '@/skywrite/skywriteIntent';
import type { SkywriteDraft, SkywriteMedia, SkywriteMediaMode, SkywriteRecord } from '@/skywrite/types';
import { EMPTY_SKYWRITE_MEDIA } from '@/skywrite/types';

export interface SkywriteMediaActionLabels {
  photoLabel: string;
  voiceLabel: string;
  photoA11y: string;
  voiceA11y: string;
}

export function deriveMediaMode(media: SkywriteMedia, text: string): SkywriteMediaMode {
  const hasPhoto = Boolean(media.photo?.uri);
  const hasVideo = Boolean(media.video?.uri);
  const hasAudio = Boolean(media.audio?.uri);
  if (hasVideo && hasAudio) return 'video_voiceover';
  if (hasVideo) return 'video';
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
  hasVideo = false,
): SkywriteMediaActionLabels {
  if (hasVideo && !hasVoice) {
    return {
      photoLabel: SkywriteCopy.mediaChangeVideo,
      voiceLabel: SkywriteCopy.mediaAddVoiceover,
      photoA11y: 'Change video',
      voiceA11y: 'Add voiceover to this video',
    };
  }
  if (hasVideo && hasVoice) {
    return {
      photoLabel: SkywriteCopy.mediaChangeVideo,
      voiceLabel: SkywriteCopy.mediaReRecordVoiceover,
      photoA11y: 'Change video',
      voiceA11y: 'Re-record voiceover',
    };
  }
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
    Boolean(draft.media.photo?.uri) ||
    Boolean(draft.media.video?.uri) ||
    Boolean(draft.media.audio?.uri)
  );
}

export function skywriteRecordToDraft(record: SkywriteRecord): SkywriteDraft {
  return {
    text: record.text,
    textStyle: record.textStyle,
    media: { ...record.media },
    visibility: record.visibility,
    mood: record.mood,
    showingUp: record.showingUp,
    userHashtags: [...record.userHashtags],
    animateToSky: record.animateToSky,
    allowAIContext: record.allowAIContext,
    skyAreaId: record.skyAreaId,
    intent: record.intent,
  };
}

export function createEmptySkywriteDraft(
  defaults?: Partial<
    Pick<SkywriteDraft, 'visibility' | 'animateToSky' | 'allowAIContext' | 'skyAreaId'>
  >,
): SkywriteDraft {
  return {
    text: '',
    media: { ...EMPTY_SKYWRITE_MEDIA },
    visibility: defaults?.visibility ?? 'public',
    skyAreaId: defaults?.skyAreaId,
    mood: null,
    showingUp: null,
    textStyle: 'plain',
    userHashtags: [],
    animateToSky: defaults?.animateToSky ?? true,
    allowAIContext: defaults?.allowAIContext ?? true,
  };
}

/** Ephemeral record for compose preview — never persisted. */
export function buildSkywritePreviewRecord(
  draft: SkywriteDraft,
  authorId: string,
  userHashtags: string[],
): SkywriteRecord {
  return buildSkywriteRecord(
    { ...draft, userHashtags },
    'skywrite-preview-draft',
    new Date().toISOString(),
    authorId,
  );
}

export function buildSkywriteRecord(
  draft: SkywriteDraft,
  id: string,
  createdAt: string,
  authorId: string,
): SkywriteRecord {
  const text = draft.text.trim();
  const intent = draft.intent ?? inferSkywriteIntentFromShowingUp(draft.showingUp);

  const base = {
    id,
    authorId,
    text,
    textStyle: draft.textStyle ?? 'plain',
    media: {
      photo: draft.media.photo,
      video: draft.media.video,
      audio: draft.media.audio,
      originalVideoAudio: draft.media.originalVideoAudio,
      originalVideoVolume: draft.media.originalVideoVolume,
      voiceoverVolume: draft.media.voiceoverVolume,
    },
    mediaMode: deriveMediaMode(draft.media, text),
    visibility: draft.visibility,
    mood: draft.mood,
    showingUp: draft.showingUp ?? null,
    userHashtags: draft.userHashtags,
    animateToSky: draft.animateToSky ?? true,
    allowAIContext: draft.allowAIContext ?? true,
    intent,
    createdAt,
  } satisfies Omit<SkywriteRecord, 'skyAreaId'>;

  return {
    ...base,
    skyAreaId:
      draft.skyAreaId && draft.skyAreaId.length > 0 ? draft.skyAreaId : undefined,
  };
}
