import { getSkywriteAudioSource } from '@/skywrite/media/getSkywriteAudioSource';
import type { SkywriteMedia, SkywriteMediaMode, SkywriteRecord } from '@/skywrite/types';

function mediaPartPresent(
  part: { uri?: string; remoteAssetId?: string } | null | undefined,
): boolean {
  if (!part) return false;
  return Boolean(part.uri?.trim() || part.remoteAssetId?.trim());
}

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
  const hasPhoto = mediaPartPresent(media.photo);
  const hasVideo = mediaPartPresent(media.video);
  const hasAudio = mediaPartPresent(media.audio);
  if (hasVideo && hasAudio) return 'video_audio';
  if (hasVideo) return 'video';
  if (hasPhoto && hasAudio) return 'photo_audio';
  if (hasPhoto) return 'photo';
  if (hasAudio) return 'audio';
  if (mediaMode === 'video' || mediaMode === 'video_voiceover') {
    return hasVideo || mediaMode === 'video_voiceover' ? 'video' : 'text';
  }
  if (mediaMode === 'photo' || mediaMode === 'photo_voiceover') {
    return hasPhoto || mediaMode === 'photo_voiceover' ? (hasAudio ? 'photo_audio' : 'photo') : 'text';
  }
  if (mediaMode === 'voice') return hasAudio ? 'audio' : 'text';
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
  const audioSource = getSkywriteAudioSource(record);
  return {
    kind,
    photoUri: record.media.photo?.uri ?? null,
    videoUri: record.media.video?.uri ?? null,
    videoThumbnailUri: record.media.video?.thumbnailUri ?? null,
    audioUri: audioSource.uri,
    audioDurationMs: audioSource.durationMs,
    textExcerpt: skywritePreviewExcerpt(record.text, 140),
  };
}
