import { GUIDANCE_STABILITY, STARPATH_GUIDANCE_VERSION } from '@/starpath/starpathGuidanceConfig';
import { guideBodyForType, nextStepTitleForType } from '@/starpath/starpathGuidanceCopy';
import type { StarPathGuidanceSafeInputs } from '@/starpath/starpathGuidanceInputs';
import type {
  StarPathGuidePresentation,
  StarPathGuideReasonCode,
  StarPathGuidanceState,
  StarPathNextStepPresentation,
} from '@/starpath/starpathGuidanceTypes';

export interface ComputeGuidanceOptions {
  now?: number;
  previous?: StarPathGuidanceState;
  explicitPulse?: boolean;
}

export interface StarPathGuidanceOutput {
  guide: StarPathGuidePresentation | null;
  nextStep: StarPathNextStepPresentation;
  state: StarPathGuidanceState;
}

function stableMessageId(type: string, sourceIds: string[]): string {
  return `guide-${type}-${sourceIds.slice(0, 3).join('_') || 'none'}`;
}

function stableStepId(type: string, sourceIds: string[]): string {
  return `step-${type}-${sourceIds.slice(0, 3).join('_') || 'none'}`;
}

function isSnoozed(state: StarPathGuidanceState, messageId: string, now: number): boolean {
  const until = state.guideSnoozedUntil[messageId];
  return typeof until === 'number' && until > now;
}

function isDismissed(state: StarPathGuidanceState, messageId: string): boolean {
  return state.guideDismissedIds.includes(messageId);
}

function focusAlignsBranch(focus: string | null, branchId: string): boolean {
  if (!focus) return false;
  const f = focus.toLowerCase();
  const keywords: Record<string, string[]> = {
    learning: ['learn', 'study', 'read', 'skill'],
    relationships: ['relationship', 'friend', 'family', 'love', 'connect'],
    growth: ['grow', 'change', 'habit', 'goal'],
    community: ['community', 'belong', 'group', 'together'],
  };
  const list = keywords[branchId] ?? [];
  return list.some((k) => f.includes(k));
}

function pickCandidateGuide(
  inputs: StarPathGuidanceSafeInputs,
  state: StarPathGuidanceState,
  now: number,
): StarPathGuidePresentation | null {
  const candidates: StarPathGuidePresentation[] = [];

  const interestId = [...inputs.recentExplicitInterests, ...inputs.selectedNodeIds].find(
    (id) => !inputs.dismissedNodeIds.includes(id),
  );
  if (interestId) {
    candidates.push({
      messageId: stableMessageId('branch_connection', [interestId]),
      type: 'branch_connection',
      body: guideBodyForType('branch_connection'),
      reasonCodes: ['marked_interesting'],
      sourceIds: [interestId],
    });
  }

  const oppId = inputs.primaryOpportunityCandidateId;
  if (
    oppId &&
    inputs.opportunityGuideEscalation &&
    !inputs.dismissedOpportunityIds.includes(oppId)
  ) {
    if (inputs.timeSensitiveOpportunityId === oppId) {
      candidates.unshift({
        messageId: stableMessageId('time_sensitive_opportunity', [oppId]),
        type: 'time_sensitive_opportunity',
        body: guideBodyForType('time_sensitive_opportunity'),
        reasonCodes: ['upcoming_deadline'],
        sourceIds: [inputs.primaryOpportunityNodeId ?? oppId],
      });
    } else {
      candidates.splice(1, 0, {
        messageId: stableMessageId('undiscovered_opportunity', [oppId]),
        type: 'undiscovered_opportunity',
        body: guideBodyForType('undiscovered_opportunity'),
        reasonCodes: ['undiscovered_along_path'],
        sourceIds: [inputs.primaryOpportunityNodeId ?? oppId],
      });
    }
  } else if (oppId && !inputs.dismissedOpportunityIds.includes(oppId)) {
    candidates.splice(1, 0, {
      messageId: stableMessageId('opportunity_notice', [oppId]),
      type: 'opportunity_notice',
      body: guideBodyForType('opportunity_notice'),
      reasonCodes: ['new_possibility'],
      sourceIds: [inputs.primaryOpportunityNodeId ?? oppId],
    });
  }

  const emerged = inputs.newlyRevealedNodeIds.find((id) => !inputs.dismissedNodeIds.includes(id));
  if (emerged) {
    candidates.push({
      messageId: stableMessageId('emergence_notice', [emerged]),
      type: 'emergence_notice',
      body: guideBodyForType('emergence_notice'),
      reasonCodes: ['new_possibility'],
      sourceIds: [emerged],
    });
  }

  const savedId = inputs.savedNodeIds.find((id) => !inputs.dismissedNodeIds.includes(id));
  const savedFresh =
    inputs.latestSavedAt != null && now - inputs.latestSavedAt < GUIDANCE_STABILITY.savedRevisitMinAgeMs;
  if (savedId && !savedFresh) {
    candidates.push({
      messageId: stableMessageId('revisit_saved', [savedId]),
      type: 'revisit_saved',
      body: guideBodyForType('revisit_saved'),
      reasonCodes: ['saved_connected'],
      sourceIds: [savedId],
    });
  }

  const exploreId = inputs.unresolvedExplorationIds.find((id) => !inputs.dismissedNodeIds.includes(id));
  if (exploreId) {
    candidates.push({
      messageId: stableMessageId('continue_exploration', [exploreId]),
      type: 'continue_exploration',
      body: guideBodyForType('continue_exploration'),
      reasonCodes: ['explored_related'],
      sourceIds: [exploreId],
    });
  }

  const branchId = inputs.elevatedBranchIds[0];
  if (branchId) {
    candidates.push({
      messageId: stableMessageId('branch_connection', [branchId]),
      type: 'branch_connection',
      body: 'You’ve spent time here lately. Want to go deeper?',
      reasonCodes: ['branch_pattern'],
      sourceIds: [branchId],
    });
  }

  if (branchId && focusAlignsBranch(inputs.todayFocusText, branchId)) {
    candidates.push({
      messageId: stableMessageId('focus_alignment', [branchId]),
      type: 'focus_alignment',
      body: guideBodyForType('focus_alignment'),
      reasonCodes: ['focus_alignment'],
      sourceIds: [branchId],
    });
  }

  const milestoneId = inputs.activeMilestoneIds[0];
  if (milestoneId) {
    candidates.push({
      messageId: stableMessageId('milestone_acknowledgement', [milestoneId]),
      type: 'milestone_acknowledgement',
      body: guideBodyForType('milestone_acknowledgement'),
      reasonCodes: ['milestone_shape'],
      sourceIds: [milestoneId],
    });
  }

  for (const c of candidates) {
    if (isDismissed(state, c.messageId)) continue;
    if (isSnoozed(state, c.messageId, now)) continue;
    return c;
  }

  return {
    messageId: stableMessageId('peace_state', []),
    type: 'peace_state',
    body: guideBodyForType('peace_state'),
    reasonCodes: ['peace'],
    sourceIds: [],
  };
}

