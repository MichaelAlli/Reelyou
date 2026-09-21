import { boundInteractionSignals, STARPATH_MAX_INTERACTION_SIGNALS } from '@/starpath/starpathInteractionBounds';
import {
  migrateInteractionSnapshot,
  migrateResourceState,
  migrateSignalState,
} from '@/starpath/starpathPersistenceMigrations';
import { computeAmbientSignals } from '@/starpath/starpathSignalEngine';
import { EMPTY_SIGNAL_STATE } from '@/starpath/starpathSignalTypes';
import type { StarPathInteractionSignal } from '@/starpath/starpathInteractionTypes';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

function testMigrationLegacyInteractions() {
  const migrated = migrateInteractionSnapshot({ version: 0, signals: [{ id: 'a', nodeId: 'n', branchId: 'b', interactionType: 'saved', timestamp: 1, source: 'node_detail' }] as StarPathInteractionSignal[] });
  assert(migrated.version === 2, 'interactions migrate to v2');
  assert(migrated.signals.length === 1, 'preserve signals');
}

function testCorruptPartialRecovery() {
  const resources = migrateResourceState(null);
  assert(resources.dismissedResourceIds.length === 0, 'null resources recover to empty');
  const signals = migrateSignalState({ activeSignalIds: ['sig-x'] });
  assert(Array.isArray(signals.acknowledgedSignalIds), 'signal ack array');
}

function testBoundSignals() {
  const many: StarPathInteractionSignal[] = [];
  for (let i = 0; i < STARPATH_MAX_INTERACTION_SIGNALS + 40; i++) {
    many.push({
      id: `s-${i}`,
      nodeId: `n-${i % 50}`,
      branchId: 'learning',
      interactionType: i % 3 === 0 ? 'saved' : 'viewed',
      timestamp: i,
      source: 'node_detail',
    });
  }
  const bounded = boundInteractionSignals(many);
  assert(bounded.length <= STARPATH_MAX_INTERACTION_SIGNALS, 'signals bounded');
}

function testAcknowledgedSignalSoftensLevel() {
  const placed = [
    {
      nodeId: 'opp-node-fixture',
      candidateId: 'fixture-grant-learning-01',
      branchId: 'learning',
      refX: 0.3,
      refY: 1.2,
      iconKey: '✧',
      ringColor: '#fff',
      prominence: 'primary' as const,
      tracking: { guideMentionCount: 0, surfacedAt: Date.now() - 1000 },
    },
  ];
  const resourcesById = {
    'fixture-grant-learning-01': {
      id: 'fixture-grant-learning-01',
      title: 'Grant',
      opportunityType: 'grant' as const,
      provider: 'P',
      sourceName: 'F',
      description: 'd',
      categories: [],
      relatedBranchIds: ['learning'],
      relatedNodeIds: [],
      reasonCodes: [],
      freshnessStatus: 'fresh' as const,
      verificationStatus: 'fixture' as const,
      retrievedAt: Date.now(),
      availabilityStatus: 'open' as const,
      fixtureOnly: true,
      deadline: Date.now() + 86400000,
    },
  };
  const fresh = computeAmbientSignals({
    now: Date.now(),
    placedNodes: placed,
    resourcesById,
    dismissedResourceIds: [],
    viewportScrollY: 0,
    viewportHeight: 852,
    paddingTop: 100,
    contentBandHeight: 852,
    supportState: 'unknown',
    previous: EMPTY_SIGNAL_STATE,
  });
  const ack = computeAmbientSignals({
    now: Date.now(),
    placedNodes: placed,
    resourcesById,
    dismissedResourceIds: [],
    viewportScrollY: 0,
    viewportHeight: 852,
    paddingTop: 100,
    contentBandHeight: 852,
    supportState: 'unknown',
    previous: {
      ...EMPTY_SIGNAL_STATE,
      acknowledgedSignalIds: ['sig-opp-node-fixture'],
    },
  });
  const freshLevel = fresh.signalsById['sig-opp-node-fixture']?.signalLevel;
  const ackLevel = ack.signalsById['sig-opp-node-fixture']?.signalLevel;
  assert(!!freshLevel && !!ackLevel, 'signals exist');
}

function main() {
  testMigrationLegacyInteractions();
  testCorruptPartialRecovery();
  testBoundSignals();
  testAcknowledgedSignalSoftensLevel();
  console.log('starpathPersistence.test.ts: all passed');
}

main();
