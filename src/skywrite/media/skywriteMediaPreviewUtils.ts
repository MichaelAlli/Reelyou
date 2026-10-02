import type { SkywriteMedia, SkywriteMediaMode, SkywriteRecord } from '@/skywrite/types';

export type SkywriteMediaPreviewKind =
  | 'text'
  | 'photo'
  | 'audio'
  | 'photo_audio'
  | 'video'
  | 'video_audio';

export function formatSkywritePlaybackDurationLabel(
  durationMs: number | undefined,
  durationKnown = true,
): string {
  if (
    !durationKnown ||
    durationMs == null ||
    typeof durationMs !== 'number' ||
    !Number.isFinite(durationMs) ||
    durationMs <= 0
  ) {
    return '--:--';
  }
  return formatSkywriteAudioDuration(durationMs);
}

export function formatSkywriteAudioDuration(durationMs: number | undefined): string {
  if (!durationMs || !Number.isFinite(durationMs) || durationMs <= 0) return '0:00';
  const totalSec = Math.floor(durationMs / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${String(sec).padStart(2, '0')}`;
}

export function resolveSkywriteMediaPreviewKind(
  media: SkywriteMedia,
  mediaMode?: SkywriteMediaMode,
): SkywriteMediaPreviewKind {
  const hasPhoto = Boolean(media.photo?.uri);
  const hasVideo = Boolean(media.video?.uri);
  const hasAudio = Boolean(media.audio?.uri);
  if (hasVideo && hasAudio) return 'video_audio';
  if (hasVideo) return 'video';
  if (hasPhoto && hasAudio) return 'photo_audio';
  if (hasPhoto) return 'photo';
  if (hasAudio) return 'audio';
  if (mediaMode === 'video' || mediaMode === 'video_voiceover') return hasVideo ? 'video' : 'text';
  if (mediaMode === 'photo' || mediaMode === 'photo_voiceover' || mediaMode === 'voice') {
    if (mediaMode === 'photo_voiceover' && hasPhoto) return 'photo_audio';
    if (mediaMode === 'voice') return hasAudio ? 'audio' : 'text';
    if (mediaMode === 'photo') return hasPhoto ? 'photo' : 'text';
  }
  return 'text';
}

export function skywritePreviewExcerpt(text: string, max = 120): string {
  const trimmed = text.trim();
  if (!trimmed) return '';
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
}

export function pickSkywriteMediaSource(record: Pick<SkywriteRecord, 'media' | 'mediaMode' | 'text'>): {
  kind: SkywriteMediaPreviewKind;
  photoUri: string | null;
  videoUri: string | null;
  videoThumbnailUri: string | null;
  audioUri: string | null;
  audioDurationMs: number | undefined;
  textExcerpt: string;
} {
  const kind = resolveSkywriteMediaPreviewKind(record.media, record.mediaMode);
  return {
    kind,
    photoUri: record.media.photo?.uri ?? null,
    videoUri: record.media.video?.uri ?? null,
    videoThumbnailUri:
      record.media.video?.thumbnailUri ?? record.media.video?.uri ?? null,
    audioUri: record.media.audio?.uri ?? null,
    audioDurationMs: record.media.audio?.durationMs,
    textExcerpt: skywritePreviewExcerpt(record.text, 140),
  };
}
