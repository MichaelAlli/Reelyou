import { deriveNodeUiState } from '@/starpath/starpathInteractionLogic';
import type { StarPathInteractionSignal } from '@/starpath/starpathInteractionTypes';
import type { StarPathDynamicWorldState } from '@/starpath/starpathDynamicWorldTypes';
import type { StarPathSiftingState } from '@/starpath/starpathSiftingTypes';

/** Safe structured inputs for guidance — no scores or weights. */
export interface StarPathGuidanceSafeInputs {
  elevatedBranchIds: string[];
  recentExplicitInterests: string[];
  selectedNodeIds: string[];
  savedNodeIds: string[];
  dismissedNodeIds: string[];
  emergenceCandidateIds: string[];
  newlyRevealedNodeIds: string[];
  activeMilestoneIds: string[];
  unresolvedExplorationIds: string[];
  todayFocusText: string | null;
  /** Latest save timestamp for revisit pacing. */
  latestSavedAt: number | null;
  primaryOpportunityNodeId: string | null;
  primaryOpportunityCandidateId: string | null;
  timeSensitiveOpportunityId: string | null;
  opportunityGuideEscalation: boolean;
  dismissedOpportunityIds: string[];
}

export function buildGuidanceSafeInputs(
  signals: StarPathInteractionSignal[],
  sifting: StarPathSiftingState,
  dynamicWorld: StarPathDynamicWorldState,
  dynamicRecentlyEmergedIds: string[],
  todayFocusText?: string | null,
  opportunityContext?: Partial<
    Pick<
      StarPathGuidanceSafeInputs,
      | 'primaryOpportunityNodeId'
      | 'primaryOpportunityCandidateId'
      | 'timeSensitiveOpportunityId'
      | 'opportunityGuideEscalation'
      | 'dismissedOpportunityIds'
    >
  >,
): StarPathGuidanceSafeInputs {
  const dismissedNodeIds = sifting.guideSummary.dismissedNodeIds;

  const selectedNodeIds = signals
    .filter((s) => !s.reversed && s.interactionType === 'selected')
    .map((s) => s.nodeId)
    .filter((id) => !dismissedNodeIds.includes(id));

  const savedNodeIds = signals
    .filter((s) => !s.reversed && s.interactionType === 'saved')
    .map((s) => s.nodeId)
    .filter((id) => !dismissedNodeIds.includes(id));

  const recentExplicitInterests = sifting.guideSummary.recentExplicitInterests.filter(
    (id) => !dismissedNodeIds.includes(id),
  );

  const unresolvedExplorationIds = signals
    .filter((s) => !s.reversed && s.interactionType === 'explored')
    .sort((a, b) => b.timestamp - a.timestamp)
    .map((s) => s.nodeId)
    .filter((id) => {
      if (dismissedNodeIds.includes(id)) return false;
      const ui = deriveNodeUiState(id, signals);
      return ui === 'explored' || ui === 'viewed';
    });

  const newlyRevealedNodeIds = dynamicRecentlyEmergedIds.filter((id) => {
    const node = dynamicWorld.nodes.find((n) => n.id === id);
    if (!node) return false;
    return !dismissedNodeIds.includes(node.sourceId);
  });

  const activeMilestoneIds = dynamicWorld.milestones
    .filter((m) => m.status === 'visible')
    .map((m) => m.id);

  const latestSaved = signals
    .filter((s) => !s.reversed && s.interactionType === 'saved')
    .sort((a, b) => b.timestamp - a.timestamp)[0];

  return {
    elevatedBranchIds: sifting.guideSummary.elevatedBranchIds,
    recentExplicitInterests,
    selectedNodeIds,
    savedNodeIds,
    dismissedNodeIds,
    emergenceCandidateIds: sifting.guideSummary.emergenceCandidateIds.filter(
      (id) => !dismissedNodeIds.includes(id),
    ),
    newlyRevealedNodeIds,
    activeMilestoneIds,
    unresolvedExplorationIds: [...new Set(unresolvedExplorationIds)],
    todayFocusText: todayFocusText?.trim() || null,
    latestSavedAt: latestSaved?.timestamp ?? null,
    primaryOpportunityNodeId: opportunityContext?.primaryOpportunityNodeId ?? null,
    primaryOpportunityCandidateId: opportunityContext?.primaryOpportunityCandidateId ?? null,
    timeSensitiveOpportunityId: opportunityContext?.timeSensitiveOpportunityId ?? null,
    opportunityGuideEscalation: opportunityContext?.opportunityGuideEscalation ?? false,
    dismissedOpportunityIds: opportunityContext?.dismissedOpportunityIds ?? [],
  };
}
