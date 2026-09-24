import type { SkyAreaCategoryId } from '@/skyAreas/skyAreaCategory';

export type LegacyMomentSourceType =
  | 'impact_event'
  | 'application_evidence'
  | 'learning_evidence'
  | 'ripple_event'
  | 'contribution';

export type LegacyMomentEventType =
  | 'growth'
  | 'turning_point'
  | 'contribution'
  | 'application'
  | 'impact'
  | 'ripple'
  | 'belonging'
  | 'hope'
  | 'support_received'
  | 'support_given'
  | 'starpath_milestone'
  | 'north_star_change'
  | 'community'
  | 'achievement';

export type LegacyMomentPrivacy = 'private' | 'public';

export type LegacyStoryDimension = 'becoming' | 'impact' | 'both';

export interface LegacyMediaRef {
  kind: 'photo' | 'audio' | 'photo_audio' | 'text';
  photoUri?: string;
  audioUri?: string;
  audioDurationMs?: number;
  /** Only when source content is still available — never for deleted sources. */
  textExcerpt?: string;
}

export interface LegacyPersonRef {
  userId: string;
  displayName: string;
}

/** Canonical Legacy moment — references evidence; does not duplicate full source objects. */
export interface LegacyMoment {
  legacyMomentId: string;
  ownerUserId: string;
  sourceType: LegacyMomentSourceType;
  sourceId: string;
  eventType: LegacyMomentEventType;
  occurredAt: number;
  title: string;
  shortSummary: string;
  mediaRefs?: LegacyMediaRef;
  peopleRefs?: LegacyPersonRef[];
  communityRefs?: string[];
  skyAreaId?: SkyAreaCategoryId | string;
  impactEventId?: string;
  contributionId?: string;
  rippleEventId?: string;
  applicationEvidenceId?: string;
  savedThreadId?: string;
  reflectionId?: string;
  sourceSkywriteId?: string;
  starPathRef?: string;
  privacy: LegacyMomentPrivacy;
  userApproved: boolean;
  userEdited: boolean;
  userHidden: boolean;
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
  dimension: LegacyStoryDimension;
  /** Ripple scenes use subtle lineage styling — not virality metrics. */
  rippleVisual?: 'origin' | 'downstream';
  sourceContentDeleted?: boolean;
}

export interface LegacyMomentOverride {
  title?: string;
  shortSummary?: string;
  sortOrder?: number;
  privacy?: LegacyMomentPrivacy;
  userHidden?: boolean;
  userEdited?: boolean;
  updatedAt?: number;
}

export interface LegacyUserState {
  momentOverrides: Record<string, LegacyMomentOverride>;
  reelReview: {
    userReviewed: boolean;
    hiddenMomentIds: string[];
    updatedAt: number;
  };
  updatedAt: number;
}

export const EMPTY_LEGACY_USER_STATE: LegacyUserState = {
  momentOverrides: {},
  reelReview: { userReviewed: false, hiddenMomentIds: [], updatedAt: 0 },
  updatedAt: 0,
};
