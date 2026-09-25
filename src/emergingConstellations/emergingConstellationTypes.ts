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
  sharedTheme: string;
  relatedSkyAreaIds: readonly (SkyAreaCategoryId | string)[];
  status: EmergingConstellationStatus;
  aiSuggested: boolean;
  humanExplanation: string;
  createdAt: number;
  signals: EmergingConstellationSignals;
}

export interface CommunityMembership {
  communityId: string;
  userId: string;
  status: CommunityMembershipStatus;
  role: CommunityMembershipRole;
  joinedAt: number | null;
  notificationsMuted: boolean;
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
