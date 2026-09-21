import { FIXTURE_ANCHOR_MS } from '@/starpath/starpathResourceFixtures';
import { discoverResourceCandidates, filterStaleAndUnverified } from '@/starpath/starpathResourceDiscoveryService';
import { siftOpportunityCandidates } from '@/starpath/starpathOpportunitySifting';
import { organizeOpportunities, stableOpportunityNodeId } from '@/starpath/starpathOpportunityOrganizer';
import { runOpportunityOrchestrator } from '@/starpath/starpathOpportunityOrchestrator';
import { buildGuidanceSafeInputs } from '@/starpath/starpathGuidanceInputs';
import { EMPTY_RESOURCE_STATE } from '@/starpath/starpathOpportunityTypes';
import { EMPTY_SIGNAL_STATE } from '@/starpath/starpathSignalTypes';
import { computeStarPathGuidance } from '@/starpath/starpathGuidanceEngine';
import { EMPTY_GUIDANCE_STATE } from '@/starpath/starpathGuidanceTypes';
import { dismissResource } from '@/starpath/starpathResourceActions';

const NOW = FIXTURE_ANCHOR_MS + 5 * 24 * 60 * 60 * 1000;

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

function assertEqual<T>(a: T, b: T, message?: string) {
  if (a !== b) throw new Error(message ?? `Expected ${String(a)} === ${String(b)}`);
}

function baseInputs() {
  return buildGuidanceSafeInputs([], {
    guideSummary: {
      elevatedBranchIds: ['learning'],
      recentExplicitInterests: [],
      emergenceCandidateIds: [],
      dismissedNodeIds: [],
    },
    nodeRelevance: {},
  } as never, { nodes: [], branchExtensions: [], milestones: [], worldExpansionPx: 0 } as never, [], 'learning skills');
}

async function testFixturesStayFresh() {
  const { candidates } = await discoverResourceCandidates({
    now: Date.now(),
    inputs: baseInputs(),
    elevatedBranchId: 'learning',
    todayFocusText: 'learning',
  });
  assert(candidates.length > 0, 'fixture catalog should yield active candidates at real now');
  assert(candidates.every((c) => c.freshnessStatus !== 'expired'), 'no expired fixtures');
}

async function testDeterministicPipeline() {
  const inputs = baseInputs();
  const discovery = await discoverResourceCandidates({
    now: NOW,
    inputs,
    elevatedBranchId: 'learning',
    todayFocusText: null,
  });
  const filtered = filterStaleAndUnverified(discovery.candidates);
  const sifted = siftOpportunityCandidates(filtered, inputs, [], NOW);
  const organized = organizeOpportunities(sifted, EMPTY_RESOURCE_STATE, NOW);
  assert(organized.placedNodes.length >= 1, 'organizer should place nodes');
  const nodeId = stableOpportunityNodeId(sifted[0].id);
  assertEqual(organized.placedNodes[0].nodeId, nodeId);

  const run1 = await runOpportunityOrchestrator({
    now: NOW,
    guidanceInputs: inputs,
    resourceState: EMPTY_RESOURCE_STATE,
    signalState: EMPTY_SIGNAL_STATE,
    supportState: 'unknown',
    viewport: { scrollY: 400, viewportHeight: 852, paddingTop: 120, contentBandHeight: 852 },
  });
  const run2 = await runOpportunityOrchestrator({
    now: NOW,
    guidanceInputs: inputs,
    resourceState: EMPTY_RESOURCE_STATE,
    signalState: EMPTY_SIGNAL_STATE,
    supportState: 'unknown',
    viewport: { scrollY: 400, viewportHeight: 852, paddingTop: 120, contentBandHeight: 852 },
  });
  assertEqual(run1.primaryOpportunityNodeId, run2.primaryOpportunityNodeId, 'deterministic orchestrator');
}

function testDismissStopsGuidance() {
  const inputs = {
    ...baseInputs(),
    primaryOpportunityCandidateId: 'fixture-grant-learning-01',
    primaryOpportunityNodeId: stableOpportunityNodeId('fixture-grant-learning-01'),
    timeSensitiveOpportunityId: 'fixture-grant-learning-01',
    opportunityGuideEscalation: true,
    dismissedOpportunityIds: ['fixture-grant-learning-01'],
  };
  const out = computeStarPathGuidance(inputs, { previous: EMPTY_GUIDANCE_STATE, now: NOW });
  assert(out.guide?.type !== 'time_sensitive_opportunity', 'dismissed opportunity should not guide');
}

async function testDismissResourceRemovesPlaced() {
  let state = EMPTY_RESOURCE_STATE;
  const inputs = baseInputs();
  const discovery = await discoverResourceCandidates({ now: NOW, inputs, elevatedBranchId: null, todayFocusText: null });
  const sifted = siftOpportunityCandidates(discovery.candidates, inputs, [], NOW);
  state = organizeOpportunities(sifted, state, NOW);
  const id = sifted[0].id;
  state = dismissResource(state, id);
  assert(!state.placedNodes.some((n) => n.candidateId === id), 'dismiss removes placement');
}

async function main() {
  await testFixturesStayFresh();
  await testDeterministicPipeline();
  testDismissStopsGuidance();
  await testDismissResourceRemovesPlaced();
  console.log('starpathOpportunitySystem.test.ts: all passed');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
