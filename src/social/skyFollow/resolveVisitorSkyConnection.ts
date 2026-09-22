import type { SkyConnectionStatus } from '@/mySky/skyIdentity';

/** Canonical visitor access — feed connections and Follow Sky both grant orbit-level access. */
export function resolveVisitorSkyConnectionStatus(
  userId: string,
  feedConnectedActorIds: string[],
  followedSkyUserIds: string[],
): SkyConnectionStatus {
  if (feedConnectedActorIds.includes(userId)) return 'connected';
  if (followedSkyUserIds.includes(userId)) return 'connected';
  return 'none';
}

export function isFollowingSky(userId: string, followedSkyUserIds: string[]): boolean {
  return followedSkyUserIds.includes(userId);
}
