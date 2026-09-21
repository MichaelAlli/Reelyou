import type { StarPathGuidanceSafeInputs } from '@/starpath/starpathGuidanceInputs';

/** Safe context bundle for future live AI — no weights or raw history dumps. */
export interface StarPathFutureAiContext {
  recentExplicitInterests: string[];
  elevatedBranches: string[];
  activeFocus: string | null;
  newlyRevealedNodes: string[];
  savedItems: string[];
  milestoneIds: string[];
  dismissedNodeIds: string[];
}

export function buildStarPathFutureAiContext(inputs: StarPathGuidanceSafeInputs): StarPathFutureAiContext {
  return {
    recentExplicitInterests: inputs.recentExplicitInterests,
    elevatedBranches: inputs.elevatedBranchIds,
    activeFocus: inputs.todayFocusText,
    newlyRevealedNodes: inputs.newlyRevealedNodeIds,
    savedItems: inputs.savedNodeIds,
    milestoneIds: inputs.activeMilestoneIds,
    dismissedNodeIds: inputs.dismissedNodeIds,
  };
}

export interface StarPathFutureAiGuideAdapter {
  /** Future: optional live phrasing — must not receive internal sifting tables. */
  composeGuideMessage?: (context: StarPathFutureAiContext) => Promise<string | null>;
}

export const STARPATH_FUTURE_AI_ADAPTER: StarPathFutureAiGuideAdapter = {};
