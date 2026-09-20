/** Internal relevance / sifting outputs — never shown as raw scores in UI. */

export type RelevanceReasonCode =
  | 'explicit_interest'
  | 'explicit_selection'
  | 'saved_by_user'
  | 'recent_exploration'
  | 'passive_view'
  | 'dismissed_by_user'
  | 'repeated_theme_engagement'
  | 'branch_affinity'
  | 'related_to_selected_branch'
  | 'recency_boost'
  | 'repetition_boost';

export type RelevanceBand = 'suppressed' | 'low' | 'normal' | 'elevated' | 'high';

export interface NodeRelevanceResult {
  nodeId: string;
  relevanceScore: number;
  relevanceBand: RelevanceBand;
  reasons: RelevanceReasonCode[];
  updatedAt: number;
}

export interface BranchAffinityEntry {
  branchId: string;
  categoryId: string;
  relevance: number;
  supportingSignals: string[];
  lastUpdated: number;
}

export interface ThemeAffinityEntry {
  themeId: string;
  relevance: number;
  engagementCount: number;
  lastUpdated: number;
}

export interface EmergenceCandidate {
  candidateId: string;
  nodeId: string;
  branchId: string;
  categoryId: string;
  eligibilityScore: number;
  reasonCodes: RelevanceReasonCode[];
}

export interface StarPathGuideSummary {
  elevatedBranchIds: string[];
  recentExplicitInterests: string[];
  dismissedNodeIds: string[];
  emergenceCandidateIds: string[];
}

export interface StarPathNextStepHints {
  highestExplicitInterestNodeId: string | null;
  elevatedBranchId: string | null;
  recentSavedNodeId: string | null;
  unresolvedExplorationNodeId: string | null;
}

export interface StarPathSiftingState {
  engineVersion: string;
  nodeRelevance: Record<string, NodeRelevanceResult>;
  branchAffinity: Record<string, BranchAffinityEntry>;
  themeAffinity: Record<string, ThemeAffinityEntry>;
  emergenceCandidates: EmergenceCandidate[];
  lastCalculatedAt: number;
  guideSummary: StarPathGuideSummary;
  nextStepHints: StarPathNextStepHints;
}
