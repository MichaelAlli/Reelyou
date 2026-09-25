import type {
  CommunityEncouragement,
  CommunityPost,
  CommunityPostReply,
} from '@/emergingConstellations/emergingConstellationTypes';
import { isModerationContentSuppressedSync } from '@/moderation/moderationContentRegistry';

export const FINITE_ACTIVITY_PAGE_SIZE = 8;

export function sortPostsNewestFirst(posts: readonly CommunityPost[]): CommunityPost[] {
  return [...posts].sort((a, b) => b.createdAt - a.createdAt);
}

export function visiblePostsForViewer(
  posts: readonly CommunityPost[],
  blockedUserIds: readonly string[],
): CommunityPost[] {
  return sortPostsNewestFirst(
    posts.filter(
      (post) =>
        post.moderationStatus === 'visible' &&
        !blockedUserIds.includes(post.authorUserId) &&
        !isModerationContentSuppressedSync('community_post', post.id),
    ),
  );
}

export function visibleRepliesForPost(
  replies: readonly CommunityPostReply[],
  postId: string,
  blockedUserIds: readonly string[],
): CommunityPostReply[] {
  return replies
    .filter(
      (reply) =>
        reply.postId === postId &&
        reply.moderationStatus === 'visible' &&
        !blockedUserIds.includes(reply.authorUserId) &&
        !isModerationContentSuppressedSync('reply', reply.id),
    )
    .sort((a, b) => a.createdAt - b.createdAt);
}

export function finiteActivitySlice(
  posts: readonly CommunityPost[],
  limit = FINITE_ACTIVITY_PAGE_SIZE,
): { items: CommunityPost[]; hasMore: boolean } {
  const sorted = sortPostsNewestFirst(posts);
  return {
    items: sorted.slice(0, limit),
    hasMore: sorted.length > limit,
  };
}

export function hasEncouraged(
  encouragements: readonly CommunityEncouragement[],
  targetType: 'post' | 'reply',
  targetId: string,
  fromUserId: string,
): boolean {
  return encouragements.some(
    (entry) =>
      entry.targetType === targetType &&
      entry.targetId === targetId &&
      entry.fromUserId === fromUserId,
  );
}

export function encouragementCountForTarget(
  encouragements: readonly CommunityEncouragement[],
  targetType: 'post' | 'reply',
  targetId: string,
): number {
  return encouragements.filter(
    (entry) => entry.targetType === targetType && entry.targetId === targetId,
  ).length;
}

export function postKindLabel(kind: CommunityPost['kind']): string {
  switch (kind) {
    case 'support_request':
      return 'Support request';
    case 'reflection':
      return 'Reflection';
    case 'contribution':
      return 'Perspective';
    case 'encouragement':
      return 'Encouragement';
    case 'question':
      return 'Question';
    case 'update':
      return 'Update';
    default:
      return 'Post';
  }
}
