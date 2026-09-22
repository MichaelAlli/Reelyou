/** PROFILE 02 — Public / Visitor profile — same visual foundation as Owner / Me. */
import { ImageBackground } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomNav } from '@/components/BottomNav';
import { OwnerProfileHero } from '@/components/profile/owner/OwnerProfileHero';
import { OwnerProfileMetricsStrip } from '@/components/profile/owner/OwnerProfileMetricsStrip';
import { OwnerProfileMySkyPreviewCard } from '@/components/profile/owner/OwnerProfileMySkyPreviewCard';
import { OwnerProfileSkywritingsCard } from '@/components/profile/owner/OwnerProfileSkywritingsCard';
import { OwnerProfileTopChrome } from '@/components/profile/owner/OwnerProfileTopChrome';
import { OwnerProfileVisitorActionRow } from '@/components/profile/owner/OwnerProfileVisitorActionRow';
import {
  OWNER_PROFILE_CARD_RADIUS,
  OWNER_PROFILE_HORIZONTAL_INSET,
  OWNER_PROFILE_PANEL_BORDER,
  OWNER_PROFILE_SECTION_GAP,
} from '@/components/profile/owner/ownerProfileLayout';
import { useReelyouConnect } from '@/connect/ReelyouConnectProvider';
import { currentUser } from '@/data/mockData';
import { Fonts, TabBarHeight } from '@/constants/theme';
import { buildPublicSkyView } from '@/mySky/buildPublicSkyView';
import { resolveSkyConnectionActivities } from '@/mySky/skyConnectionSources';
import { buildVisitorProfileView } from '@/profile/buildVisitorProfileView';
import { VISITOR_PROFILE_LEGACY_SUBTITLE } from '@/profile/profileLegacyCopy';
import { profileOwnerCelestialBackground } from '@/profile/profileOwnerAssets';
import { resolveVisitorSkyConnectionStatus } from '@/social/skyFollow/resolveVisitorSkyConnection';
import { useOnboarding } from '@/onboarding';

interface VisitorProfileScreenProps {
  ownerId?: string;
}

export function VisitorProfileScreen({ ownerId }: VisitorProfileScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tabContentInset = TabBarHeight + Math.max(insets.bottom, 8);
  const { aroundYourSkyFeed } = useOnboarding();
  const {
    canMessageUser,
    openOrCreateThreadWith,
    followedSkyUserIds,
    isFollowingSkyUser,
    toggleFollowSky,
    messages,
  } = useReelyouConnect();

  const connectionActivities = useMemo(
    () => resolveSkyConnectionActivities(aroundYourSkyFeed),
    [aroundYourSkyFeed],
  );

  const feedConnectedActorIds = useMemo(
    () => connectionActivities.map((entry) => entry.actorId),
    [connectionActivities],
  );

  const connectionStatus = useMemo(() => {
    if (!ownerId) return 'none' as const;
    return resolveVisitorSkyConnectionStatus(ownerId, feedConnectedActorIds, followedSkyUserIds);
  }, [feedConnectedActorIds, followedSkyUserIds, ownerId]);

  const visitorView = useMemo(() => {
    if (!ownerId) return null;
    return buildVisitorProfileView({ ownerId, connectionStatus });
  }, [connectionStatus, ownerId]);

  const publicSkyPreview = useMemo(() => {
    if (!ownerId || !visitorView?.showSkyPreview) return null;
    return buildPublicSkyView(ownerId, connectionStatus);
  }, [connectionStatus, ownerId, visitorView?.showSkyPreview]);

  const isBlocked = ownerId ? messages.blockedUserIds.includes(ownerId) : false;
  const isFollowing = ownerId ? isFollowingSkyUser(ownerId) : false;
  const canMessage = ownerId ? canMessageUser(ownerId) && !isBlocked : false;

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(tabs)/home' as never);
  }, [router]);

  const handleFollow = useCallback(() => {
    if (!ownerId || isBlocked) return;
    toggleFollowSky(ownerId);
  }, [isBlocked, ownerId, toggleFollowSky]);

  const handleMessage = useCallback(() => {
    if (!ownerId || !canMessage) return;
    const threadId = openOrCreateThreadWith(ownerId);
    if (threadId) router.push(`/messages/${threadId}` as never);
  }, [canMessage, openOrCreateThreadWith, ownerId, router]);

  useEffect(() => {
    if (ownerId === currentUser.id) {
      router.replace('/(tabs)/profile' as never);
    }
  }, [ownerId, router]);

  if (ownerId === currentUser.id) {
    return null;
  }

  if (!ownerId || !visitorView) {
    return (
      <View style={styles.root}>
        <ImageBackground
          source={profileOwnerCelestialBackground}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          contentPosition="top"
        />
        <View style={[styles.main, { paddingBottom: tabContentInset }]}>
          <OwnerProfileTopChrome variant="visitor" onBack={handleBack} />
          <View style={styles.fallback}>
            <Text style={styles.fallbackText}>Profile unavailable.</Text>
          </View>
        </View>
        <BottomNav />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ImageBackground
        source={profileOwnerCelestialBackground}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        contentPosition="top"
      />
      <View style={[styles.main, { paddingBottom: tabContentInset }]}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <OwnerProfileTopChrome variant="visitor" onBack={handleBack} />
          <OwnerProfileHero identity={visitorView.identity} />
          {!isBlocked ? (
            <OwnerProfileVisitorActionRow
              isFollowing={isFollowing}
              canMessage={canMessage}
              onFollowPress={handleFollow}
              onMessagePress={handleMessage}
            />
          ) : null}
          <OwnerProfileMetricsStrip
            metrics={visitorView.metrics}
            legacyPressEnabled={false}
            legacySubtitle={VISITOR_PROFILE_LEGACY_SUBTITLE}
          />
          {publicSkyPreview ? (
            <OwnerProfileMySkyPreviewCard
              view={publicSkyPreview}
              viewFullSkyHref={`/public-sky?id=${encodeURIComponent(ownerId)}`}
            />
          ) : (
            <View style={styles.skyUnavailable}>
              <Text style={styles.skyUnavailableTitle}>My Sky</Text>
              <Text style={styles.skyUnavailableBody}>
                This Sky is not visible from your current connection.
              </Text>
            </View>
          )}
          <OwnerProfileSkywritingsCard section={visitorView.skywritings} />
        </ScrollView>
      </View>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#05070A',
  },
  main: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 6,
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  fallbackText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: 'rgba(248, 244, 236, 0.72)',
  },
  skyUnavailable: {
    marginHorizontal: OWNER_PROFILE_HORIZONTAL_INSET,
    marginTop: OWNER_PROFILE_SECTION_GAP,
    borderRadius: OWNER_PROFILE_CARD_RADIUS,
    paddingHorizontal: 14,
    paddingVertical: 18,
    backgroundColor: 'rgba(10, 14, 34, 0.82)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: OWNER_PROFILE_PANEL_BORDER,
    gap: 6,
  },
  skyUnavailableTitle: {
    fontFamily: Fonts.serif,
    fontSize: 20,
    color: '#FFF8F0',
  },
  skyUnavailableBody: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    lineHeight: 17,
    color: 'rgba(248, 244, 236, 0.68)',
  },
});
