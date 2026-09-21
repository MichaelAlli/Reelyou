import { deriveNodeUiState } from '@/starpath/starpathInteractionLogic';
import type { StarPathInteractionSignal } from '@/starpath/starpathInteractionTypes';
import {
  DYNAMIC_DENSITY,
  EMERGENCE_PACING,
  LIVING_WORLD_ENGINE_VERSION,
  MILESTONE_RULES,
} from '@/starpath/starpathDynamicWorldConfig';
import {
  deterministicGrowthRefPoint,
  stableDynamicNodeId,
} from '@/starpath/starpathDynamicPlacement';
import type {
  JourneyBranchExtension,
  JourneyMilestone,
  JourneyNode,
  StarPathDynamicWorldState,
  StarPathOffscreenGrowthHint,
} from '@/starpath/starpathDynamicWorldTypes';
import {
  getGrowthTemplate,
  templatesForCatalogNode,
  type GrowthPossibilityTemplate,
} from '@/starpath/starpathGrowthPossibilities';
import { getStarPathNodeCatalogEntry } from '@/starpath/starpathNodeCatalog';
import type { StarPathBranchSpec } from '@/starpath/starpathReferenceLayout';
import { getReferenceBranchSpecs } from '@/starpath/starpathReferenceLayout';
import type { StarPathSiftingState } from '@/starpath/starpathSiftingTypes';
import { DENSITY_GUARDRAILS } from '@/starpath/starpathSiftingConfig';

export interface ReconcileLivingWorldInput {
  now: number;
  sifting: StarPathSiftingState;
  signals: StarPathInteractionSignal[];
  exploreTriggerNodeId?: string | null;
  viewportScrollY?: number;
  viewportHeight?: number;
  contentBandHeight?: number;
  paddingTop?: number;
}

export interface ReconcileLivingWorldResult {
  world: StarPathDynamicWorldState;
  offscreenHints: StarPathOffscreenGrowthHint[];
  growthGuideHint: string | null;
  recentlyEmergedIds: string[];
}

const LOCKED_BRANCHES = getReferenceBranchSpecs();

function branchSide(branchId: string): 'left' | 'right' {
  const locked = LOCKED_BRANCHES.find((b) => b.id === branchId);
  return locked?.side ?? 'left';
}

function branchColors(branchId: string): { color: string; glowColor: string } {
  const locked = LOCKED_BRANCHES.find((b) => b.id === branchId);
  return { color: locked?.color ?? '#9AE8FF', glowColor: locked?.glowColor ?? '#5EC8FF' };
}

function anchorRefPoint(anchorNodeId: string): { x: number; y: number } | null {
  const entry = getStarPathNodeCatalogEntry(anchorNodeId);
  if (!entry) return null;
  const portrait = ['p-blue-1', 'p-blue-2', 'p-violet-1', 'p-violet-2', 'p-green-r1'].includes(anchorNodeId);
  if (portrait) {
    const refs: Record<string, { x: number; y: number }> = {
      'p-blue-1': { x: 0.168, y: 0.522 },
      'p-blue-2': { x: 0.138, y: 0.448 },
      'p-violet-1': { x: 0.832, y: 0.432 },
      'p-violet-2': { x: 0.858, y: 0.368 },
      'p-green-r1': { x: 0.828, y: 0.612 },
    };
    return refs[anchorNodeId] ?? null;
  }
  const symRefs: Record<string, { x: number; y: number }> = {
    'sym-book': { x: 0.102, y: 0.362 },
    'sym-heart': { x: 0.898, y: 0.292 },
    'sym-growth': { x: 0.882, y: 0.672 },
    'sym-community': { x: 0.108, y: 0.702 },
  };
  return symRefs[anchorNodeId] ?? null;
}

function hasSourceDuplicate(world: StarPathDynamicWorldState, sourceId: string, templateId: string): boolean {
  return world.nodes.some((n) => n.sourceId === sourceId && n.templateId === templateId);
}

function visibleDynamicCount(nodes: JourneyNode[]): number {
  return nodes.filter((n) => ['emerging', 'active', 'settled'].includes(n.emergenceState)).length;
}

function canMajorEmerge(world: StarPathDynamicWorldState, now: number, accelerated: boolean): boolean {
  const cooldown = accelerated ? EMERGENCE_PACING.exploreAcceleratedCooldownMs : EMERGENCE_PACING.majorCooldownMs;
  return now - world.lastMajorEmergenceAt >= cooldown;
}

