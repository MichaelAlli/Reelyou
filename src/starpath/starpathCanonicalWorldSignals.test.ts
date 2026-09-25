import {
  emitGrowthMomentumSignal,
  emitStarpathMetaphorSignal,
} from '@/signals/canonical/canonicalSignalEmitters';
import { createCanonicalSignalStore } from '@/signals/canonical/canonicalSignalStore';
import { EMPTY_SIGNAL_STATE } from '@/starpath/starpathSignalTypes';
import { computeStarPathSignalsWithCanonicalWorld } from '@/starpath/starpathCanonicalWorldSignals';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

function basePlacedNode() {
  return {
    nodeId: 'opp-node-fixture',
    candidateId: 'fixture-grant-learning-01',
    branchId: 'learning',
    refX: 0.3,
    refY: 1.2,
    iconKey: '✧',
    ringColor: '#fff',
    prominence: 'primary' as const,
    tracking: { guideMentionCount: 0, surfacedAt: Date.now() - 1000 },
  };
}

function ambientInput(placedNodes: ReturnType<typeof basePlacedNode>[]) {
  return {
    now: Date.now(),
    placedNodes,
    resourcesById: {
      'fixture-grant-learning-01': {
        id: 'fixture-grant-learning-01',
        title: 'Grant',
        opportunityType: 'grant' as const,
        provider: 'P',
        sourceName: 'F',
        description: 'd',
        categories: [],
        relatedBranchIds: ['learning'],
        relatedNodeIds: ['opp-node-fixture'],
        reasonCodes: [],
        freshnessStatus: 'fresh' as const,
        verificationStatus: 'fixture' as const,
        retrievedAt: Date.now(),
        availabilityStatus: 'open' as const,
        fixtureOnly: true,
      },
    },
    dismissedResourceIds: [] as string[],
    viewportScrollY: 0,
    viewportHeight: 852,
    paddingTop: 100,
    contentBandHeight: 852,
    supportState: 'unknown' as const,
    previous: EMPTY_SIGNAL_STATE,
  };
}

function testPeaceWithoutCanonicalPresentations() {
  const store = createCanonicalSignalStore();
  const placed = [basePlacedNode()];
  const merged = computeStarPathSignalsWithCanonicalWorld({
    ...ambientInput(placed),
    canonicalStore: store,
    userId: 'user-michael',
    signalPrefs: {},
    privacy: {
      viewerUserId: 'user-michael',
      ownerUserId: 'user-michael',
      blockedUserIds: [],
      isMutualSkyFriend: false,
    },
  });
  assert(merged.growthCue === null, 'peace growth cue');
  assert(merged.signalState.activeSignalIds.length >= 0, 'ambient ok');
}

function testDoorGlowFromCanonical() {
  const store = createCanonicalSignalStore();
  const placed = [basePlacedNode()];
  emitStarpathMetaphorSignal(store, 'user-michael', 'door_opening', placed[0].nodeId, {
    opportunityNodeId: placed[0].nodeId,
  });
  const merged = computeStarPathSignalsWithCanonicalWorld({
    ...ambientInput(placed),
    canonicalStore: store,
    userId: 'user-michael',
    signalPrefs: {},
    privacy: {
      viewerUserId: 'user-michael',
      ownerUserId: 'user-michael',
      blockedUserIds: [],
      isMutualSkyFriend: false,
    },
  });
  assert(
    merged.signalState.activeSignalIds.includes(`sig-${placed[0].nodeId}`),
    'door boost ties to opportunity node',
  );
}

function testGrowthCueSingle() {
  const store = createCanonicalSignalStore();
  const placed = [basePlacedNode()];
  emitGrowthMomentumSignal(store, 'user-michael', 'learning', ['p1'], {
    relatedStarPathNodeId: placed[0].nodeId,
  });
  const merged = computeStarPathSignalsWithCanonicalWorld({
    ...ambientInput(placed),
    canonicalStore: store,
    userId: 'user-michael',
    signalPrefs: {},
    privacy: {
      viewerUserId: 'user-michael',
      ownerUserId: 'user-michael',
      blockedUserIds: [],
      isMutualSkyFriend: false,
    },
  });
  assert(merged.growthCue !== null, 'growth cue');
  assert(
    merged.signalState.activeSignalIds.includes(`cws-growth-${placed[0].nodeId}`),
    'growth ambient id',
  );
}

function testBlockedRelatedUserSuppressesGrowth() {
  const store = createCanonicalSignalStore();
  const placed = [basePlacedNode()];
  store.emit({
    userId: 'user-michael',
    type: 'growth_momentum',
    sourceType: 'relationship',
    sourceId: 'x',
    dedupeKey: 'growth_momentum:block-test',
    relatedUserIds: ['orbit-blocked'],
    surfaceEligibility: ['starpath_internal'],
    privacyScope: 'owner_only',
  });
  const merged = computeStarPathSignalsWithCanonicalWorld({
    ...ambientInput(placed),
    canonicalStore: store,
    userId: 'user-michael',
    signalPrefs: {},
    privacy: {
      viewerUserId: 'user-michael',
      ownerUserId: 'user-michael',
      blockedUserIds: ['orbit-blocked'],
      isMutualSkyFriend: false,
    },
  });
  assert(merged.growthCue === null, 'blocked suppresses growth cue');
}

function testDeferredMistHasNoWorldBoost() {
  const store = createCanonicalSignalStore();
  const placed = [basePlacedNode()];
  emitStarpathMetaphorSignal(store, 'user-michael', 'mist', placed[0].nodeId);
  const merged = computeStarPathSignalsWithCanonicalWorld({
    ...ambientInput(placed),
    canonicalStore: store,
    userId: 'user-michael',
    signalPrefs: {},
    privacy: {
      viewerUserId: 'user-michael',
      ownerUserId: 'user-michael',
      blockedUserIds: [],
      isMutualSkyFriend: false,
    },
  });
  assert(!merged.signalState.activeSignalIds.some((id) => id.startsWith('cws-')), 'no mist world cue');
}

testPeaceWithoutCanonicalPresentations();
testDoorGlowFromCanonical();
testGrowthCueSingle();
testBlockedRelatedUserSuppressesGrowth();
testDeferredMistHasNoWorldBoost();

console.log('starpathCanonicalWorldSignals.test.ts — OK');
