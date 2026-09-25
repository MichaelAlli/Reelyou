import { createContext, useContext } from 'react';

import type {
  CommunityEncouragement,
  CommunityMembership,
  CommunityMessage,
  CommunityPost,
  CommunityPostKind,
  CommunityPostReply,
  EmergingConstellation,
} from '@/emergingConstellations/emergingConstellationTypes';

export interface EmergingConstellationsContextValue {
  ready: boolean;
  activeSuggestion: EmergingConstellation | null;
  dismissedSuggestionIds: readonly string[];
  memberships: readonly CommunityMembership[];
  postsByCommunity: Readonly<Record<string, readonly CommunityPost[]>>;
  repliesByPost: Readonly<Record<string, readonly CommunityPostReply[]>>;
  encouragements: readonly CommunityEncouragement[];
  /** @deprecated Prefer community posts — kept for legacy chat route. */
  messagesByCommunity: Readonly<Record<string, readonly CommunityMessage[]>>;
  resolveConstellation: (constellationId?: string | null) => EmergingConstellation | null;
  dismissSuggestion: (constellationId: string) => void;
  joinConstellation: (constellationId: string) => void;
  leaveConstellation: (constellationId: string) => void;
  muteConstellation: (constellationId: string, muted: boolean) => void;
  createPost: (communityId: string, content: string, kind?: CommunityPostKind) => string | null;
  createReply: (communityId: string, postId: string, content: string) => string | null;
  encourageTarget: (
    communityId: string,
    targetType: 'post' | 'reply',
    targetId: string,
  ) => boolean;
  sendMessage: (communityId: string, body: string, replyToMessageId?: string) => void;
  membershipFor: (communityId: string) => CommunityMembership | undefined;
  joinedMemberships: readonly CommunityMembership[];
  postById: (communityId: string, postId: string) => CommunityPost | undefined;
}

export const EmergingConstellationsContext =
  createContext<EmergingConstellationsContextValue | null>(null);

export function useEmergingConstellations(): EmergingConstellationsContextValue {
  const ctx = useContext(EmergingConstellationsContext);
  if (!ctx) {
    throw new Error('useEmergingConstellations must be used within EmergingConstellationsProvider');
  }
  return ctx;
}
