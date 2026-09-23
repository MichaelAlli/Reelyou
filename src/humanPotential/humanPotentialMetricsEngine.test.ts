import {
  addApplicationEvidence,
  confirmImpactEvent,
  createRippleEvent,
  deriveLivesImpacted,
  dedupeUniqueImpactRelationships,
} from '@/humanPotential/humanPotentialMetricsEngine';
import { EMPTY_HUMAN_POTENTIAL_METRICS_STATE } from '@/humanPotential/humanPotentialMetricsState';
import type { ThreadReflectionRecord } from '@/skywrite/savedThreads/savedThreadTypes';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

function reflection(id: string, body: string): ThreadReflectionRecord {
  return {
    reflectionId: id,
    savedThreadId: 'st-jordan-sw-1',
    authorUserId: 'orbit-jordan',
    body,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    deletedAt: null,
    visibility: 'private',
    momentKind: 'freeform',
  };
}

function testCase1SingleImpact() {
  let state = EMPTY_HUMAN_POTENTIAL_METRICS_STATE;
  const r = reflection('refl-1', 'This helped me prepare.');
  const first = confirmImpactEvent({
    state,
    contributorUserId: 'user-michael',
    impactedUserId: 'orbit-jordan',
    reflection: r,
    savedThreadId: 'st-jordan-sw-1',
    sourceSkywriteId: 'sw-1',
  });
  state = first.state;
  assert(state.impactEvents.length === 1, 'case1 impact events');
  assert(deriveLivesImpacted('user-michael', state) === 1, 'case1 lives impacted');
}

function testCase2ThreeImpactsSamePerson() {
  let state = EMPTY_HUMAN_POTENTIAL_METRICS_STATE;
  for (const id of ['refl-a', 'refl-b', 'refl-c']) {
    const result = confirmImpactEvent({
      state,
      contributorUserId: 'user-michael',
      impactedUserId: 'orbit-jordan',
      reflection: reflection(id, 'Meaningful help again.'),
      savedThreadId: 'st-jordan-sw-1',
      sourceSkywriteId: 'sw-1',
    });
    state = result.state;
  }
  assert(state.impactEvents.length === 3, 'case2 three events');
  assert(deriveLivesImpacted('user-michael', state) === 1, 'case2 one unique life');
}

function testCase3TwoDistinctPeople() {
  let state = EMPTY_HUMAN_POTENTIAL_METRICS_STATE;
  state = confirmImpactEvent({
    state,
    contributorUserId: 'user-michael',
    impactedUserId: 'orbit-jordan',
    reflection: reflection('refl-j', 'Helped Jordan'),
    savedThreadId: 'st-j',
    sourceSkywriteId: 'sw-j',
  }).state;
  state = confirmImpactEvent({
    state,
    contributorUserId: 'user-michael',
    impactedUserId: 'orbit-alex',
    reflection: reflection('refl-a', 'Helped Alex'),
    savedThreadId: 'st-a',
    sourceSkywriteId: 'sw-a',
  }).state;
  assert(deriveLivesImpacted('user-michael', state) === 2, 'case3 two lives');
}

function testCase5ApplicationNoImpact() {
  let state = EMPTY_HUMAN_POTENTIAL_METRICS_STATE;
  state = addApplicationEvidence({
    state,
    userId: 'orbit-jordan',
    reflection: reflection('refl-app', 'I used this before my interview.'),
    savedThreadId: 'st-j',
    sourceSkywriteId: 'sw-j',
  });
  assert(state.applicationEvidence.length === 1, 'application saved');
  assert(deriveLivesImpacted('user-michael', state) === 0, 'lives unchanged');
}

function testCase7DuplicateProcessing() {
  let state = EMPTY_HUMAN_POTENTIAL_METRICS_STATE;
  const r = reflection('refl-dup', 'Same moment');
  const first = confirmImpactEvent({
    state,
    contributorUserId: 'user-michael',
    impactedUserId: 'orbit-jordan',
    reflection: r,
    savedThreadId: 'st-j',
    sourceSkywriteId: 'sw-j',
  });
  const second = confirmImpactEvent({
    state: first.state,
    contributorUserId: 'user-michael',
    impactedUserId: 'orbit-jordan',
    reflection: r,
    savedThreadId: 'st-j',
    sourceSkywriteId: 'sw-j',
  });
  assert(second.state.impactEvents.length === 1, 'no duplicate impact event');
  assert(deriveLivesImpacted('user-michael', second.state) === 1, 'no inflation');
}

function testRippleNotDirectLife() {
  let state = EMPTY_HUMAN_POTENTIAL_METRICS_STATE;
  const impact = confirmImpactEvent({
    state,
    contributorUserId: 'user-michael',
    impactedUserId: 'orbit-jordan',
    reflection: reflection('refl-i', 'Direct help'),
    savedThreadId: 'st-j',
    sourceSkywriteId: 'sw-j',
  });
  state = createRippleEvent({
    state: impact.state,
    originatingContributorUserId: 'user-michael',
    directImpactedUserId: 'orbit-jordan',
    downstreamUserId: 'orbit-alex',
    parentImpactEventId: impact.impactEvent.impactEventId,
    userConfirmed: true,
  });
  assert(deriveLivesImpacted('user-michael', state) === 1, 'ripple does not add direct life');
  assert(state.rippleEvents.length === 1, 'ripple stored');
}

function testDedupeRelationships() {
  const merged = dedupeUniqueImpactRelationships({
    ...EMPTY_HUMAN_POTENTIAL_METRICS_STATE,
    uniqueImpactRelationships: [
      {
        impactRelationshipId: 'uir-user-michael-orbit-jordan',
        contributorUserId: 'user-michael',
        impactedUserId: 'orbit-jordan',
        firstImpactEventId: 'a',
        firstConfirmedAt: 1,
        latestImpactEventId: 'a',
        latestConfirmedAt: 1,
        impactEventCount: 1,
        active: true,
        createdAt: 1,
        updatedAt: 1,
      },
      {
        impactRelationshipId: 'uir-dup',
        contributorUserId: 'user-michael',
        impactedUserId: 'orbit-jordan',
        firstImpactEventId: 'b',
        firstConfirmedAt: 2,
        latestImpactEventId: 'b',
        latestConfirmedAt: 2,
        impactEventCount: 1,
        active: true,
        createdAt: 2,
        updatedAt: 2,
      },
    ],
  });
  assert(merged.uniqueImpactRelationships.length === 1, 'deduped pair');
  assert(deriveLivesImpacted('user-michael', merged) === 1, 'single life after dedupe');
}

testCase1SingleImpact();
testCase2ThreeImpactsSamePerson();
testCase3TwoDistinctPeople();
testCase5ApplicationNoImpact();
testCase7DuplicateProcessing();
testRippleNotDirectLife();
testDedupeRelationships();
console.log('humanPotentialMetricsEngine.test.ts — OK');
