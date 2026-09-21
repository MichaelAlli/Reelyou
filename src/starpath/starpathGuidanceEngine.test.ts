import { computeStarPathGuidance } from '@/starpath/starpathGuidanceEngine';
import type { StarPathGuidanceSafeInputs } from '@/starpath/starpathGuidanceInputs';
import { EMPTY_GUIDANCE_STATE } from '@/starpath/starpathGuidanceTypes';

const NOW = 1_700_200_000_000;

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

function baseInputs(overrides: Partial<StarPathGuidanceSafeInputs> = {}): StarPathGuidanceSafeInputs {
  return {
    elevatedBranchIds: [],
    recentExplicitInterests: [],
    selectedNodeIds: [],
    savedNodeIds: [],
    dismissedNodeIds: [],
    emergenceCandidateIds: [],
    newlyRevealedNodeIds: [],
    activeMilestoneIds: [],
    unresolvedExplorationIds: [],
    todayFocusText: null,
    latestSavedAt: null,
    primaryOpportunityNodeId: null,
    primaryOpportunityCandidateId: null,
    timeSensitiveOpportunityId: null,
    opportunityGuideEscalation: false,
    dismissedOpportunityIds: [],
    ...overrides,
  };
}

// CASE 1 — interested updates guidance
{
  const out = computeStarPathGuidance(baseInputs({ recentExplicitInterests: ['p-blue-1'] }), { now: NOW });
  assert(out.guide?.reasonCodes.includes('marked_interesting') ?? false, 'CASE 1: interest guidance');
}

// CASE 2 — emergence message
{
  const out = computeStarPathGuidance(baseInputs({ newlyRevealedNodeIds: ['dyn-a'] }), { now: NOW, explicitPulse: true });
  assert(out.guide?.type === 'emergence_notice', 'CASE 2: emergence guide');
  assert(out.nextStep.type === 'explore_new_node', 'CASE 2: next step explore');
}

// CASE 3 — saved revisit eligible
{
  const out = computeStarPathGuidance(
    baseInputs({ savedNodeIds: ['p-blue-1'], recentExplicitInterests: [] }),
    { now: NOW, explicitPulse: true },
  );
  assert(out.guide?.type === 'revisit_saved' || out.nextStep.type === 'revisit_saved', 'CASE 3: saved path');
}

// CASE 4 — dismiss guidance
{
  const msgId = 'guide-emergence_notice-dyn-a';
  const out = computeStarPathGuidance(baseInputs({ newlyRevealedNodeIds: ['dyn-a'] }), {
    now: NOW,
    previous: { ...EMPTY_GUIDANCE_STATE, guideDismissedIds: [msgId] },
    explicitPulse: true,
  });
  assert(out.guide?.type === 'peace_state', 'CASE 4: dismissed does not return');
}

// CASE 5 — dismissed node excluded from positive guidance
{
  const out = computeStarPathGuidance(
    baseInputs({
      recentExplicitInterests: ['p-blue-1'],
      dismissedNodeIds: ['p-blue-1'],
    }),
    { now: NOW, explicitPulse: true },
  );
  assert(
    !out.guide?.sourceIds.includes('p-blue-1') || out.guide.type === 'peace_state',
    'CASE 5: dismissed node not promoted',
  );
}

// CASE 6 — deterministic primary choice
{
  const inputs = baseInputs({
    recentExplicitInterests: ['p-blue-1'],
    newlyRevealedNodeIds: ['dyn-a'],
  });
  const a = computeStarPathGuidance(inputs, { now: NOW, explicitPulse: true });
  const b = computeStarPathGuidance(inputs, { now: NOW, explicitPulse: true });
  assert(a.guide?.messageId === b.guide?.messageId, 'CASE 6: deterministic guide');
}

// CASE 7 — peace when empty
{
  const out = computeStarPathGuidance(baseInputs(), { now: NOW });
  assert(out.guide?.type === 'peace_state', 'CASE 7: peace state');
}

// CASE 8 — stability preserves message id
{
  const inputs = baseInputs({ recentExplicitInterests: ['p-blue-1'] });
  const first = computeStarPathGuidance(inputs, { now: NOW, explicitPulse: true });
  const second = computeStarPathGuidance(inputs, { now: NOW + 1000, previous: first.state });
  assert(second.guide?.messageId === first.guide?.messageId, 'CASE 8: stability window');
}

// CASE 9 — next step types
{
  const out = computeStarPathGuidance(baseInputs({ unresolvedExplorationIds: ['p-violet-1'] }), {
    now: NOW,
    explicitPulse: true,
  });
  assert(out.nextStep.type === 'continue_branch', 'CASE 9: next step present');
}

// CASE 10 — identical output
{
  const inputs = baseInputs({ elevatedBranchIds: ['learning'] });
  const a = computeStarPathGuidance(inputs, { now: NOW });
  const b = computeStarPathGuidance(inputs, { now: NOW });
  assert(JSON.stringify(a) === JSON.stringify(b), 'CASE 10: identical');
}

console.log('starpathGuidanceEngine: all 10 cases passed');
