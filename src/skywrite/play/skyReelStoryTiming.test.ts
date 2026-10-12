import assert from 'node:assert/strict';

import {
  SKYREEL_STORY_PHOTO_DWELL_MS,
  resolveSkyReelStoryStillDwellMs,
} from '@/skywrite/play/skyReelStoryTiming';

assert.equal(resolveSkyReelStoryStillDwellMs('photo'), SKYREEL_STORY_PHOTO_DWELL_MS);
assert.equal(resolveSkyReelStoryStillDwellMs('photo'), 5000);
assert.equal(resolveSkyReelStoryStillDwellMs('text', ''), 5000);
assert.equal(resolveSkyReelStoryStillDwellMs('text', 'Hi'), 4000);
assert.equal(resolveSkyReelStoryStillDwellMs('text', 'x'.repeat(300)), 12000);

console.log('skyReelStoryTiming.test.ts — OK');
