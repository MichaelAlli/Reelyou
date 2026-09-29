import { memo, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  SkywriteOwnerSkySnapshotPanel,
  connectionStatusForExploreOwner,
} from '@/components/skywrite/SkywriteOwnerSkySnapshotPanel';
import { MySkyCopy } from '@/constants/mySkyCopy';
import { Fonts, Spacing } from '@/constants/theme';
import { currentUser, orbitUsers } from '@/data/mockData';
import type { NearbySkyAnchor } from '@/mySky/buildNearbySkies';
import { useReelyouConnect } from '@/connect/ReelyouConnectProvider';
import { useOnboarding } from '@/onboarding';
import { resolveSkyConnectionActivities } from '@/mySky/skyConnectionSources';

interface MySkyExploreScrollFeedProps {
  nearbyAnchors: readonly NearbySkyAnchor[];
  bottomInset: number;
}

function displayName(userId: string): string {
  if (userId === currentUser.id) return currentUser.name;
  return orbitUsers.find((entry) => entry.id === userId)?.name ?? 'Sky friend';
}

function MySkyExploreScrollFeedComponent({
  nearbyAnchors,
  bottomInset,
}: MySkyExploreScrollFeedProps) {
  const { listFollowingUserIds } = useReelyouConnect();
  const { aroundYourSkyFeed, skywrites, communities, guidingLightView } = useOnboarding();

  const connectionActivities = useMemo(
    () => resolveSkyConnectionActivities(aroundYourSkyFeed),
    [aroundYourSkyFeed],
  );
  const connectedActorIds = useMemo(
    () => connectionActivities.map((entry) => entry.actorId),
    [connectionActivities],
  );

  const joinedCommunityIds = useMemo(
    () => communities.joined.map((entry) => entry.id),
    [communities.joined],
  );
  const guidanceActive = Boolean(guidingLightView.light?.title?.trim());

  const sections = useMemo(() => {
    const followingIds = listFollowingUserIds().filter((id) => id !== currentUser.id);
    const connected = followingIds.map((id) => ({
      ownerId: id,
      kind: 'connected' as const,
    }));
    const connectedSet = new Set(followingIds);
    const suggested = nearbyAnchors
      .filter((anchor) => anchor.tier === 'explore' && !connectedSet.has(anchor.ownerId))
      .slice(0, 6)
      .map((anchor) => ({
        ownerId: anchor.ownerId,
        kind: 'suggested' as const,
      }));
    return [...connected, ...suggested];
  }, [listFollowingUserIds, nearbyAnchors]);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, { paddingBottom: bottomInset }]}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled>
      {sections.map((section) => (
        <SkywriteOwnerSkySnapshotPanel
          key={section.ownerId}
          ownerId={section.ownerId}
          displayName={displayName(section.ownerId)}
          kind={section.kind}
          connectionStatus={connectionStatusForExploreOwner(
            section.ownerId,
            connectedActorIds,
          )}
          ownerSkywrites={section.ownerId === currentUser.id ? skywrites : undefined}
          joinedCommunityIds={joinedCommunityIds}
          guidanceActive={guidanceActive}
        />
      ))}
      {sections.length === 0 ? (
        <Text style={styles.empty}>{MySkyCopy.exploreScrollEmpty}</Text>
      ) : null}
      <Text style={styles.footerNote}>{MySkyCopy.exploreScrollFooter}</Text>
    </ScrollView>
  );
}

export const MySkyExploreScrollFeed = memo(MySkyExploreScrollFeedComponent);

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: Spacing.md, paddingTop: Spacing.sm, gap: Spacing.lg },
  empty: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(248,244,236,0.75)',
    textAlign: 'center',
    marginTop: 24,
  },
  footerNote: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: 'rgba(248,244,236,0.45)',
    textAlign: 'center',
    marginTop: 8,
  },
});
