/** Explicit user interaction signals — ready for future sifting/math (no scores here). */

export type StarPathInteractionType =
  | 'viewed'
  | 'explored'
  | 'interested'
  | 'dismissed'
  | 'saved'
  | 'selected';

export type StarPathInteractionSource = 'node_detail' | 'node_tap' | 'discovery' | 'guide' | 'next_step';

export interface StarPathInteractionSignal {
  id: string;
  nodeId: string;
  branchId: string;
  interactionType: StarPathInteractionType;
  timestamp: number;
  source: StarPathInteractionSource;
  /** When true, user explicitly reversed a prior choice (e.g. undismiss). */
  reversed?: boolean;
}

/** Derived UI-facing state — not shown as raw labels in product copy. */
export type StarPathNodeUiState =
  | 'neutral'
  | 'viewed'
  | 'explored'
  | 'interested'
  | 'saved'
  | 'selected'
  | 'dismissed';

export interface StarPathInteractionSnapshot {
  version: number;
  signals: StarPathInteractionSignal[];
  /** Soft discovery highlights — node ids to pulse briefly. */
  softHighlightNodeIds: string[];
  activeBranchIds: string[];
}

export const EMPTY_STARPATH_INTERACTIONS: StarPathInteractionSnapshot = {
  version: 1,
  signals: [],
  softHighlightNodeIds: [],
  activeBranchIds: [],
};
