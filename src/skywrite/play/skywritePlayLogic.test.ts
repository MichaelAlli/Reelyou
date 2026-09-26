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

console.log('skywritePlayLogic.test.ts — OK');
