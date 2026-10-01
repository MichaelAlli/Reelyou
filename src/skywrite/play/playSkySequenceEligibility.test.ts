import assert from 'node:assert/strict';

import {
  PLAY_SKY_SEQUENCE_WINDOW_MS,
  repostIntoPlaySkySequence,
  registerPlaySkyPublication,
  isPlaySkySequenceEligible,
} from '@/skywrite/play/playSkySequenceEligibility';

const now = 1_700_000_000_000;
let registry = registerPlaySkyPublication({}, {
  id: 'sw-1',
  authorId: 'user-1',
  createdAt: new Date(now - PLAY_SKY_SEQUENCE_WINDOW_MS - 1000).toISOString(),
});
assert.equal(isPlaySkySequenceEligible(registry['sw-1'], now), false);

registry = repostIntoPlaySkySequence(registry, 'sw-1', now);
assert.equal(isPlaySkySequenceEligible(registry['sw-1'], now), true);
assert.equal(isPlaySkySequenceEligible(registry['sw-1'], now + PLAY_SKY_SEQUENCE_WINDOW_MS + 1), false);

const refreshed = repostIntoPlaySkySequence(registry, 'sw-1', now + 5000);
assert.ok(refreshed['sw-1']!.activeUntilMs > registry['sw-1']!.activeUntilMs);

console.log('playSkySequenceEligibility tests ok');
