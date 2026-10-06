import {
  formatSkywriteAudioDuration,
  pickSkywriteMediaSource,
  resolveSkywriteMediaPreviewKind,
} from '@/skywrite/media/skywriteMediaPreviewUtils';
import { EMPTY_SKYWRITE_MEDIA } from '@/skywrite/types';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

assert(formatSkywriteAudioDuration(65000) === '1:05', 'duration format');
assert(
  resolveSkywriteMediaPreviewKind(EMPTY_SKYWRITE_MEDIA, 'text') === 'text',
  'text-only kind',
);
assert(
  resolveSkywriteMediaPreviewKind(
    {
      photo: { uri: 'https://example.com/a.jpg' },
      video: null,
      audio: null,
    },
    'photo',
  ) === 'photo',
  'photo kind',
);
assert(
  resolveSkywriteMediaPreviewKind(
    {
      photo: { remoteAssetId: 'asset-photo-1' },
      video: null,
      audio: null,
    },
    'photo',
  ) === 'photo',
  'photo kind from remoteAssetId only',
);
assert(
  pickSkywriteMediaSource({
    text: 'caption',
    media: {
      photo: { uri: 'https://example.com/a.jpg' },
      video: null,
      audio: { uri: 'file://audio.m4a', durationMs: 12000 },
    },
    mediaMode: 'photo_voiceover',
  }).kind === 'photo_audio',
  'photo+audio kind',
);
assert(
  resolveSkywriteMediaPreviewKind(
    {
      photo: null,
      video: { uri: 'file://clip.mp4', thumbnailUri: 'file://thumb.jpg' },
      audio: { uri: 'file://vo.m4a' },
    },
    'video_voiceover',
  ) === 'video_audio',
  'video+voiceover kind',
);

console.log('skywriteMediaPreviewUtils.test.ts — OK');
