import assert from 'node:assert/strict';

import {
  defaultStepsForSkywrite,
  reorderIds,
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

assert(defaultStepsForSkywrite(sample).length === 3, 'text photo audio steps');
assert(
  resolveStepsForSkywrite(sample, { orderedStepIds: ['audio', 'text'], excludedStepIds: [] })
    .map((step) => step.stepId)
    .join(',') === 'audio,text,photo',
  'custom step order preserves remaining steps',
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

console.log('skywritePlayLogic.test.ts — OK');
