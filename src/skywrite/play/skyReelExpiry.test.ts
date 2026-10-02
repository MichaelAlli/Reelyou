import assert from 'node:assert/strict';

import {
  formatSkyReelRemainingLabel,
  isSkyReelAppearanceActive,
  resolveSkyReelActiveUntilMs,
} from '@/skywrite/play/skyReelExpiry';
import { playSkyActiveUntilFromTimestamp } from '@/skywrite/play/playSkySequenceEligibility';

const createdAt = '2026-10-01T12:00:00.000Z';
const startMs = Date.parse(createdAt);
const until = playSkyActiveUntilFromTimestamp(startMs);

assert.equal(
  resolveSkyReelActiveUntilMs('x', { x: { skywriteId: 'x', ownerId: 'o', publishedAt: createdAt, activeUntilMs: until } }, createdAt),
  until,
);

assert.equal(isSkyReelAppearanceActive(until, until - 1), true);
assert.equal(isSkyReelAppearanceActive(until, until + 1), false);
assert.equal(resolveSkyReelActiveUntilMs('missing', {}, createdAt), null);
assert.equal(formatSkyReelRemainingLabel(90 * 60_000), '1h 30m left');
assert.equal(formatSkyReelRemainingLabel(45 * 60_000), '45m left');

console.log('skyReelExpiry.test.ts — OK');
