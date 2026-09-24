import { EMPTY_HUMAN_POTENTIAL_METRICS_STATE } from '@/humanPotential/humanPotentialMetricsState';
import {
  confirmImpactEvent,
  createRippleEvent,
  deriveLivesImpacted,
} from '@/humanPotential/humanPotentialMetricsEngine';
import { buildSkywriteLifecycleView } from '@/skywrite/lifecycle/skywriteContentLifecycle';
import { EMPTY_SKYWRITE_LIBRARY_STATE } from '@/skywrite/library/skywriteLibraryTypes';
import type { ThreadReflectionRecord } from '@/skywrite/savedThreads/savedThreadTypes';
import { buildLegacyMoments } from '@/legacy/buildLegacyMoments';
import { buildReelSequence } from '@/legacy/buildReelSequence';
import { EMPTY_LEGACY_USER_STATE } from '@/legacy/legacyMomentTypes';
import { archiveCreatesLegacyMoment } from '@/skywrite/lifecycle/skywriteContentLifecycle';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

function reflection(id: string, body: string): ThreadReflectionRecord {
  return {
    reflectionId: id,
    savedThreadId: 'st-1',
    authorUserId: 'orbit-jordan',
    body,
    createdAt: 1000,
    updatedAt: 1000,
    deletedAt: null,
    visibility: 'private',
    momentKind: 'freeform',
  };
}

const lifecycle = buildSkywriteLifecycleView(EMPTY_SKYWRITE_LIBRARY_STATE);
const directory = {
  'user-michael': 'Michael Alli',
  'orbit-jordan': 'Jordan Lee',
  'orbit-alex': 'Alex Kim',
};

assert(archiveCreatesLegacyMoment() === false, 'archive does not create legacy');

let metrics = EMPTY_HUMAN_POTENTIAL_METRICS_STATE;
for (const id of ['r1', 'r2', 'r3']) {
  metrics = confirmImpactEvent({
    state: metrics,
    contributorUserId: 'user-michael',
    impactedUserId: 'orbit-jordan',
    reflection: reflection(id, 'Meaningful help again.'),
    savedThreadId: 'st-j',
    sourceSkywriteId: 'sw-j',
  }).state;
}
assert(metrics.impactEvents.length === 3, 'three impact events preserved');
assert(deriveLivesImpacted('user-michael', metrics) === 1, 'unique life unchanged');

const moments = buildLegacyMoments({
  ownerUserId: 'user-michael',
  metrics,
  contributions: [],
  reflections: [],
  lifecycle,
  skywrites: [],
  blockedUserIds: [],
  userState: EMPTY_LEGACY_USER_STATE,
  userDirectory: directory,
});

const impactMoments = moments.filter((entry) => entry.eventType === 'impact');
assert(impactMoments.length === 3, 'legacy preserves impact depth');

const empty = buildLegacyMoments({
  ownerUserId: 'user-michael',
  metrics: EMPTY_HUMAN_POTENTIAL_METRICS_STATE,
  contributions: [],
  reflections: [],
  lifecycle,
  skywrites: [],
  blockedUserIds: [],
  userState: EMPTY_LEGACY_USER_STATE,
  userDirectory: directory,
});
assert(empty.length === 0, 'no moments without confirmed evidence');

metrics = createRippleEvent({
  state: metrics,
  originatingContributorUserId: 'user-michael',
  directImpactedUserId: 'orbit-jordan',
  downstreamUserId: 'orbit-alex',
  parentImpactEventId: metrics.impactEvents[0]!.impactEventId,
  userConfirmed: true,
  now: 5000,
});
const withRipple = buildLegacyMoments({
  ownerUserId: 'user-michael',
  metrics,
  contributions: [],
  reflections: [],
  lifecycle,
  skywrites: [],
  blockedUserIds: [],
  userState: EMPTY_LEGACY_USER_STATE,
  userDirectory: directory,
});
assert(withRipple.some((entry) => entry.eventType === 'ripple'), 'ripple moment exists');
assert(
  deriveLivesImpacted('user-michael', metrics) === 1,
  'ripple does not add direct life impacted',
);

const reel = buildReelSequence({
  ownerUserId: 'user-michael',
  moments: withRipple,
});
assert(reel.momentIds.length > 0, 'reel sequence references moment ids');
assert(reel.periodStart != null && reel.periodEnd != null, 'period bounds for future cadence');

console.log('buildLegacyMoments.test.ts — OK');
