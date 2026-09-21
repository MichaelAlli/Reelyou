import { createSignal } from '@/starpath/starpathInteractionLogic';
import { computeStarPathSiftingState } from '@/starpath/starpathSiftingEngine';
import { EMPTY_DYNAMIC_WORLD } from '@/starpath/starpathDynamicWorldTypes';
import { reconcileLivingWorld } from '@/starpath/starpathDynamicWorldEngine';

const NOW = 1_700_100_000_000;

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

function interestedSignals(nodeId: string, branchId: string) {
  return [createSignal({ nodeId, branchId, interactionType: 'interested', source: 'node_detail', timestamp: NOW })];
}

function sifting(signals: ReturnType<typeof createSignal>[]) {
  return computeStarPathSiftingState(signals, { now: NOW });
}

// CASE 1 — eligible emergence, stable position
{
  const signals = interestedSignals('p-blue-1', 'learning');
  const r1 = reconcileLivingWorld(EMPTY_DYNAMIC_WORLD, {
    now: NOW,
    sifting: sifting(signals),
    signals,
    exploreTriggerNodeId: 'p-blue-1',
    contentBandHeight: 852,
  });
  assert(r1.world.nodes.length >= 1, 'CASE 1: node emerges');
  const node = r1.world.nodes[0];
  const r2 = reconcileLivingWorld(EMPTY_DYNAMIC_WORLD, {
    now: NOW,
    sifting: sifting(signals),
    signals,
    exploreTriggerNodeId: 'p-blue-1',
    contentBandHeight: 852,
  });
  assert(r2.world.nodes[0].refX === node.refX && r2.world.nodes[0].refY === node.refY, 'CASE 1: stable placement');
}

// CASE 2 — reload same state
{
  const signals = interestedSignals('p-blue-1', 'learning');
  const world = reconcileLivingWorld(EMPTY_DYNAMIC_WORLD, {
    now: NOW,
    sifting: sifting(signals),
    signals,
    exploreTriggerNodeId: 'p-blue-1',
    contentBandHeight: 852,
  }).world;
  const again = reconcileLivingWorld(world, {
    now: NOW + 5000,
    sifting: sifting(signals),
    signals,
    contentBandHeight: 852,
  }).world;
  assert(again.nodes[0]?.refX === world.nodes[0]?.refX, 'CASE 2: reload stable');
}

// CASE 3 — dismissed blocks emergence
{
  const signals = [
    createSignal({ nodeId: 'p-blue-1', branchId: 'learning', interactionType: 'dismissed', source: 'node_detail', timestamp: NOW }),
  ];
  const r = reconcileLivingWorld(EMPTY_DYNAMIC_WORLD, {
    now: NOW,
    sifting: sifting(signals),
    signals,
    exploreTriggerNodeId: 'p-blue-1',
    contentBandHeight: 852,
  });
  assert(r.world.nodes.every((n) => n.emergenceState === 'hidden' || n.sourceId !== 'p-blue-1' || n.emergenceState !== 'active'), 'CASE 3: dismiss respected');
  assert(r.world.nodes.filter((n) => n.sourceId === 'p-blue-1' && n.status === 'visible').length === 0, 'CASE 3: no visible emerge');
}

// CASE 4 — density limits
{
  const signals = [
    createSignal({ nodeId: 'p-blue-1', branchId: 'learning', interactionType: 'interested', source: 'node_detail', timestamp: NOW }),
    createSignal({ nodeId: 'p-blue-2', branchId: 'learning', interactionType: 'interested', source: 'node_detail', timestamp: NOW - 100 }),
    createSignal({ nodeId: 'sym-book', branchId: 'learning', interactionType: 'interested', source: 'node_detail', timestamp: NOW - 200 }),
    createSignal({ nodeId: 'p-violet-1', branchId: 'relationships', interactionType: 'interested', source: 'node_detail', timestamp: NOW - 300 }),
    createSignal({ nodeId: 'p-green-r1', branchId: 'growth', interactionType: 'interested', source: 'node_detail', timestamp: NOW - 400 }),
  ];
  let world = EMPTY_DYNAMIC_WORLD;
  for (let i = 0; i < 6; i += 1) {
    world = reconcileLivingWorld(world, {
      now: NOW + i * 50_000,
      sifting: sifting(signals),
      signals,
      exploreTriggerNodeId: i % 2 ? 'p-blue-1' : 'p-blue-2',
      contentBandHeight: 852,
    }).world;
  }
  const visible = world.nodes.filter((n) => ['emerging', 'active', 'settled'].includes(n.emergenceState));
  assert(visible.length <= 4, `CASE 4: density cap, got ${visible.length}`);
}

