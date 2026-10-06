import assert from 'node:assert/strict';

import { playSkyActiveUntilFromTimestamp } from '@/skywrite/play/playSkySequenceEligibility';
import type { PlaySkySequenceRegistry } from '@/skywrite/play/playSkySequenceEligibility';
import type { SkywritePlayStep } from '@/skywrite/play/skywritePlayTypes';
import {
  countEligibleSkywritePostsInSteps,
  findFirstEligibleStepIndex,
  findNextEligibleStepIndexAfter,
  isStepSkyReelAppearanceActive,
  resolveMidPlaybackExpiryTransition,
} from '@/skywrite/play/skywriteGuidedPlayExpiry';

const startMs = Date.parse('2026-10-01T12:00:00.000Z');
const activeUntil = playSkyActiveUntilFromTimestamp(startMs);
const expiredNow = activeUntil + 60_000;
const activeNow = startMs + 60_000;

function step(id: string, kind: SkywritePlayStep['kind'] = 'text'): SkywritePlayStep {
  return { stepId: kind, skywriteId: id, kind };
}

function registryFor(ids: string[], expired: boolean): PlaySkySequenceRegistry {
  const out: PlaySkySequenceRegistry = {};
  for (const id of ids) {
    out[id] = {
      skywriteId: id,
      ownerId: 'owner',
      publishedAt: new Date(startMs).toISOString(),
      appearancePublishedAtMs: startMs,
      activeUntilMs: activeUntil,
    };
  }
  void expired;
  return out;
}

const stepsThree = [step('a'), step('b'), step('c')];
const regAllExpired = registryFor(['a', 'b', 'c'], true);

assert.equal(countEligibleSkywritePostsInSteps(stepsThree, regAllExpired, expiredNow), 0);
assert.equal(findFirstEligibleStepIndex(stepsThree, regAllExpired, expiredNow), null);
assert.equal(findNextEligibleStepIndexAfter(stepsThree, 0, regAllExpired, expiredNow), null);
assert.equal(findNextEligibleStepIndexAfter(stepsThree, 2, regAllExpired, expiredNow), null);

const regLastExpired: PlaySkySequenceRegistry = {
  ...registryFor(['a', 'b'], false),
  c: {
    skywriteId: 'c',
    ownerId: 'owner',
    publishedAt: new Date(startMs).toISOString(),
    appearancePublishedAtMs: startMs,
    activeUntilMs: activeUntil,
  },
};
assert.equal(isStepSkyReelAppearanceActive(step('a'), regLastExpired, activeNow), true);
assert.equal(isStepSkyReelAppearanceActive(step('c'), regLastExpired, expiredNow), false);
assert.equal(findNextEligibleStepIndexAfter(stepsThree, 1, regLastExpired, expiredNow), null);

const regMidActive: PlaySkySequenceRegistry = {
  a: {
    skywriteId: 'a',
    ownerId: 'owner',
    publishedAt: new Date(startMs).toISOString(),
    appearancePublishedAtMs: startMs,
    activeUntilMs: activeUntil,
  },
  b: {
    skywriteId: 'b',
    ownerId: 'owner',
    publishedAt: new Date(startMs).toISOString(),
    appearancePublishedAtMs: startMs,
    activeUntilMs: playSkyActiveUntilFromTimestamp(startMs + 86400000),
  },
};
assert.equal(findFirstEligibleStepIndex(stepsThree, regMidActive, expiredNow), 1);
assert.equal(findNextEligibleStepIndexAfter(stepsThree, 0, regMidActive, expiredNow), 1);

const multiStep = [step('a', 'text'), step('a', 'photo'), step('b')];
assert.equal(findNextEligibleStepIndexAfter(multiStep, 0, regMidActive, expiredNow), 2);

assert.deepEqual(
  resolveMidPlaybackExpiryTransition(stepsThree, 0, regAllExpired, null, false, expiredNow),
  { kind: 'none' },
);
assert.deepEqual(
  resolveMidPlaybackExpiryTransition(stepsThree, 0, regMidActive, true, false, expiredNow),
  { kind: 'jump', toIndex: 1 },
);
assert.deepEqual(
  resolveMidPlaybackExpiryTransition(stepsThree, 2, regLastExpired, true, false, expiredNow),
  { kind: 'exit' },
);

console.log('skywriteGuidedPlayExpiry.test.ts — OK');
