import type { StarPathResourceState } from '@/starpath/starpathOpportunityTypes';
import { OPPORTUNITY_ESCALATION } from '@/starpath/starpathResourceConfig';

export function saveResource(state: StarPathResourceState, candidateId: string): StarPathResourceState {
  const savedResourceIds = state.savedResourceIds.includes(candidateId)
    ? state.savedResourceIds
    : [...state.savedResourceIds, candidateId];
  return { ...state, savedResourceIds };
}

export function dismissResource(state: StarPathResourceState, candidateId: string): StarPathResourceState {
  const dismissedResourceIds = state.dismissedResourceIds.includes(candidateId)
    ? state.dismissedResourceIds
    : [...state.dismissedResourceIds, candidateId];
  const activeResourceIds = state.activeResourceIds.filter((id) => id !== candidateId);
  const placedNodes = state.placedNodes.filter((n) => n.candidateId !== candidateId);
  return { ...state, dismissedResourceIds, activeResourceIds, placedNodes };
}

export function snoozeResource(
  state: StarPathResourceState,
  candidateId: string,
  now: number,
): StarPathResourceState {
  const until = now + OPPORTUNITY_ESCALATION.mentionCooldownMs;
  return {
    ...state,
    snoozedResourceUntil: { ...state.snoozedResourceUntil, [candidateId]: until },
    activeResourceIds: state.activeResourceIds.filter((id) => id !== candidateId),
    placedNodes: state.placedNodes.filter((n) => n.candidateId !== candidateId),
  };
}

export function opportunityByNodeId(
  state: StarPathResourceState,
  nodeId: string,
): { placed: (typeof state.placedNodes)[0]; candidate: (typeof state.resourcesById)[string] } | null {
  const placed = state.placedNodes.find((n) => n.nodeId === nodeId);
  if (!placed) return null;
  const candidate = state.resourcesById[placed.candidateId];
  if (!candidate) return null;
  return { placed, candidate };
}