// CASE 5 — explore reveals at most one new template per trigger
{
  const signals = interestedSignals('p-blue-1', 'learning');
  const r = reconcileLivingWorld(EMPTY_DYNAMIC_WORLD, {
    now: NOW,
    sifting: sifting(signals),
    signals,
    exploreTriggerNodeId: 'p-blue-1',
    contentBandHeight: 852,
  });
  assert(r.recentlyEmergedIds.length <= 1, 'CASE 5: paced exploration reveal');
}

// CASE 6 — elevated branch does not mutate locked geometry (no locked branch ids in extensions)
{
  const signals = interestedSignals('p-blue-1', 'learning');
  const r = reconcileLivingWorld(EMPTY_DYNAMIC_WORLD, {
    now: NOW,
    sifting: sifting(signals),
    signals,
    exploreTriggerNodeId: 'p-blue-1',
    contentBandHeight: 852,
  });
  assert(r.world.branchExtensions.every((b) => b.id.startsWith('dyn-ext-')), 'CASE 6: dynamic extensions only');
}

// CASE 7 — world expansion when growth refY > 1
{
  const signals = interestedSignals('p-blue-1', 'learning');
  const r = reconcileLivingWorld(EMPTY_DYNAMIC_WORLD, {
    now: NOW,
    sifting: sifting(signals),
    signals,
    exploreTriggerNodeId: 'p-blue-1',
    contentBandHeight: 852,
  });
  assert(r.world.worldExpansionPx >= 0, 'CASE 7: expansion computed');
}

// CASE 8 — offscreen hint when node below viewport
{
  const signals = interestedSignals('p-blue-1', 'learning');
  const r = reconcileLivingWorld(EMPTY_DYNAMIC_WORLD, {
    now: NOW,
    sifting: sifting(signals),
    signals,
    exploreTriggerNodeId: 'p-blue-1',
    viewportScrollY: 0,
    viewportHeight: 852,
    paddingTop: 119,
    contentBandHeight: 852,
  });
  const hasBelow = r.offscreenHints.some((h) => h.direction === 'below');
  assert(hasBelow || r.world.nodes.length === 0, 'CASE 8: offscreen hint when growth below fold');
}

// CASE 9 — duplicate source/template blocked
{
  const signals = interestedSignals('p-blue-1', 'learning');
  let world = reconcileLivingWorld(EMPTY_DYNAMIC_WORLD, {
    now: NOW,
    sifting: sifting(signals),
    signals,
    exploreTriggerNodeId: 'p-blue-1',
    contentBandHeight: 852,
  }).world;
  world = reconcileLivingWorld(world, {
    now: NOW + 100_000,
    sifting: sifting(signals),
    signals,
    exploreTriggerNodeId: 'p-blue-1',
    contentBandHeight: 852,
  }).world;
  const ids = world.nodes.map((n) => `${n.sourceId}:${n.templateId}`);
  assert(new Set(ids).size === ids.length, 'CASE 9: no duplicate nodes');
}

// CASE 10 — identical layout from same persisted state
{
  const signals = interestedSignals('p-blue-1', 'learning');
  const world = reconcileLivingWorld(EMPTY_DYNAMIC_WORLD, {
    now: NOW,
    sifting: sifting(signals),
    signals,
    exploreTriggerNodeId: 'p-blue-1',
    contentBandHeight: 852,
  }).world;
  const a = JSON.stringify(world.nodes.map((n) => ({ id: n.id, x: n.refX, y: n.refY })));
  const b = JSON.stringify(
    reconcileLivingWorld(world, { now: NOW + 1000, sifting: sifting(signals), signals, contentBandHeight: 852 }).world.nodes.map(
      (n) => ({ id: n.id, x: n.refX, y: n.refY }),
    ),
  );
  assert(a === b, 'CASE 10: identical layout');
}

console.log('starpathDynamicWorldEngine: all 10 cases passed');
