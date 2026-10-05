import assert from 'node:assert/strict';

import { safeStoryFillRatio } from '@/skywrite/play/skywriteStoryProgress';

assert.equal(safeStoryFillRatio(2500, 5000), 0.5);
assert.equal(safeStoryFillRatio(NaN, 5000), 0);
assert.equal(safeStoryFillRatio(100, 0), 0);
assert.equal(safeStoryFillRatio(9000, 5000), 1);

console.log('skywriteStoryProgress.test.ts — OK');
