import assert from 'node:assert/strict';

import {
  clampSeekTargetMs,
  finiteMs,
  msToMediaElementSeconds,
  resolveCombinedTimelineMs,
  sanitizeDurationMs,
} from '@/skywrite/media/skywritePlaybackTime';

assert.equal(finiteMs(NaN), null);
assert.equal(finiteMs(Infinity), null);
assert.equal(finiteMs(undefined), null);
assert.equal(finiteMs(1200), 1200);

assert.equal(sanitizeDurationMs(0, NaN, 5000, 3000), 5000);
assert.equal(resolveCombinedTimelineMs(22000, 18000), 22000);

assert.equal(clampSeekTargetMs(NaN, 10000), null);
assert.equal(clampSeekTargetMs(15000, 22000), 15000);
assert.equal(clampSeekTargetMs(25000, 22000), 22000);
assert.equal(clampSeekTargetMs(-100, 22000), 0);
assert.equal(clampSeekTargetMs(8000, 0), 8000);

assert.equal(msToMediaElementSeconds(NaN), null);
assert.equal(msToMediaElementSeconds(1500), 1.5);

console.log('skywritePlaybackTime.test.ts — OK');
