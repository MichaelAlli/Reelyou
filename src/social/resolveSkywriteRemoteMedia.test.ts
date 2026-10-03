import assert from 'node:assert/strict';

import { buildRemoteAssetPlaceholderUri } from '@/social/sharedMediaConstants';
import { resolveSkywriteMedia, resolveSkywriteRecord } from '@/social/resolveSkywriteRemoteMedia';
import type { SkywriteRecord } from '@/skywrite/types';

const baseRecord: SkywriteRecord = {
  id: 'sw-test',
  authorId: 'user-a',
  text: 'Hello',
  textStyle: 'plain',
  media: {
    photo: null,
    video: {
      uri: buildRemoteAssetPlaceholderUri('asset-video-1'),
      remoteAssetId: 'asset-video-1',
      durationMs: 5000,
    },
    audio: {
      uri: buildRemoteAssetPlaceholderUri('asset-audio-1'),
      remoteAssetId: 'asset-audio-1',
      durationMs: 4000,
    },
  },
  mediaMode: 'video_voiceover',
  visibility: 'orbit',
  mood: null,
  showingUp: null,
  userHashtags: [],
  animateToSky: true,
  allowAIContext: true,
  createdAt: new Date().toISOString(),
};

void (async () => {
  const resolved = await resolveSkywriteRecord(baseRecord);
  assert.equal(resolved.record.id, 'sw-test');
  assert(typeof resolved.allOk === 'boolean', 'returns allOk without throwing');

  const textOnly = await resolveSkywriteMedia({
    photo: null,
    video: null,
    audio: null,
  });
  assert.equal(textOnly.allOk, true);

  console.log('resolveSkywriteRemoteMedia.test.ts — OK');
})();
