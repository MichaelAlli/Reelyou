import assert from 'node:assert/strict';

import {
  afterFirstPostLeftRestart,
  nextFirstPostLeftTapState,
  resetFirstPostLeftTapState,
} from '@/skywrite/play/skyreelFirstPostEdgeNavigation';

assert.equal(nextFirstPostLeftTapState(resetFirstPostLeftTapState()), 'restart');
assert.equal(nextFirstPostLeftTapState(afterFirstPostLeftRestart()), 'exit');
assert.equal(nextFirstPostLeftTapState(resetFirstPostLeftTapState()), 'restart');

console.log('skyreelFirstPostEdgeNavigation.test.ts — OK');
