import { createSignal } from '@/starpath/starpathInteractionLogic';
import type { StarPathInteractionSignal } from '@/starpath/starpathInteractionTypes';
import { computeStarPathSiftingState } from '@/starpath/starpathSiftingEngine';

const NOW = 1_700_000_000_000;
const NODE = 'p-blue-1';
const BRANCH = 'learning';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

function sig(
  type: StarPathInteractionSignal['interactionType'],
  ts: number,
  nodeId = NODE,
  branchId = BRANCH,
): StarPathInteractionSignal {
  return createSignal({ nodeId, branchId, interactionType: type, source: 'node_detail', timestamp: ts });
}

function band(nodeId: string, signals: StarPathInteractionSignal[]) {
  return computeStarPathSiftingState(signals, { now: NOW, eligibleNodeIds: [nodeId] }).nodeRelevance[nodeId]
    ?.relevanceBand;
}

function score(nodeId: string, signals: StarPathInteractionSignal[]) {
  return computeStarPathSiftingState(signals, { now: NOW, eligibleNodeIds: [nodeId] }).nodeRelevance[nodeId]
    ?.relevanceScore;
}

// CASE 1 — single view → weak increase only
{
  const s = [sig('viewed', NOW - 1000)];
  const sc = score(NODE, s)!;
  assert(sc > 0 && sc < 0.2, `CASE 1: expected weak positive, got ${sc}`);
  assert(band(NODE, s) === 'low' || band(NODE, s) === 'normal', 'CASE 1: band should stay low/normal');
}

// CASE 2 — Interested → strong increase
{
  const s = [sig('interested', NOW - 500)];
  const sc = score(NODE, s)!;
  assert(sc >= 0.85, `CASE 2: expected strong relevance, got ${sc}`);
  assert(band(NODE, s) === 'high' || band(NODE, s) === 'elevated', 'CASE 2: elevated band');
}

// CASE 3 — many views then dismiss → dismissal wins
{
  const s = [
    sig('viewed', NOW - 500_000),
    sig('viewed', NOW - 400_000),
    sig('viewed', NOW - 300_000),
    sig('dismissed', NOW - 1000),
  ];
  assert(band(NODE, s) === 'suppressed', 'CASE 3: dismissal must win');
}

// CASE 4 — reverse dismiss + interested
{
  const reversedDismiss = createSignal({
    nodeId: NODE,
    branchId: BRANCH,
    interactionType: 'dismissed',
    source: 'node_detail',
    timestamp: NOW - 2000,
    reversed: true,
  });
  const s = [sig('dismissed', NOW - 5000), reversedDismiss, sig('interested', NOW - 500)];
  assert(band(NODE, s) !== 'suppressed', 'CASE 4: interested authoritative after reversal');
  assert(score(NODE, s)! >= 0.85, 'CASE 4: strong positive after interested');
}

// CASE 5 — repeated category exploration
{
  const s = [
    sig('explored', NOW - 3000, 'p-blue-1', 'learning'),
    sig('explored', NOW - 2000, 'p-blue-2', 'learning'),
    sig('explored', NOW - 1000, 'sym-book', 'learning'),
  ];
  const state = computeStarPathSiftingState(s, { now: NOW });
  assert((state.branchAffinity.learning?.relevance ?? 0) > 0.5, 'CASE 5: branch affinity rises');
  assert(
    (state.themeAffinity.learning?.engagementCount ?? 0) >= 3,
    'CASE 5: theme engagement count',
  );
}

// CASE 6 — old passive views vs recent explicit selection
{
  const s = [
    sig('viewed', NOW - 10 * 24 * 60 * 60 * 1000),
    sig('viewed', NOW - 9 * 24 * 60 * 60 * 1000),
    sig('selected', NOW - 1000),
  ];
  const sc = score(NODE, s)!;
  assert(sc >= 0.95, `CASE 6: explicit selection should dominate, got ${sc}`);
}

// CASE 7 — repeated passive must not beat explicit negative
{
  const s = [
    sig('viewed', NOW - 1000),
    sig('viewed', NOW - 900),
    sig('viewed', NOW - 800),
    sig('viewed', NOW - 700),
    sig('dismissed', NOW - 500),
  ];
  assert(band(NODE, s) === 'suppressed', 'CASE 7: dismiss beats passive repetition');
}

// CASE 8 — deterministic
{
  const s = [sig('explored', NOW - 1000), sig('interested', NOW - 500, 'p-violet-1', 'relationships')];
  const a = computeStarPathSiftingState(s, { now: NOW });
  const b = computeStarPathSiftingState(s, { now: NOW });
  assert(JSON.stringify(a) === JSON.stringify(b), 'CASE 8: identical output for same input');
}

// CASE 9 — duplicate emergence candidates deduped
{
  const s = [
    sig('interested', NOW - 2000, 'p-blue-1', 'learning'),
    sig('explored', NOW - 1500, 'p-blue-2', 'learning'),
    sig('explored', NOW - 1000, 'sym-book', 'learning'),
  ];
  const state = computeStarPathSiftingState(s, { now: NOW });
  const ids = state.emergenceCandidates.map((c) => c.nodeId);
  assert(new Set(ids).size === ids.length, 'CASE 9: deduped emergence node ids');
}

// CASE 10 — density guardrails
{
  const nodes: { id: string; branch: string }[] = [
    { id: 'p-blue-1', branch: 'learning' },
    { id: 'p-blue-2', branch: 'learning' },
    { id: 'sym-book', branch: 'learning' },
    { id: 'p-violet-1', branch: 'relationships' },
    { id: 'p-violet-2', branch: 'relationships' },
    { id: 'sym-heart', branch: 'relationships' },
    { id: 'p-green-r1', branch: 'growth' },
    { id: 'sym-growth', branch: 'growth' },
  ];
  const s: StarPathInteractionSignal[] = nodes.map(({ id, branch }, i) =>
    sig('interested', NOW - i * 100, id, branch),
  );
  const state = computeStarPathSiftingState(s, { now: NOW });
  const elevated = Object.values(state.nodeRelevance).filter(
    (n) => n.relevanceBand === 'elevated' || n.relevanceBand === 'high',
  );
  assert(elevated.length <= 5, `CASE 10: max elevated nodes, got ${elevated.length}`);
  assert(state.emergenceCandidates.length <= 4, 'CASE 10: emergence cap');
}

// Persistence compatibility — StarPath 02 snapshot shape + engine (no sifting persistence yet)
{
  const legacyShape = { version: 1, signals: [sig('saved', NOW - 1000)], softHighlightNodeIds: [], activeBranchIds: ['learning'] };
  const state = computeStarPathSiftingState(legacyShape.signals, { now: NOW });
  assert(state.engineVersion === 'beta-v1', 'persistence compat: engine version');
  assert(state.nodeRelevance[NODE]?.reasons.includes('saved_by_user'), 'persistence compat: reads saved signal');
}

console.log('starpathSiftingEngine: all 10 cases passed');
