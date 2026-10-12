import assert from 'node:assert/strict';

import {
  getSkywriteStarColor,
  resolveSkywriteStarMeaning,
  SkywriteStarSemanticColors,
} from '@/mySky/getSkywriteStarColor';
import type { SkywriteRecord } from '@/skywrite/types';

const base: SkywriteRecord = {
  id: 's1',
  authorId: 'u1',
  text: '',
  textStyle: 'plain',
  mediaMode: 'photo',
  visibility: 'public',
  mood: null,
  showingUp: null,
  userHashtags: [],
  animateToSky: true,
  allowAIContext: true,
  createdAt: new Date().toISOString(),
  media: { photo: null, video: null, audio: null },
};

assert.equal(
  resolveSkywriteStarMeaning({
    ...base,
    text: 'caption',
    media: { ...base.media, photo: { uri: 'https://x/p.jpg' } },
  }),
  'memory',
);
assert.equal(
  getSkywriteStarColor({
    ...base,
    media: {
      ...base.media,
      photo: { uri: 'https://x/p.jpg' },
      audio: { uri: 'https://x/a.m4a' },
    },
  }),
  SkywriteStarSemanticColors.memory,
);
assert.equal(
  getSkywriteStarColor({
    ...base,
    media: { ...base.media, video: { uri: 'https://x/v.mp4' }, audio: { uri: 'https://x/a.m4a' } },
  }),
  SkywriteStarSemanticColors.motion,
);
assert.equal(
  getSkywriteStarColor({ ...base, text: 'hello', mediaMode: 'text' }),
  SkywriteStarSemanticColors.reflection,
);
assert.equal(
  getSkywriteStarColor({ ...base, text: 'hello', mediaMode: 'photo' }),
  SkywriteStarSemanticColors.memory,
);
assert.equal(
  getSkywriteStarColor({
    ...base,
    mediaMode: 'photo',
    media: { ...base.media, photo: { remoteAssetId: 'asset-photo-1' } },
  }),
  SkywriteStarSemanticColors.memory,
);
assert.equal(
  getSkywriteStarColor({
    ...base,
    mediaMode: 'video',
    media: { ...base.media, video: { remoteAssetId: 'asset-video-1' } },
  }),
  SkywriteStarSemanticColors.motion,
);

console.log('getSkywriteStarColor.test.ts — OK');