function pickNextStep(
  inputs: StarPathGuidanceSafeInputs,
  guide: StarPathGuidePresentation | null,
): StarPathNextStepPresentation {
  if (
    guide &&
    (guide.type === 'time_sensitive_opportunity' || guide.type === 'undiscovered_opportunity') &&
    guide.sourceIds[0]
  ) {
    const copy = nextStepTitleForType('review_opportunity');
    return {
      stepId: stableStepId('review_opportunity', guide.sourceIds),
      type: 'review_opportunity',
      title: copy.title,
      actionLabel: copy.actionLabel,
      sourceIds: guide.sourceIds,
    };
  }
  if (inputs.timeSensitiveOpportunityId && inputs.primaryOpportunityNodeId) {
    const copy = nextStepTitleForType('review_opportunity');
    return {
      stepId: stableStepId('review_opportunity', [inputs.primaryOpportunityNodeId]),
      type: 'review_opportunity',
      title: copy.title,
      actionLabel: copy.actionLabel,
      sourceIds: [inputs.primaryOpportunityNodeId],
    };
  }

  if (guide?.type === 'emergence_notice' && guide.sourceIds[0]) {
    const copy = nextStepTitleForType('explore_new_node');
    return {
      stepId: stableStepId('explore_new_node', guide.sourceIds),
      type: 'explore_new_node',
      title: copy.title,
      actionLabel: copy.actionLabel,
      sourceIds: guide.sourceIds,
    };
  }

  const unfinished = inputs.unresolvedExplorationIds[0] ?? inputs.recentExplicitInterests[0];
  if (unfinished) {
    const copy = nextStepTitleForType('continue_branch');
    return {
      stepId: stableStepId('continue_branch', [unfinished]),
      type: 'continue_branch',
      title: copy.title,
      actionLabel: copy.actionLabel,
      sourceIds: [unfinished],
    };
  }

  const emerged = inputs.newlyRevealedNodeIds.find((id) => !inputs.dismissedNodeIds.includes(id));
  if (emerged) {
    const copy = nextStepTitleForType('explore_new_node');
    return {
      stepId: stableStepId('explore_new_node', [emerged]),
      type: 'explore_new_node',
      title: copy.title,
      actionLabel: copy.actionLabel,
      sourceIds: [emerged],
    };
  }

  const saved = inputs.savedNodeIds[0];
  if (saved) {
    const copy = nextStepTitleForType('revisit_saved');
    return {
      stepId: stableStepId('revisit_saved', [saved]),
      type: 'revisit_saved',
      title: copy.title,
      actionLabel: copy.actionLabel,
      sourceIds: [saved],
    };
  }

  const branch = inputs.elevatedBranchIds[0];
  if (branch) {
    const copy = nextStepTitleForType('view_connection');
    return {
      stepId: stableStepId('view_connection', [branch]),
      type: 'view_connection',
      title: copy.title,
      actionLabel: copy.actionLabel,
      sourceIds: [branch],
    };
  }

  const milestone = inputs.activeMilestoneIds[0];
  if (milestone) {
    const copy = nextStepTitleForType('review_milestone');
    return {
      stepId: stableStepId('review_milestone', [milestone]),
      type: 'review_milestone',
      title: copy.title,
      actionLabel: copy.actionLabel,
      sourceIds: [milestone],
    };
  }

  if (inputs.todayFocusText) {
    const copy = nextStepTitleForType('reflect');
    return {
      stepId: stableStepId('reflect', ['focus']),
      type: 'reflect',
      title: copy.title,
      actionLabel: copy.actionLabel,
      sourceIds: [],
    };
  }

  const copy = nextStepTitleForType('no_step');
  return {
    stepId: stableStepId('no_step', []),
    type: 'no_step',
    title: copy.title,
    actionLabel: copy.actionLabel,
    sourceIds: [],
  };
}

