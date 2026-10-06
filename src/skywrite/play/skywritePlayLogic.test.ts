import assert from 'node:assert/strict';

import {
  defaultStepsForSkywrite,
  reorderIds,
  resolvePrimaryMediaStepIndex,
  resolveStepsForSkywrite,
} from '@/skywrite/play/skywritePlayLogic';
import type { SkywriteRecord } from '@/skywrite/types';

const sample: SkywriteRecord = {
  id: 'sw-play-test',
  text: 'Hello sky',
  textStyle: 'classic',
  media: {
    photo: { uri: 'file://photo.jpg' },
    video: null,
    audio: { uri: 'file://audio.m4a', durationMs: 3000 },
  },
  mediaMode: 'photo_voiceover',
  visibility: 'private',
  mood: null,
  showingUp: null,
  userHashtags: [],
  animateToSky: false,
  allowAIContext: true,
  createdAt: new Date().toISOString(),
};

const photoVoiceSteps = defaultStepsForSkywrite(sample);
assert(photoVoiceSteps.length === 2, 'photo voiceover: text + photo (no separate audio step)');
assert(photoVoiceSteps.some((step) => step.kind === 'photo'), 'includes photo step');
assert(
  resolveStepsForSkywrite(sample, { orderedStepIds: ['text'], excludedStepIds: [] })
    .map((step) => step.stepId)
    .join(',') === 'text,photo',
  'custom step order preserves remaining steps',
);

const textVoiceover: SkywriteRecord = {
  ...sample,
  id: 'sw-text-vo',
  media: {
    photo: null,
    video: null,
    audio: { uri: 'file://narration.m4a', durationMs: 12000 },
  },
  mediaMode: 'text_voiceover',
};
const textVoSteps = defaultStepsForSkywrite(textVoiceover);
assert(textVoSteps.length === 1 && textVoSteps[0]?.kind === 'text', 'text voiceover: single text step');

const voiceOnly: SkywriteRecord = {
  ...sample,
  id: 'sw-voice-only',
  text: '',
  media: {
    photo: null,
    video: null,
    audio: { uri: 'file://solo.m4a', durationMs: 5000 },
  },
  mediaMode: 'voice',
};
assert(
  !defaultStepsForSkywrite(voiceOnly).some((step) => step.kind === 'audio'),
  'standalone audio step disabled for beta',
);
assert(reorderIds(['a', 'b', 'c'], 'b', 'up').join('') === 'bac', 'reorder up');

const videoVoiceover: SkywriteRecord = {
  ...sample,
  id: 'sw-video-vo',
  media: {
    photo: null,
    video: { uri: 'file://clip.mp4', durationMs: 8000 },
    audio: { uri: 'file://vo.m4a', durationMs: 7000 },
  },
  mediaMode: 'video_voiceover',
};
const videoSteps = defaultStepsForSkywrite(videoVoiceover);
assert(videoSteps.length === 2, 'video voiceover: text + video (no separate audio step)');
assert(videoSteps.some((step) => step.kind === 'video'), 'includes video step');
assert(resolvePrimaryMediaStepIndex(videoVoiceover) === 1, 'primary step prefers video');

console.log('skywritePlayLogic.test.ts — OK');
