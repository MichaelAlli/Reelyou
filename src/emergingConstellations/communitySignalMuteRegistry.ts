const mutedCommunityIds = new Set<string>();

export function syncCommunityMuteRegistry(
  memberships: readonly {
    communityId: string;
    userId: string;
    status: string;
    notificationsMuted: boolean;
  }[],
  userId: string,
) {
  mutedCommunityIds.clear();
  for (const entry of memberships) {
    if (entry.userId !== userId) continue;
    if (entry.status === 'joined' && entry.notificationsMuted) {
      mutedCommunityIds.add(entry.communityId);
    }
  }
}

export function isCommunitySignalsMuted(communityId: string): boolean {
  return mutedCommunityIds.has(communityId);
}

export function clearCommunityMuteRegistryForTests(): void {
  mutedCommunityIds.clear();
}
