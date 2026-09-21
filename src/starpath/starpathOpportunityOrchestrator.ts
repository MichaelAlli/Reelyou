import type { StarPathGuidanceSafeInputs } from '@/starpath/starpathGuidanceInputs';
import type { UserSupportState } from '@/starpath/starpathEmotionalContextTypes';
import { discoverResourceCandidates, filterStaleAndUnverified } from '@/starpath/starpathResourceDiscoveryService';
import { organizeOpportunities } from '@/starpath/starpathOpportunityOrganizer';
import { siftOpportunityCandidates } from '@/starpath/starpathOpportunitySifting';
import type { StarPathResourceState } from '@/starpath/starpathOpportunityTypes';
import { computeAmbientSignals } from '@/starpath/starpathSignalEngine';
import type { StarPathSignalState } from '@/starpath/starpathSignalTypes';
import { OPPORTUNITY_ESCALATION } from '@/starpath/starpathResourceConfig';

export interface OpportunityOrchestratorInput {
  now: number;
  guidanceInputs: StarPathGuidanceSafeInputs;
  resourceState: StarPathResourceState;
  signalState: StarPathSignalState;
  supportState: UserSupportState;
  viewport: { scrollY: number; viewportHeight: number; paddingTop: number; contentBandHeight: number };
}

export interface OpportunityOrchestratorOutput {
  resourceState: StarPathResourceState;
  signalState: StarPathSignalState;
  primaryOpportunityNodeId: string | null;
  primaryOpportunityCandidateId: string | null;
  escalateGuideForOpportunity: boolean;
  timeSensitiveOpportunityId: string | null;
}

export async function runOpportunityOrchestrator(
  input: OpportunityOrchestratorInput,
): Promise<OpportunityOrchestratorOutput> {
  const discovery = await discoverResourceCandidates({
    now: input.now,
    inputs: input.guidanceInputs,
    elevatedBranchId: input.guidanceInputs.elevatedBranchIds[0] ?? null,
    todayFocusText: input.guidanceInputs.todayFocusText,
  });

  const filtered = filterStaleAndUnverified(discovery.candidates);
  const sifted = siftOpportunityCandidates(
    filtered,
    input.guidanceInputs,
    input.resourceState.dismissedResourceIds,
    input.now,
    input.resourceState.snoozedResourceUntil,
  );

  let resourceState = organizeOpportunities(sifted, {
    ...input.resourceState,
    providerStatus: discovery.providerStatus,
  }, input.now);

  const signalState = computeAmbientSignals({
    now: input.now,
    placedNodes: resourceState.placedNodes,
    resourcesById: resourceState.resourcesById,
    dismissedResourceIds: resourceState.dismissedResourceIds,
    viewportScrollY: input.viewport.scrollY,
    viewportHeight: input.viewport.viewportHeight,
    paddingTop: input.viewport.paddingTop,
    contentBandHeight: input.viewport.contentBandHeight,
    supportState: input.supportState,
    previous: input.signalState,
  });

  const primary = resourceState.placedNodes.find((n) => n.prominence === 'primary') ?? resourceState.placedNodes[0];
  const primaryResource = primary ? resourceState.resourcesById[primary.candidateId] : undefined;

  let escalateGuideForOpportunity = false;
  let timeSensitiveOpportunityId: string | null = null;

  if (primary && primaryResource) {
    const deadline = primaryResource.deadline ?? primaryResource.registrationDeadline;
    if (deadline && deadline - input.now <= OPPORTUNITY_ESCALATION.soonDeadlineMs) {
      timeSensitiveOpportunityId = primaryResource.id;
      escalateGuideForOpportunity = true;
    }
    const undiscovered =
      !primary.tracking.openedAt &&
      primary.tracking.surfacedAt &&
      input.now - primary.tracking.surfacedAt > OPPORTUNITY_ESCALATION.undiscoveredMentionAfterMs &&
      primary.tracking.guideMentionCount < OPPORTUNITY_ESCALATION.maxGuideMentionsPerOpportunity;
    if (undiscovered) escalateGuideForOpportunity = true;
  }

  const activeSignal = signalState.activeSignalIds
    .map((id) => signalState.signalsById[id])
    .find((s) => s?.guideEscalationEligible);
  if (activeSignal?.sourceOpportunityId) {
    escalateGuideForOpportunity = true;
  }

  if (input.supportState === 'overloaded') {
    escalateGuideForOpportunity = !!timeSensitiveOpportunityId;
  }

  return {
    resourceState,
    signalState,
    primaryOpportunityNodeId: primary?.nodeId ?? null,
    primaryOpportunityCandidateId: primary?.candidateId ?? null,
    escalateGuideForOpportunity,
    timeSensitiveOpportunityId,
  };
}