function createDynamicNode(
  template: GrowthPossibilityTemplate,
  sourceId: string,
  slotIndex: number,
  existing: JourneyNode[],
  now: number,
  band?: JourneyNode['relevanceBand'],
): JourneyNode {
  const id = stableDynamicNodeId(template.id, sourceId);
  const { refX, refY } = deterministicGrowthRefPoint(id, template.branchId, slotIndex, existing);
  return {
    id,
    branchId: template.branchId,
    categoryId: template.categoryId,
    refX,
    refY,
    type: template.kind === 'portrait' ? 'portrait' : 'symbol',
    emergenceState: 'emerging',
    relevanceBand: band,
    sourceId,
    templateId: template.id,
    anchorNodeId: template.anchorNodeId,
    ringColor: template.ringColor,
    icon: template.icon,
    portraitSeed: template.portraitSeed,
    createdAt: now,
    revealedAt: now,
    status: 'visible',
  };
}

function createBranchExtension(
  node: JourneyNode,
  template: GrowthPossibilityTemplate,
  now: number,
): JourneyBranchExtension | null {
  const anchor = anchorRefPoint(template.anchorNodeId);
  if (!anchor) return null;
  const colors = branchColors(template.branchId);
  return {
    id: `dyn-ext-${node.id}`,
    parentBranchId: template.branchId,
    categoryId: template.categoryId,
    startNodeId: template.anchorNodeId,
    endNodeIds: [node.id],
    waypoints: [anchor, { x: node.refX, y: node.refY }],
    color: colors.color,
    glowColor: colors.glowColor,
    side: branchSide(template.branchId),
    status: 'visible',
    createdAt: now,
  };
}

function updateRelevanceStates(
  nodes: JourneyNode[],
  sifting: StarPathSiftingState,
): JourneyNode[] {
  return nodes.map((n) => {
    const catalog = getStarPathNodeCatalogEntry(n.sourceId);
    const rel = catalog ? sifting.nodeRelevance[catalog.id] : undefined;
    let emergenceState = n.emergenceState;
    if (rel?.relevanceBand === 'suppressed') {
      return { ...n, emergenceState: 'hidden', status: 'archived' as const };
    }
    if (rel?.relevanceBand === 'low' && ['active', 'settled'].includes(n.emergenceState)) {
      emergenceState = 'receding';
    }
    return { ...n, relevanceBand: rel?.relevanceBand, emergenceState };
  });
}

function maybeCreateMilestone(
  world: StarPathDynamicWorldState,
  branchId: string,
  now: number,
): JourneyMilestone | null {
  const settled = world.nodes.filter(
    (n) => n.branchId === branchId && (n.emergenceState === 'settled' || n.emergenceState === 'active'),
  );
  if (settled.length < MILESTONE_RULES.minSettledNodesPerBranch) return null;
  const id = `milestone-${branchId}-${settled.length}`;
  if (world.milestones.some((m) => m.id === id)) return null;
  const avgX = settled.reduce((s, n) => s + n.refX, 0) / settled.length;
  const avgY = settled.reduce((s, n) => s + n.refY, 0) / settled.length;
  return {
    id,
    branchId,
    refX: avgX,
    refY: avgY,
    sourceNodeIds: settled.map((n) => n.id),
    summaryType: 'branch_activity',
    status: 'visible',
    createdAt: now,
  };
}

function computeWorldExpansion(nodes: JourneyNode[], contentBandHeight: number): number {
  const maxRefY = nodes.reduce((m, n) => Math.max(m, n.refY), 1);
  if (maxRefY <= 1.08) return 0;
  return Math.max(0, (maxRefY - 1.08) * contentBandHeight);
}

function buildOffscreenHints(
  nodes: JourneyNode[],
  input: ReconcileLivingWorldInput,
): StarPathOffscreenGrowthHint[] {
  const { viewportScrollY = 0, viewportHeight = 852, paddingTop = 0, contentBandHeight = 852 } = input;
  const hints: StarPathOffscreenGrowthHint[] = [];
  for (const n of nodes) {
    if (!['emerging', 'active'].includes(n.emergenceState)) continue;
    const worldY = paddingTop + n.refY * contentBandHeight;
    if (worldY < viewportScrollY - 40) {
      hints.push({ direction: 'above', nodeId: n.id, branchId: n.branchId });
    } else if (worldY > viewportScrollY + viewportHeight + 40) {
      hints.push({ direction: 'below', nodeId: n.id, branchId: n.branchId });
    }
  }
  return hints;
}

