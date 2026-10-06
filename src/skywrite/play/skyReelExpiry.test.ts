import assert from 'node:assert/strict';

import {
  formatSkyReelHourLabel,
  formatSkyReelRemainingLabel,
  isSkyReelAppearanceActive,
  resolveSkyReelActiveUntilMs,
  resolveSkyReelAppearancePublishedAtMs,
  resolveSkyReelDisplayHour,
} from '@/skywrite/play/skyReelExpiry';
import { playSkyActiveUntilFromTimestamp } from '@/skywrite/play/playSkySequenceEligibility';

const createdAt = '2026-10-01T12:00:00.000Z';
const startMs = Date.parse(createdAt);
const until = playSkyActiveUntilFromTimestamp(startMs);

assert.equal(
  resolveSkyReelActiveUntilMs(
    'x',
    {
      x: {
        skywriteId: 'x',
        ownerId: 'o',
        publishedAt: createdAt,
        appearancePublishedAtMs: startMs,
        activeUntilMs: until,
      },
    },
    createdAt,
  ),
  until,
);

assert.equal(isSkyReelAppearanceActive(until, until - 1), true);
assert.equal(isSkyReelAppearanceActive(until, until + 1), false);
assert.equal(resolveSkyReelActiveUntilMs('missing', {}, createdAt), null);

assert.equal(
  resolveSkyReelAppearancePublishedAtMs('x', {
    x: {
      skywriteId: 'x',
      ownerId: 'o',
      publishedAt: createdAt,
      appearancePublishedAtMs: startMs,
      activeUntilMs: until,
      repostedAtMs: startMs + 3_600_000,
    },
  }),
  startMs + 3_600_000,
);

assert.equal(resolveSkyReelDisplayHour(startMs, until, startMs + 30 * 60_000), 1);
assert.equal(resolveSkyReelDisplayHour(startMs, until, startMs + 90 * 60_000), 2);
assert.equal(resolveSkyReelDisplayHour(startMs, until, until - 1), 24);
assert.equal(resolveSkyReelDisplayHour(startMs, until, until), null);
assert.equal(formatSkyReelHourLabel(1), 'Hour 1 of 24.');
assert.equal(formatSkyReelHourLabel(24), 'Hour 24 of 24.');
assert.equal(formatSkyReelRemainingLabel(45 * 60_000), '45m left');

console.log('skyReelExpiry.test.ts — OK');
