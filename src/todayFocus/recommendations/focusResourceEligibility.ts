import type { FocusRecommendationPrivacyScope } from '@/todayFocus/recommendations/focusRecommendationTypes';
import { resolveSkywriteViewerAccess } from '@/skywrite/access/resolveSkywriteViewerAccess';
import type { SkyFollowGraph } from '@/social/skyFollow/skyFollowTypes';
import { isMutualSkyFriends } from '@/social/skyFollow/skyFollowLogic';
import type { SkywriteRecord } from '@/skywrite/types';

export interface FocusEligibilityContext {
  viewerUserId: string;
  blockedUserIds: readonly string[];
  followGraph: SkyFollowGraph;
  deletedSkywriteIds: readonly string[];
}

export function isUserBlocked(userId: string, ctx: FocusEligibilityContext): boolean {
  return ctx.blockedUserIds.includes(userId);
}

export function isSkywriteDeleted(skywriteId: string, ctx: FocusEligibilityContext): boolean {
  return ctx.deletedSkywriteIds.includes(skywriteId);
}

export function canRecommendSkywrite(
  skywrite: SkywriteRecord,
  ctx: FocusEligibilityContext,
): boolean {
  const authorId = skywrite.authorId ?? ctx.viewerUserId;
  if (isUserBlocked(authorId, ctx)) return false;
  if (isSkywriteDeleted(skywrite.id, ctx)) return false;
  return resolveSkywriteViewerAccess({
    viewerId: ctx.viewerUserId,
    authorId,
    visibility: skywrite.visibility,
    followGraph: ctx.followGraph,
    blockedUserIds: ctx.blockedUserIds,
  });
}

export function canRecommendConnectedSky(
  subjectUserId: string,
  ctx: FocusEligibilityContext,
): boolean {
  if (isUserBlocked(subjectUserId, ctx)) return false;
  return isMutualSkyFriends(ctx.followGraph, ctx.viewerUserId, subjectUserId);
}

export function privacyScopeForOwnerContent(): FocusRecommendationPrivacyScope {
  return 'owner_only';
}