export function computeStarPathGuidance(
  inputs: StarPathGuidanceSafeInputs,
  options: ComputeGuidanceOptions = {},
): StarPathGuidanceOutput {
  const now = options.now ?? Date.now();
  const previous = options.previous ?? {
    guidanceVersion: STARPATH_GUIDANCE_VERSION,
    activeGuideMessageId: null,
    activeGuideType: null,
    activeGuideSourceIds: [],
    activeGuideReasonCodes: [],
    guideDismissedIds: [],
    guideSnoozedUntil: {},
    activeNextStepId: null,
    activeNextStepType: null,
    nextStepSourceIds: [],
    lastGuidanceUpdateAt: 0,
    lastExplicitGuidanceAt: 0,
  };

  let guide = pickCandidateGuide(inputs, previous, now);

  const sameAsPrevious =
    guide &&
    previous.activeGuideMessageId === guide.messageId &&
    now - previous.lastGuidanceUpdateAt < GUIDANCE_STABILITY.passiveStabilityMs;

  if (sameAsPrevious && !options.explicitPulse) {
    guide = previous.activeGuideMessageId
      ? {
          messageId: previous.activeGuideMessageId,
          type: previous.activeGuideType!,
          body: guideBodyForType(previous.activeGuideType!),
          reasonCodes: previous.activeGuideReasonCodes as StarPathGuideReasonCode[],
          sourceIds: previous.activeGuideSourceIds,
        }
      : guide;
  }

  if (guide && isDismissed(previous, guide.messageId)) {
    guide = {
      messageId: stableMessageId('peace_state', []),
      type: 'peace_state',
      body: guideBodyForType('peace_state'),
      reasonCodes: ['peace'],
      sourceIds: [],
    };
  }

  let nextStep = pickNextStep(inputs, guide);
  if (
    previous.activeNextStepId === nextStep.stepId &&
    now - previous.lastGuidanceUpdateAt < GUIDANCE_STABILITY.passiveStabilityMs &&
    !options.explicitPulse
  ) {
    const copy = nextStepTitleForType(previous.activeNextStepType ?? 'no_step');
    nextStep = {
      stepId: previous.activeNextStepId!,
      type: previous.activeNextStepType ?? 'no_step',
      title: copy.title,
      actionLabel: copy.actionLabel,
      sourceIds: previous.nextStepSourceIds,
    };
  }

  const state: StarPathGuidanceState = {
    guidanceVersion: STARPATH_GUIDANCE_VERSION,
    activeGuideMessageId: guide?.messageId ?? null,
    activeGuideType: guide?.type ?? null,
    activeGuideSourceIds: guide?.sourceIds ?? [],
    activeGuideReasonCodes: guide?.reasonCodes ?? [],
    guideDismissedIds: previous.guideDismissedIds,
    guideSnoozedUntil: previous.guideSnoozedUntil,
    activeNextStepId: nextStep.stepId,
    activeNextStepType: nextStep.type,
    nextStepSourceIds: nextStep.sourceIds,
    lastGuidanceUpdateAt: options.explicitPulse || !sameAsPrevious ? now : previous.lastGuidanceUpdateAt,
    lastExplicitGuidanceAt: options.explicitPulse ? now : previous.lastExplicitGuidanceAt,
  };

  return { guide, nextStep, state };
}
