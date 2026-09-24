import { isFollowingSkyUser } from '@/social/skyFollow/skyFollowLogic';
import type { SkyFollowGraph } from '@/social/skyFollow/skyFollowTypes';
import { canViewSkywrite } from '@/skywrite/access/canViewSkywrite';
import type { Privacy } from '@/types';

export function resolveSkywriteViewerAccess(input: {
  viewerId: string;
  authorId: string;
  visibility: Privacy;
  followGraph: SkyFollowGraph;
  blockedUserIds: readonly string[];
}): boolean {
  return canViewSkywrite({
    viewerId: input.viewerId,
    authorId: input.authorId,
    visibility: input.visibility,
    viewerFollowsAuthor: isFollowingSkyUser(
      input.followGraph,
      input.viewerId,
      input.authorId,
    ),
    authorFollowsViewer: isFollowingSkyUser(
      input.followGraph,
      input.authorId,
      input.viewerId,
    ),
    viewerBlockedAuthor: input.blockedUserIds.includes(input.authorId),
  });
}
