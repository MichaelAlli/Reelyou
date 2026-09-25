import type { SkyAreaCategoryId } from '@/skyAreas/skyAreaCategory';

export type EmergingConstellationStatus = 'forming' | 'active' | 'archived';

export type CommunityMembershipStatus = 'suggested' | 'joined' | 'left' | 'removed' | 'banned';

export type CommunityMembershipRole = 'member' | 'moderator';

/** Internal signals — never expose scores or percentages to UI. */
export interface EmergingConstellationSignals {
  likeHeartedness: number;
  sharedSkyAreas: number;
  repeatedPatterns: number;
  compatibleNeeds: number;
  livedExperience: number;
  contributionBehavior: number;
  starPathAlignment: number;
  hashtagContext: number;
}

export interface EmergingConstellation {
  id: string;
  name: string;
  /** Short human purpose — what this space is for. */
  description: string;
  sharedTheme: string;
  primaryThemes: readonly string[];
  relatedSkyAreaIds: readonly (SkyAreaCategoryId | string)[];
  emergenceEvidenceIds: readonly string[];
  status: EmergingConstellationStatus;
  aiSuggested: boolean;
  humanExplanation: string;
  createdAt: number;
  updatedAt: number;
  signals: EmergingConstellationSignals;
}

export interface CommunityMembership {
  communityId: string;
  userId: string;
  status: CommunityMembershipStatus;
  role: CommunityMembershipRole;
  joinedAt: number | null;
  leftAt?: number | null;
  notificationsMuted: boolean;
}

export type CommunityPostKind =
  | 'reflection'
  | 'support_request'
  | 'contribution'
  | 'encouragement'
  | 'update'
  | 'question';

export interface CommunityPost {
  id: string;
  communityId: string;
  authorUserId: string;
  kind: CommunityPostKind;
  content: string;
  skywriteId?: string;
  moderationStatus: 'visible' | 'removed';
  createdAt: number;
}

export interface CommunityPostReply {
  id: string;
  communityId: string;
  postId: string;
  authorUserId: string;
  content: string;
  moderationStatus: 'visible' | 'removed';
  createdAt: number;
}

/** Lightweight support acknowledgment — not a popularity counter. */
export interface CommunityEncouragement {
  id: string;
  communityId: string;
  targetType: 'post' | 'reply';
  targetId: string;
  fromUserId: string;
  createdAt: number;
}

export interface CommunityMessage {
  id: string;
  communityId: string;
  authorUserId: string;
  body: string;
  replyToMessageId?: string;
  moderationStatus: 'visible' | 'removed';
  createdAt: number;
}
