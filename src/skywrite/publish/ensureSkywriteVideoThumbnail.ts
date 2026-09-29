import type { SkywriteDraft, SkywriteVideoMedia } from '@/skywrite/types';

/** Generates a persisted thumbnail URI for video posts when possible. */
export async function ensureSkywriteVideoThumbnail(
  video: SkywriteVideoMedia | null,
): Promise<SkywriteVideoMedia | null> {
  if (!video?.uri) return video;
  if (video.thumbnailUri) return video;

  try {
    const VideoThumbnails = await import('expo-video-thumbnails');
    const { uri } = await VideoThumbnails.getThumbnailAsync(video.uri, {
      time: 0,
      quality: 0.72,
    });
    if (!uri) return video;
    return { ...video, thumbnailUri: uri };
  } catch {
    return video;
  }
}

/** Publish keeps the original video file; framing is display metadata on the record. */
export async function prepareSkywriteDraftForPublish(draft: SkywriteDraft): Promise<SkywriteDraft> {
  if (!draft.media.video?.uri) return draft;
  const video = await ensureSkywriteVideoThumbnail(draft.media.video);
  if (video === draft.media.video) return draft;
  return {
    ...draft,
    media: {
      ...draft.media,
      video,
    },
  };
}
