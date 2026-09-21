/** User-facing reason codes for “Why this?” — never internal math. */
export type StarPathGuideReasonCode =
  | 'marked_interesting'
  | 'explored_related'
  | 'saved_connected'
  | 'new_possibility'
  | 'branch_pattern'
  | 'focus_alignment'
  | 'milestone_shape'
  | 'upcoming_deadline'
  | 'undiscovered_along_path'
  | 'peace';

export type StarPathGuideMessageType =
  | 'emergence_notice'
  | 'opportunity_notice'
  | 'time_sensitive_opportunity'
  | 'undiscovered_opportunity'
  | 'revisit_saved'
  | 'continue_exploration'
  | 'branch_connection'
  | 'reflection_prompt'
  | 'milestone_acknowledgement'
  | 'focus_alignment'
  | 'peace_state';

export type StarPathNextStepType =
  | 'explore_new_node'
  | 'review_opportunity'
  | 'revisit_saved'
  | 'continue_branch'
  | 'reflect'
  | 'view_connection'
  | 'review_milestone'
  | 'no_step';

export interface StarPathGuidePresentation {
  messageId: string;
  type: StarPathGuideMessageType;
  body: string;
  reasonCodes: StarPathGuideReasonCode[];
  sourceIds: string[];
}

export interface StarPathNextStepPresentation {
  stepId: string;
  type: StarPathNextStepType;
  title: string;
  actionLabel: string;
  sourceIds: string[];
}

export interface StarPathGuidanceState {
  guidanceVersion: string;
  activeGuideMessageId: string | null;
  activeGuideType: StarPathGuideMessageType | null;
  activeGuideSourceIds: string[];
  activeGuideReasonCodes: StarPathGuideReasonCode[];
  guideDismissedIds: string[];
  guideSnoozedUntil: Record<string, number>;
  activeNextStepId: string | null;
  activeNextStepType: StarPathNextStepType | null;
  nextStepSourceIds: string[];
  lastGuidanceUpdateAt: number;
  lastExplicitGuidanceAt: number;
}

export const EMPTY_GUIDANCE_STATE: StarPathGuidanceState = {
  guidanceVersion: 'beta-v1',
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
