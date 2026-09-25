import { applyStewardshipEvidenceEvent } from '@/contributionStewardship/applyStewardshipEvidenceEvent';
import {
  computeInternalRoutingScore,
  stewardshipRoutingBoost,
} from '@/contributionStewardship/computeStewardshipState';
import { buildPrivateStewardshipRecognition } from '@/contributionStewardship/privateStewardshipRecognition';
import { createContributionStewardshipStore } from '@/contributionStewardship/stewardshipStore';
import { STEWARDSHIP_EXCLUDED_SIGNALS } from '@/contributionStewardship/stewardshipEvidenceWeights';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

function testImpactStrongerThanHelpful() {
  const store = createContributionStewardshipStore();
  applyStewardshipEvidenceEvent(store, {
    contributorUserId: 'u1',
    skyAreaId: 'career',
    contributionId: 'c1',
    evidenceType: 'helpful',
    sourceId: 's1',
    occurredAt: 1,
  });
  const helpfulScore = computeInternalRoutingScore(
    store.listEvidenceForArea('u1', 'career'),
  );

  const store2 = createContributionStewardshipStore();
  applyStewardshipEvidenceEvent(store2, {
    contributorUserId: 'u1',
    skyAreaId: 'career',
    contributionId: 'c2',
    evidenceType: 'impact_confirmed',
    sourceId: 's2',
    occurredAt: 1,
  });
  const impactScore = computeInternalRoutingScore(
    store2.listEvidenceForArea('u1', 'career'),
  );
  assert(impactScore > helpfulScore, 'impact > helpful');
}

function testDedupe() {
  const store = createContributionStewardshipStore();
  const event = {
    contributorUserId: 'u1',
    skyAreaId: 'career',
    contributionId: 'c1',
    evidenceType: 'saved' as const,
    sourceId: 's1',
    occurredAt: 1,
  };
  assert(Boolean(applyStewardshipEvidenceEvent(store, event).evidence), 'first');
  assert(applyStewardshipEvidenceEvent(store, event).evidence === null, 'dedupe');
}

function testNewcomerNeutral() {
  const store = createContributionStewardshipStore();
  const state = applyStewardshipEvidenceEvent(store, {
    contributorUserId: 'new-user',
    skyAreaId: 'relationships',
    contributionId: 'c0',
    evidenceType: 'saved',
    sourceId: 's0',
    occurredAt: 1,
  }).state;
  assert(state?.routingTrustBand === 'new', 'new contributor neutral band');
  assert(stewardshipRoutingBoost(state!) <= 0.1, 'low boost for new');
}

function testPrivateRecognition() {
  const store = createContributionStewardshipStore();
  applyStewardshipEvidenceEvent(store, {
    contributorUserId: 'u1',
    skyAreaId: 'career',
    contributionId: 'c1',
    evidenceType: 'applied',
    sourceId: 's1',
    occurredAt: 1,
  });
  applyStewardshipEvidenceEvent(store, {
    contributorUserId: 'u1',
    skyAreaId: 'career',
    contributionId: 'c2',
    evidenceType: 'impact_confirmed',
    sourceId: 's2',
    occurredAt: 2,
  });
  applyStewardshipEvidenceEvent(store, {
    contributorUserId: 'u1',
    skyAreaId: 'career',
    contributionId: 'c3',
    evidenceType: 'impact_confirmed',
    sourceId: 's3',
    occurredAt: 3,
  });
  const state = store.getAreaState('u1', 'career');
  assert(Boolean(state), 'state');
  const recognition = buildPrivateStewardshipRecognition(state!, ['s1', 's2']);
  assert(Boolean(recognition), 'private recognition');
  assert(!recognition!.message.includes('rank'), 'human wording');
}

function testExcludedSignalsDocumented() {
  assert(STEWARDSHIP_EXCLUDED_SIGNALS.includes('follower_count'), 'followers excluded');
  assert(STEWARDSHIP_EXCLUDED_SIGNALS.includes('likes'), 'likes excluded');
}

function run() {
  testImpactStrongerThanHelpful();
  testDedupe();
  testNewcomerNeutral();
  testPrivateRecognition();
  testExcludedSignalsDocumented();
  console.log('contributionStewardship.test.ts — OK');
}

run();
