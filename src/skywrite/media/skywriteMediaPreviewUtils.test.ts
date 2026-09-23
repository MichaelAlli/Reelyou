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
      audio: null,
    },
    'photo',
  ) === 'photo',
  'photo kind',
);
assert(
  pickSkywriteMediaSource({
    media: {
      photo: { uri: 'https://example.com/a.jpg' },
      audio: { uri: 'file://audio.m4a', durationMs: 12000 },
    },
    mediaMode: 'photo_voiceover',
  }).kind === 'photo_audio',
  'photo+audio kind',
);

console.log('skywriteMediaPreviewUtils.test.ts — OK');