export function reconcileLivingWorld(
  prev: StarPathDynamicWorldState,
  input: ReconcileLivingWorldInput,
): ReconcileLivingWorldResult {
  const { now, sifting, signals, exploreTriggerNodeId } = input;
  let nodes = updateRelevanceStates([...prev.nodes], sifting);
  let branchExtensions = [...prev.branchExtensions];
  let milestones = [...prev.milestones];
  let lastMajorEmergenceAt = prev.lastMajorEmergenceAt;
  const recentlyEmergedIds: string[] = [];
  let growthGuideHint: string | null = null;

  const dismissed = new Set(
    Object.entries(sifting.nodeRelevance)
      .filter(([, r]) => r.relevanceBand === 'suppressed')
      .map(([id]) => id),
  );

  const emergeBudget = Math.min(
    DYNAMIC_DENSITY.maxSimultaneousEmergence,
    DENSITY_GUARDRAILS.maxEmergenceCandidates,
  );
  let emergedThisTick = 0;
  const accelerated = !!exploreTriggerNodeId;

  const tryEmergeTemplate = (template: GrowthPossibilityTemplate, sourceId: string) => {
    if (emergedThisTick >= emergeBudget) return;
    if (visibleDynamicCount(nodes) >= DYNAMIC_DENSITY.maxVisibleDynamicNodes) return;
    if (hasSourceDuplicate(prev, sourceId, template.id)) return;
    if (dismissed.has(sourceId)) return;
    if (!canMajorEmerge(prev, now, accelerated) && emergedThisTick > 0) return;
    if (!canMajorEmerge(prev, now, accelerated) && !accelerated) return;

    const slot = nodes.filter((n) => n.branchId === template.branchId).length;
    const rel = sifting.nodeRelevance[sourceId];
    const node = createDynamicNode(template, sourceId, slot, nodes, now, rel?.relevanceBand);
    nodes.push(node);
    const ext = createBranchExtension(node, template, now);
    if (ext && !branchExtensions.some((b) => b.id === ext.id)) {
      branchExtensions.push(ext);
    }
    recentlyEmergedIds.push(node.id);
    emergedThisTick += 1;
    lastMajorEmergenceAt = now;
    growthGuideHint = 'A new possibility opened nearby.';
  };

  if (exploreTriggerNodeId) {
    const related = templatesForCatalogNode(exploreTriggerNodeId);
    for (const template of related.slice(0, DYNAMIC_DENSITY.explorationRevealMax)) {
      tryEmergeTemplate(template, exploreTriggerNodeId);
    }
    if (!related.length) {
      const entry = getStarPathNodeCatalogEntry(exploreTriggerNodeId);
      if (entry) {
        for (const template of templatesForCatalogNode(entry.relatedNodeIds[0] ?? '').slice(0, 1)) {
          tryEmergeTemplate(template, exploreTriggerNodeId);
        }
      }
    }
  }

  for (const candidate of sifting.emergenceCandidates) {
    if (dismissed.has(candidate.nodeId)) continue;
    const templates = templatesForCatalogNode(candidate.nodeId);
    for (const template of templates) {
      tryEmergeTemplate(template, candidate.nodeId);
    }
  }

  for (const branchId of sifting.guideSummary.elevatedBranchIds) {
    const milestone = maybeCreateMilestone({ ...prev, nodes, milestones }, branchId, now);
    if (milestone) milestones.push(milestone);
  }

  nodes = nodes.map((n) => {
    if (n.emergenceState === 'active' && n.revealedAt && now - n.revealedAt > EMERGENCE_PACING.emergingSettleMs) {
      return { ...n, emergenceState: 'settled' as const };
    }
    return n;
  });

  const worldExpansionPx = computeWorldExpansion(nodes, input.contentBandHeight ?? 852);

  const world: StarPathDynamicWorldState = {
    ...prev,
    engineVersion: LIVING_WORLD_ENGINE_VERSION,
    nodes,
    branchExtensions,
    milestones,
    worldExpansionPx,
    lastMajorEmergenceAt,
    lastCalculatedAt: now,
  };

  return {
    world,
    offscreenHints: buildOffscreenHints(nodes, input),
    growthGuideHint,
    recentlyEmergedIds,
  };
}

export function dynamicBranchesToRenderSpecs(
  extensions: JourneyBranchExtension[],
): StarPathBranchSpec[] {
  return extensions
    .filter((e) => e.status === 'visible')
    .map((e) => ({
      id: e.id,
      color: e.color,
      glowColor: e.glowColor,
      opacity: 0.38,
      side: e.side,
      waypoints: e.waypoints,
    }));
}

export function mergeRecentlyEmerged(
  lockedIds: string[],
  dynamicIds: string[],
): string[] {
  return [...new Set([...lockedIds, ...dynamicIds])];
}
