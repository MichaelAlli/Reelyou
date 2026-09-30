import { useRouter } from 'expo-router';
import { memo, useMemo, useRef } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import {
  SkywriteOwnerSkySnapshotPanel,
  connectionStatusForExploreOwner,
} from '@/components/skywrite/SkywriteOwnerSkySnapshotPanel';
import { MySkyCopy } from '@/constants/mySkyCopy';
import { Fonts, Spacing } from '@/constants/theme';
import { currentUser } from '@/data/mockData';
import {
  EXPLORE_DEMO_OWNER_IDS,
  EXPLORE_DEMO_PROFILES,
  isExploreDemoOwnerId,
} from '@/explore/exploreDemoSkies';
import type { NearbySkyAnchor } from '@/mySky/buildNearbySkies';
import { useReelyouConnect } from '@/connect/ReelyouConnectProvider';
import { useOnboarding } from '@/onboarding';
import { resolveSkyConnectionActivities } from '@/mySky/skyConnectionSources';
import { FindFamiliarSkiesCopy } from '@/constants/findFamiliarSkiesCopy';
import { isExploreDemoContentEnabled } from '@/config/betaReleaseFlags';
import { PeopleYouMayKnowSection } from '@/friendDiscovery/components/PeopleYouMayKnowSection';

interface MySkyExploreScrollFeedProps {
  nearbyAnchors: readonly NearbySkyAnchor[];
  bottomInset: number;
  initialScrollOffsetY?: number;
  onScrollOffsetChange?: (offsetY: number) => void;
}

function displayName(userId: string): string {
  if (userId === currentUser.id) return currentUser.name;
  if (isExploreDemoOwnerId(userId)) return EXPLORE_DEMO_PROFILES[userId].name;
  return 'Sky friend';
}

function MySkyExploreScrollFeedComponent({
  nearbyAnchors,
  bottomInset,
  initialScrollOffsetY = 0,
  onScrollOffsetChange,
}: MySkyExploreScrollFeedProps) {
  const scrollRef = useRef<ScrollView>(null);
  const router = useRouter();
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
    const demo = isExploreDemoContentEnabled()
      ? EXPLORE_DEMO_OWNER_IDS.filter((id) => !connectedSet.has(id)).map((ownerId) => ({
          ownerId,
          kind: 'demo' as const,
        }))
      : [];
    const suggested = nearbyAnchors
      .filter(
        (anchor) =>
          anchor.tier === 'explore' &&
          !connectedSet.has(anchor.ownerId) &&
          !isExploreDemoOwnerId(anchor.ownerId),
      )
      .slice(0, 3)
      .map((anchor) => ({
        ownerId: anchor.ownerId,
        kind: 'suggested' as const,
      }));
    return [...connected, ...demo, ...suggested];
  }, [listFollowingUserIds, nearbyAnchors]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    onScrollOffsetChange?.(event.nativeEvent.contentOffset.y);
  };

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.scroll}
      contentContainerStyle={[styles.content, { paddingBottom: bottomInset }]}
      showsVerticalScrollIndicator={false}
      scrollEventThrottle={32}
      onScroll={handleScroll}
      contentOffset={{ x: 0, y: initialScrollOffsetY }}
      nestedScrollEnabled>
      <PeopleYouMayKnowSection />
      <Pressable
        style={styles.findPeopleLink}
        onPress={() => router.push('/onboarding/find-familiar-skies?from=settings' as never)}>
        <Text style={styles.findPeopleLinkText}>{FindFamiliarSkiesCopy.exploreEntry}</Text>
      </Pressable>
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
  findPeopleLink: { alignSelf: 'center', marginBottom: Spacing.sm },
  findPeopleLinkText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: 'rgba(232, 200, 114, 0.65)',
  },
});
