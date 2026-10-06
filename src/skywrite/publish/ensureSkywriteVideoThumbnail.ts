import { captureSkywriteVideoPosterUri } from '@/skywrite/publish/captureSkywriteVideoPoster';
import type { SkywriteDraft, SkywriteVideoMedia } from '@/skywrite/types';

/** Generates a persisted thumbnail URI for video posts when possible. */
export async function ensureSkywriteVideoThumbnail(
  video: SkywriteVideoMedia | null,
): Promise<SkywriteVideoMedia | null> {
  if (!video?.uri) return video;
  if (video.thumbnailUri) return video;

  const uri = await captureSkywriteVideoPosterUri(video.uri);
  if (!uri) return video;
  return { ...video, thumbnailUri: uri };
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
