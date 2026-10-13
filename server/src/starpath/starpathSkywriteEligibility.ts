import type { StoredSkywrite } from '../social/skywriteTypes.js';

export function isSkywriteEligibleForStarpathAi(post: StoredSkywrite): boolean {
  if (post.deletedAt) return false;
  if (post.visibility === 'private') return false;
  if (post.allowAIContext === false) return false;
  return true;
}

export function listSkywritesForStarpathAi(
  skywrites: readonly StoredSkywrite[],
  authorUserId: string,
): StoredSkywrite[] {
  return skywrites
    .filter((s) => s.authorUserId === authorUserId)
    .filter(isSkywriteEligibleForStarpathAi)
    .sort((a, b) => b.createdAt - a.createdAt);
}
