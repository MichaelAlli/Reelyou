import { canViewSkywrite } from '@/skywrite/access/canViewSkywrite';
import { isFollowingSkyUser } from '@/social/skyFollow/skyFollowLogic';
import type { SkyFollowGraph } from '@/social/skyFollow/skyFollowTypes';
import type { Privacy } from '@/types';

import type { StarSemantic, StarSemanticFrontendPayload } from '@/starSemantic/starSemanticTypes';
import { buildStarSemanticFrontendPayload } from '@/starSemantic/deriveStarSemantic';

/** Filter access first — no semantic leak for inaccessible content. */
export function canExposeStarSemanticToViewer(input: {
  viewerId: string;
  authorId: string;
  visibility: Privacy;
  followGraph: SkyFollowGraph;
  blockedUserIds: readonly string[];
}): boolean {
  if (input.viewerId === input.authorId) return true;
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

export function exposeStarSemanticForViewer(
  semantic: StarSemantic,
  input: {
    viewerId: string;
    authorId: string;
    followGraph: SkyFollowGraph;
    blockedUserIds: readonly string[];
  },
): StarSemanticFrontendPayload | null {
  const allowed = canExposeStarSemanticToViewer({
    viewerId: input.viewerId,
    authorId: input.authorId,
    visibility: semantic.visibilityScope,
    followGraph: input.followGraph,
    blockedUserIds: input.blockedUserIds,
  });
  if (!allowed) return null;
  return buildStarSemanticFrontendPayload(semantic);
}
