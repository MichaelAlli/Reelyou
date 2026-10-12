import assert from 'node:assert/strict';

import { createEmptySkywriteDraft } from '@/skywrite/draft';
import { publishSkywriteDraft } from '@/skywrite/publish/publishSkywriteDraft';
import {
  composerAllowsVoiceCapture,
  filterVisibleBetaSkywrites,
  isStandaloneAudioSkywrite,
  validateSkywriteDraftForBeta,
} from '@/skywrite/standaloneAudioSkywrite';
import type { SkywriteRecord } from '@/skywrite/types';

const photoVoice: SkywriteRecord = {
  id: 'pv-1',
  authorId: 'u1',
  text: '',
  textStyle: 'plain',
  mediaMode: 'photo_voiceover',
  visibility: 'public',
  mood: null,
  showingUp: null,
  userHashtags: [],
  animateToSky: true,
  allowAIContext: true,
  createdAt: new Date().toISOString(),
  media: {
    photo: { uri: 'https://example/photo.jpg' },
    video: null,
    audio: { uri: 'https://example/voice.m4a', durationMs: 4000 },
  },
};

const audioOnly: SkywriteRecord = {
  ...photoVoice,
  id: 'ao-1',
  mediaMode: 'voice',
  media: {
    photo: null,
    video: null,
    audio: { uri: 'https://example/alone.m4a', durationMs: 4000 },
  },
};

assert.equal(isStandaloneAudioSkywrite(photoVoice), false);
assert.equal(isStandaloneAudioSkywrite(audioOnly), true);
assert.equal(filterVisibleBetaSkywrites([photoVoice, audioOnly]).length, 1);

assert.equal(
  composerAllowsVoiceCapture({ hasPhoto: false, hasVideo: false, hasText: false }),
  false,
);
assert.equal(
  composerAllowsVoiceCapture({ hasPhoto: true, hasVideo: false, hasText: false }),
  true,
);

const draft = createEmptySkywriteDraft();
draft.media.audio = { uri: 'file://voice.m4a', durationMs: 3000 };
assert.ok(validateSkywriteDraftForBeta(draft));

void (async () => {
  const blocked = await publishSkywriteDraft(draft, async (record) => record, 'u1');
  assert.equal(blocked.ok, false);
  if (!blocked.ok) {
    assert.match(blocked.errorMessage, /Beta/i);
  }
  console.log('standaloneAudioSkywrite.test.ts — OK');
})();
