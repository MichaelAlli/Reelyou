import type { AroundYourSkyDisplayItem } from '@/social/aroundYourSky/types';

export function filterHomeFeedBlockedActors(
  items: readonly AroundYourSkyDisplayItem[],
  blockedUserIds: readonly string[],
  limitedUserIds: readonly string[],
): AroundYourSkyDisplayItem[] {
  return items.filter((item) => {
    if (!item.actorId) return true;
    if (blockedUserIds.includes(item.actorId)) return false;
    if (limitedUserIds.includes(item.actorId) && item.type === 'connection') return false;
    return true;
  });
}

export function isInteractionBlocked(
  actorUserId: string,
  blockedUserIds: readonly string[],
): boolean {
  return blockedUserIds.includes(actorUserId);
}
