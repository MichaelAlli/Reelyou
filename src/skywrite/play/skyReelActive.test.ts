import assert from 'node:assert/strict';

import {
  formatSkyReelAgeLabel,
  isSkyReelActive,
  resolveSkyReelAppearanceStartMs,
} from '@/skywrite/play/skyReelActive';
import { PLAY_SKY_SEQUENCE_WINDOW_MS } from '@/skywrite/play/playSkySequenceEligibility';

const start = Date.parse('2026-10-01T12:00:00.000Z');
const post = {
  id: 'sw-1',
  createdAt: new Date(start).toISOString(),
  publishedAtMs: start,
  skyreelActiveUntilMs: start + PLAY_SKY_SEQUENCE_WINDOW_MS,
};

assert.equal(formatSkyReelAgeLabel(start, start + 30_000), 'now');
assert.equal(formatSkyReelAgeLabel(start, start + 57 * 60_000), '57m');
assert.equal(formatSkyReelAgeLabel(start, start + 20 * 60 * 60_000), '20h');
assert.equal(isSkyReelActive(post, {}, start + PLAY_SKY_SEQUENCE_WINDOW_MS - 1), true);
assert.equal(isSkyReelActive(post, {}, start + PLAY_SKY_SEQUENCE_WINDOW_MS), false);
assert.equal(resolveSkyReelAppearanceStartMs(post, {}), start);

console.log('skyReelActive.test.ts — OK');
