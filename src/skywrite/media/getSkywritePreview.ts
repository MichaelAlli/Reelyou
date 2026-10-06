import { getSkywriteThumbnail } from '@/skywrite/media/getSkywriteThumbnail';
import {
  pickSkywriteMediaSource,
  type SkywriteMediaPreviewKind,
} from '@/skywrite/media/skywriteMediaPreviewUtils';
import type { SkywriteRecord } from '@/skywrite/types';

/** Shared list/grid preview — one resolver for Recent, Journey, profile cards, etc. */
export type SkywritePreviewModel = {
  kind: SkywriteMediaPreviewKind;
  imageUri: string | null;
  textExcerpt: string;
  isVideo: boolean;
  isPhoto: boolean;
  isText: boolean;
};

export function getSkywritePreview(
  record: Pick<SkywriteRecord, 'media' | 'mediaMode' | 'text'>,
): SkywritePreviewModel {
  const source = pickSkywriteMediaSource(record);
  const kind = source.kind;
  return {
    kind,
    imageUri: getSkywriteThumbnail(record),
    textExcerpt: source.textExcerpt,
    isVideo: kind === 'video' || kind === 'video_audio',
    isPhoto: kind === 'photo' || kind === 'photo_audio',
    isText: kind === 'text',
  };
}
