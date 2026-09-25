import type { TodayFocusSource } from '@/onboarding/personalization/todayFocus/types';

export type FocusRecommendationType =
  | 'saved_thread'
  | 'reflection'
  | 'skywrite'
  | 'contribution'
  | 'learning'
  | 'application'
  | 'starpath_step'
  | 'opportunity'
  | 'connected_sky'
  | 'community'
  | 'legacy_moment'
  | 'guide_prompt'
  | 'internal_resource'
  | 'external_resource'
  | 'emerging_constellation';

export type FocusRecommendationPrivacyScope = 'owner_only' | 'connected_skies' | 'public_safe';

export type FocusRecommendationConfidenceBand = 'low' | 'medium' | 'high';

export type FocusRecommendationVisualHint =
  | 'reflection'
  | 'starpath'
  | 'person'
  | 'contribution'
  | 'community'
  | 'opportunity'
  | 'resource'
  | 'learning'
  | 'saved';

export type FocusRecommendationFeedback = 'helpful' | 'not_for_me';

/** Canonical durable focus instance for a calendar day — extends persisted TodayFocusRecord. */
export interface TodayFocusSession {
  id: string;
  userId: string;
  text: string;
  source: TodayFocusSource;
  relatedSkyAreaIds: string[];
  relatedStarPathIds: string[];
  activeDate: string;
  createdAt: number;
  status: 'active' | 'dismissed' | 'completed';
  dismissedAt?: number;
  completedAt?: number;
  selectedSuggestionId?: string;
  whatHelpWouldBeUseful?: string;
}

export interface FocusContext {
  contextId: string;
  userId: string;
  focusId: string;
  focusText: string;
  selectedSuggestionId?: string;
  explicitSkyAreaIds: string[];
  relatedStarPathIds: string[];
  northStarContext?: string;
  recentReflectionIds: string[];
  savedThreadIds: string[];
  learningIds: string[];
  applicationIds: string[];
  contributionContextIds: string[];
  connectedSkyUserIds: string[];
  joinedCommunityIds: string[];
  opportunityContextIds: string[];
  signalProvenanceIds: string[];
  createdAt: number;
}

export interface FocusRecommendation {
  id: string;
  userId: string;
  focusId: string;
  type: FocusRecommendationType;
  title: string;
  summary: string;
  whyRelevant: string;
  sourceType: string;
  sourceId?: string;
  destination: string;
  relatedSkyAreaIds: string[];
  relatedStarPathIds: string[];
  privacyScope: FocusRecommendationPrivacyScope;
  confidenceBand: FocusRecommendationConfidenceBand;
  createdAt: number;
  expiresAt?: number;
  provenanceIds: string[];
  visualHint: FocusRecommendationVisualHint;
  dismissedAt?: number;
  openedAt?: number;
  savedAt?: number;
  feedback?: FocusRecommendationFeedback;
  /** Internal ranking score — never exposed in UI contract. */
  rankScore?: number;
}

export interface FocusRecommendationSession {
  id: string;
  focusId: string;
  userId: string;
  generatedAt: number;
  recommendationIds: string[];
  contextSnapshotId: string;
  status: 'active' | 'expired' | 'refreshed';
  focusTextFingerprint: string;
  /** Bumps when Focus or explicit refresh invalidates cached session. */
  generationToken?: number;
  contextVersion?: string;
}

export interface FocusRecommendationUiItem {
  id: string;
  type: FocusRecommendationType;
  title: string;
  summary: string;
  whyRelevant: string;
  actionLabel: string;
  destination: string;
  visualHint: FocusRecommendationVisualHint;
  privacyScope: FocusRecommendationPrivacyScope;
}

/** Frontend-ready response — ranking logic stays separate from presentation. */
export interface TodayFocusGuideResponse {
  focus: Pick<TodayFocusSession, 'id' | 'text' | 'source' | 'activeDate'>;
  messageFromGuide: string;
  transparencyNote: string;
  recommendations: FocusRecommendationUiItem[];
  emptyState?: string;
  refineFocusHint?: string;
}

export const FOCUS_RECOMMENDATION_MAX = 5;
export const FOCUS_RECOMMENDATION_MIN_SCORE = 0.42;
