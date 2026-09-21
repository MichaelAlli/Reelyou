import { stableHash01 } from '@/starpath/starpathDynamicPlacement';
import { iconForOpportunityType, ringColorForBranch } from '@/starpath/starpathOpportunityIcons';
import type {
  OpportunityCandidate,
  PlacedOpportunityNode,
  StarPathResourceState,
} from '@/starpath/starpathOpportunityTypes';
import { RESOURCE_OVERLOAD_GUARDRAILS } from '@/starpath/starpathResourceConfig';

export function stableOpportunityNodeId(candidateId: string): string {
  return `opp-node-${candidateId}`;
}

function placementForOpportunity(candidateId: string, branchId: string, slot: number): { refX: number; refY: number } {
  const h = stableHash01(`${candidateId}:${branchId}:${slot}`);
  const left = branchId === 'learning' || branchId === 'community';
  const refX = left ? 0.22 + h * 0.1 : 0.78 - h * 0.1;
  const refY = 1.12 + slot * 0.09 + stableHash01(candidateId) * 0.04;
  return { refX, refY };
}

export function organizeOpportunities(
  sifted: OpportunityCandidate[],
  prev: StarPathResourceState,
  now: number,
): StarPathResourceState {
  const resourcesById = { ...prev.resourcesById };
  const placedNodes: PlacedOpportunityNode[] = [];
  const activeResourceIds: string[] = [];

  sifted.forEach((candidate, index) => {
    resourcesById[candidate.id] = candidate;
    const branchId = candidate.relatedBranchIds[0] ?? 'learning';
    const nodeId = stableOpportunityNodeId(candidate.id);
    const existing = prev.placedNodes.find((n) => n.candidateId === candidate.id);
    const { refX, refY } = existing
      ? { refX: existing.refX, refY: existing.refY }
      : placementForOpportunity(candidate.id, branchId, index);

    const prominence =
      index === 0 ? 'primary' : index <= RESOURCE_OVERLOAD_GUARDRAILS.maxComparisonResources ? 'comparison' : 'hidden';

    if (prominence === 'hidden') return;

    activeResourceIds.push(candidate.id);
    placedNodes.push({
      nodeId,
      candidateId: candidate.id,
      branchId,
      refX,
      refY,
      iconKey: iconForOpportunityType(candidate.opportunityType),
      ringColor: ringColorForBranch(branchId),
      prominence,
      tracking: existing?.tracking ?? {
        surfacedAt: now,
        guideMentionCount: 0,
      },
    });
  });

  return {
    ...prev,
    resourcesById,
    placedNodes,
    activeResourceIds,
    lastDiscoveryAt: now,
    providerStatus: prev.providerStatus,
  };
}

export function markOpportunityOpened(state: StarPathResourceState, nodeId: string, now: number): StarPathResourceState {
  const placedNodes = state.placedNodes.map((n) => {
    if (n.nodeId !== nodeId) return n;
    return {
      ...n,
      tracking: {
        ...n.tracking,
        openedAt: n.tracking.openedAt ?? now,
        firstSeenAt: n.tracking.firstSeenAt ?? now,
        lastVisibleAt: now,
      },
    };
  });
  return { ...state, placedNodes };
}

export function markGuideMentioned(state: StarPathResourceState, candidateId: string, now: number): StarPathResourceState {
  const placedNodes = state.placedNodes.map((n) => {
    if (n.candidateId !== candidateId) return n;
    return {
      ...n,
      tracking: {
        ...n.tracking,
        guideMentionedAt: now,
        guideMentionCount: n.tracking.guideMentionCount + 1,
      },
    };
  });
  return { ...state, placedNodes };
}
