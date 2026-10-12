import { buildRemoteAssetPlaceholderUri } from '@/social/sharedMediaConstants';
import {
  getSkywriteThumbnail,
  recordNeedsLibraryThumbnailPipeline,
} from '@/skywrite/media/getSkywriteThumbnail';
import type { SkywriteRecord } from '@/skywrite/types';

const videoRecord: SkywriteRecord = {
  id: 'v1',
  authorId: 'u1',
  text: '',
  textStyle: 'plain',
  mediaMode: 'video',
  visibility: 'private',
  mood: null,
  showingUp: null,
  userHashtags: [],
  animateToSky: true,
  allowAIContext: true,
  createdAt: new Date().toISOString(),
  media: {
    photo: null,
    audio: null,
    video: {
      uri: buildRemoteAssetPlaceholderUri('vid-1'),
      remoteAssetId: 'vid-1',
      thumbnailUri: buildRemoteAssetPlaceholderUri('thumb-1'),
    },
    originalVideoAudio: 'off',
  },
};

if (getSkywriteThumbnail(videoRecord) !== buildRemoteAssetPlaceholderUri('thumb-1')) {
  throw new Error('getSkywriteThumbnail must return media.video.thumbnailUri');
}

if (!recordNeedsLibraryThumbnailPipeline(videoRecord)) {
  throw new Error('remote placeholder thumbnail requires signed URL resolve');
}

const missingThumb: SkywriteRecord = {
  ...videoRecord,
  media: {
    ...videoRecord.media,
    video: { ...videoRecord.media.video!, thumbnailUri: undefined },
  },
};

if (!recordNeedsLibraryThumbnailPipeline(missingThumb)) {
  throw new Error('video without thumbnail must enter library pipeline');
}

console.log('getSkywriteThumbnail.test.ts — OK');
