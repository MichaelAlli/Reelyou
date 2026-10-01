import assert from 'node:assert/strict';

import {
  inferMediaModeFromParts,
  isAttachedVoiceoverRecord,
  isStandaloneAudioRecord,
} from '@/skywrite/voiceoverStepUtils';

assert.equal(
  inferMediaModeFromParts({ text: 'Hi', hasPhoto: false, hasVideo: false, hasAudio: true }),
  'text_voiceover',
);
assert.equal(
  inferMediaModeFromParts({ text: '', hasPhoto: false, hasVideo: false, hasAudio: true }),
  'voice',
);

assert.ok(
  isAttachedVoiceoverRecord({
    text: 'Story',
    mediaMode: 'text_voiceover',
    media: { photo: null, video: null, audio: { uri: 'file://a.m4a' } },
  }),
);
assert.ok(
  isStandaloneAudioRecord({
    text: '',
    mediaMode: 'voice',
    media: { photo: null, video: null, audio: { uri: 'file://a.m4a' } },
  }),
);

console.log('voiceoverStepUtils.test.ts — OK');
