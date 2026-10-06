/** PROFILE 02 — Public / Visitor profile — same visual foundation as Owner / Me. */
import { ImageBackground } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomNav } from '@/components/BottomNav';
import { OwnerProfileHero } from '@/components/profile/owner/OwnerProfileHero';
import { OwnerProfileRelationshipCountsRow } from '@/components/profile/owner/OwnerProfileRelationshipCountsRow';
import { OwnerProfileMetricsStrip } from '@/components/profile/owner/OwnerProfileMetricsStrip';
import { OwnerProfileMySkyPreviewCard } from '@/components/profile/owner/OwnerProfileMySkyPreviewCard';
import { OwnerProfileSkywritingsCard } from '@/components/profile/owner/OwnerProfileSkywritingsCard';
import { OwnerProfileTopChrome } from '@/components/profile/owner/OwnerProfileTopChrome';
import { RippleMetricDetailSheet } from '@/components/legacy/ripple/RippleMetricDetailSheet';
import { VisitorProfileMutualConnectionsRow } from '@/components/profile/visitor/VisitorProfileMutualConnectionsRow';
import { OwnerProfileVisitorActionRow } from '@/components/profile/owner/OwnerProfileVisitorActionRow';
import {
  OWNER_PROFILE_CARD_RADIUS,
  OWNER_PROFILE_HORIZONTAL_INSET,
  OWNER_PROFILE_PANEL_BORDER,
  OWNER_PROFILE_SECTION_GAP,
} from '@/components/profile/owner/ownerProfileLayout';
import { ModerationReportSheet } from '@/components/safety/ModerationReportSheet';
import { EmotionAiCopy } from '@/constants/emotionAiCopy';
import { useReelyouConnect } from '@/connect/ReelyouConnectProvider';
import { resolveActiveUserId } from '@/auth/resolveActiveUserId';
import { useReelyouAuth } from '@/auth/ReelyouAuthProvider';
import { Fonts, TabBarHeight } from '@/constants/theme';
import { buildPublicSkyView } from '@/mySky/buildPublicSkyView';
import { resolveOrbitOwnerSkywrites } from '@/profile/orbitProfileSkywriteFixtures';
import { isSharedSocialPersistenceEnabled } from '@/social/sharedSocialApi';
import { fetchAuthorSkywritesFromServer } from '@/social/sharedSkywriteApi';
import { cacheRemoteSkywrites } from '@/social/sharedSkywriteCache';
import { resolveSkyConnectionActivities } from '@/mySky/skyConnectionSources';
import {
  buildRippleMetricDetailView,
  type RippleMetricDetailKind,
} from '@/legacy/buildRippleMetricDetails';
import { resolveVisitorMetricDetailEligible } from '@/legacy/legacyViewerAccess';
import { useSubjectRippleViewModel } from '@/legacy/useSubjectRippleViewModel';
import { useUserAvatar } from '@/identity/UserAvatarProvider';
import { buildVisitorProfileView } from '@/profile/buildVisitorProfileView';
import {
  visitorLegacyRoute,
} from '@/profile/visitorLegacyRoutes';
import {
  visitorSkywriteDetailRoute,
  visitorSkywritingsRoute,
} from '@/profile/visitorSkywritingsRoute';
import { useOnboarding } from '@/onboarding';
import { VISITOR_PROFILE_LEGACY_SUBTITLE } from '@/profile/profileLegacyCopy';
import { profileOwnerCelestialBackground } from '@/profile/profileOwnerAssets';
import { isVisitorProfileBlocked } from '@/profile/resolveVisitorProfilePrivacy';
import { resolveVisitorSkyConnectionStatus } from '@/social/skyFollow/resolveVisitorSkyConnection';
import {
  resolveDemoMutualConnectionCounts,
  resolveDemoMutualConnectionUserIds,
} from '@/profile/profileMutualConnectionsDemo';
import {
  buildProfileRelationshipCounts,
  listSharedConnectionUserIds,
} from '@/social/skyFollow/profileRelationshipCounts';
import type { VisitorPreviewAs } from '@/profile/visitorProfilePreview';
import { resolvePreviewConnectionStatus } from '@/profile/visitorProfilePreview';

interface VisitorProfileScreenProps {
  ownerId?: string;
  /** Owner viewing their own profile with visitor-safe UI (canonical route + preview=1). */
  visitorPreview?: boolean;
  previewAccessMode?: VisitorPreviewAs;
}

export function VisitorProfileScreen({
  ownerId,
  visitorPreview = false,
  previewAccessMode,
}: VisitorProfileScreenProps) {
  const router = useRouter();
  const { user: authUser } = useReelyouAuth();
  const sessionOwnerId = resolveActiveUserId(authUser) ?? '';
  const insets = useSafeAreaInsets();
  const tabContentInset = TabBarHeight + Math.max(insets.bottom, 8);
  const { aroundYourSkyFeed, skywrites, northStar } = useOnboarding();
  const [metricKind, setMetricKind] = useState<RippleMetricDetailKind | null>(null);
  const rippleSubject = ownerId ?? '';
  const {
    ownerUserId,
    metrics,
    contributions,
    userDirectory,
    blockedUserIds,
    viewerContext,
  } = useSubjectRippleViewModel(rippleSubject, { visitorPreview });
  const {
    canMessageUser,
    openOrCreateThreadWith,
    followedSkyUserIds,
    isFollowingSkyUser,
    toggleFollowSky,
    messages,
    skyFollowGraph,
    isMutualSkyFriend,
    submitModerationReport,
    blockUser,
    limitUser,
  } = useReelyouConnect();
  const { profilePhotoDisplayUri } = useUserAvatar();
  const [safetyMenuOpen, setSafetyMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [remoteSkyFetchTick, setRemoteSkyFetchTick] = useState(0);

  useEffect(() => {
    if (!ownerId || !isSharedSocialPersistenceEnabled()) return;
    let mounted = true;
    void fetchAuthorSkywritesFromServer(ownerId).then((posts) => {
      if (!mounted || posts.length === 0) return;
      cacheRemoteSkywrites(ownerId, posts);
      setRemoteSkyFetchTick((n) => n + 1);
    });
    return () => {
      mounted = false;
    };
  }, [ownerId]);

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
    if (visitorPreview && previewAccessMode) {
      return resolvePreviewConnectionStatus(previewAccessMode);
    }
    return resolveVisitorSkyConnectionStatus(ownerId, feedConnectedActorIds, followedSkyUserIds);
  }, [
    feedConnectedActorIds,
    followedSkyUserIds,
    ownerId,
    previewAccessMode,
    visitorPreview,
  ]);

  const visitorView = useMemo(() => {
    if (!ownerId) return null;
    return buildVisitorProfileView({
      ownerId,
      viewerId: sessionOwnerId,
      connectionStatus,
      followGraph: skyFollowGraph,
      blockedUserIds: messages.blockedUserIds,
      ownerSkywrites: ownerId ? resolveOrbitOwnerSkywrites(ownerId) : [],
      previewAccessMode: visitorPreview ? previewAccessMode ?? 'public' : undefined,
    });
  }, [
    connectionStatus,
    messages.blockedUserIds,
    ownerId,
    previewAccessMode,
    remoteSkyFetchTick,
    skyFollowGraph,
    visitorPreview,
    profilePhotoDisplayUri,
  ]);

  const metricsDetailEligible = visitorView
    ? resolveVisitorMetricDetailEligible(visitorView.skyVisibility.skyVisibility, viewerContext)
    : false;

  const metricDetailView = useMemo(() => {
    if (!metricKind || !ownerId) return null;
    return buildRippleMetricDetailView({
      kind: metricKind,
      ownerUserId,
      metrics,
      contributions,
      userDirectory,
      blockedUserIds,
      mode: 'visitor',
      viewerContext,
      skywrites,
    });
  }, [
    blockedUserIds,
    contributions,
    metricKind,
    metrics,
    ownerId,
    ownerUserId,
    skywrites,
    userDirectory,
    viewerContext,
  ]);

  const relationshipCounts = useMemo(() => {
    if (!ownerId) {
      return {
        connectedSkies: 0,
        followedSkies: 0,
        skyFollowing: 0,
        mutualConnectionsWithViewer: 0,
      };
    }
    const demoCounts = resolveDemoMutualConnectionCounts(ownerId);
    if (demoCounts) return demoCounts;
    return buildProfileRelationshipCounts({
      graph: skyFollowGraph,
      profileOwnerId: ownerId,
      viewerId: sessionOwnerId,
      isOwnProfile: false,
    });
  }, [ownerId, skyFollowGraph]);

  const mutualConnectionIds = useMemo(() => {
    if (!ownerId) return [];
    const demoIds = resolveDemoMutualConnectionUserIds(ownerId, messages.blockedUserIds);
    if (demoIds.length > 0) return demoIds;
    return listSharedConnectionUserIds(skyFollowGraph, ownerId, sessionOwnerId).filter(
      (id) => !messages.blockedUserIds.includes(id),
    );
  }, [messages.blockedUserIds, ownerId, skyFollowGraph]);

  const publicSkyPreview = useMemo(() => {
    if (!ownerId || !visitorView?.showSkyPreview) return null;
    const northStarOverride =
      visitorPreview && ownerId === sessionOwnerId ? northStar.originalVision : undefined;
    const ownerSkywrites =
      ownerId === sessionOwnerId ? skywrites : resolveOrbitOwnerSkywrites(ownerId);
    return buildPublicSkyView(
      ownerId,
      connectionStatus,
      undefined,
      northStarOverride,
      ownerSkywrites,
    );
  }, [
    connectionStatus,
    northStar.originalVision,
    ownerId,
    skywrites,
    visitorPreview,
    visitorView?.showSkyPreview,
  ]);

  const isBlocked = ownerId ? isVisitorProfileBlocked(ownerId, messages.blockedUserIds) : false;
  const isFollowing = ownerId ? isFollowingSkyUser(ownerId) : false;
  const isSkyFriend = ownerId ? isMutualSkyFriend(ownerId) : false;
  const followButtonLabel = isSkyFriend
    ? 'Connected Sky'
    : isFollowing
      ? 'Following'
      : 'Follow Sky';
  const canMessage = ownerId ? canMessageUser(ownerId) && !isBlocked : false;

  const handleBack = useCallback(() => {
    if (visitorPreview) {
      router.replace('/(tabs)/profile' as never);
      return;
    }
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(tabs)/home' as never);
  }, [router, visitorPreview]);

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
    if (ownerId === sessionOwnerId && !visitorPreview) {
      router.replace('/(tabs)/profile' as never);
    }
  }, [ownerId, router, visitorPreview]);

  if (ownerId === sessionOwnerId && !visitorPreview) {
    return null;
  }

  const hideVisitorActions =
    visitorPreview && ownerId === sessionOwnerId;

  if (!ownerId || !visitorView || isBlocked) {
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
          <OwnerProfileTopChrome
            variant="visitor"
            onBack={handleBack}
            onVisitorOverflow={
              hideVisitorActions ? undefined : () => setSafetyMenuOpen(true)
            }
          />
          <OwnerProfileHero identity={visitorView.identity} />
          {hideVisitorActions ? null : (
            <OwnerProfileVisitorActionRow
              isFollowing={isFollowing}
              followLabel={followButtonLabel}
              canMessage={canMessage}
              onFollowPress={handleFollow}
              onMessagePress={handleMessage}
            />
          )}
          <OwnerProfileMetricsStrip
            metrics={visitorView.metrics}
            legacyPressEnabled
            legacySubtitle={VISITOR_PROFILE_LEGACY_SUBTITLE}
            onLegacyPress={() => router.push(visitorLegacyRoute(ownerId) as never)}
            onLivesImpactedPress={
              metricsDetailEligible && visitorView.showImpactMetrics
                ? () => setMetricKind('lives')
                : undefined
            }
            onContributionsPress={
              metricsDetailEligible && visitorView.showImpactMetrics
                ? () => setMetricKind('contributions')
                : undefined
            }
            livesPressEnabled={metricsDetailEligible && visitorView.showImpactMetrics}
            contributionsPressEnabled={metricsDetailEligible && visitorView.showImpactMetrics}
          />
          {hideVisitorActions ? null : (
            <OwnerProfileRelationshipCountsRow
              counts={relationshipCounts}
              onPressFollowedSkies={() =>
                router.push(
                  `/sky-friends?tab=following&profileOwner=${encodeURIComponent(ownerId)}` as never,
                )
              }
              onPressSkyFollowing={() =>
                router.push(
                  `/sky-friends?tab=followers&profileOwner=${encodeURIComponent(ownerId)}` as never,
                )
              }
              belowRow={
                mutualConnectionIds.length > 0 ? (
                  <VisitorProfileMutualConnectionsRow
                    profileOwnerId={ownerId}
                    mutualIds={mutualConnectionIds}
                    onPress={() =>
                      router.push(
                        `/sky-friends?tab=shared&profileOwner=${encodeURIComponent(ownerId)}` as never,
                      )
                    }
                  />
                ) : null
              }
            />
          )}
          <RippleMetricDetailSheet
            visible={metricKind != null}
            view={metricDetailView}
            onClose={() => setMetricKind(null)}
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
          <OwnerProfileSkywritingsCard
            section={visitorView.skywritings}
            onExplorePress={() => router.push(visitorSkywritingsRoute(ownerId) as never)}
            onItemPress={(skywriteId) =>
              router.push(visitorSkywriteDetailRoute(skywriteId, ownerId) as never)
            }
          />
        </ScrollView>
      </View>
      <Modal
        visible={safetyMenuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setSafetyMenuOpen(false)}>
        <Pressable style={styles.menuBackdrop} onPress={() => setSafetyMenuOpen(false)} />
        <View style={styles.menuSheet}>
          <Pressable
            style={styles.menuRow}
            accessibilityRole="button"
            accessibilityLabel="Report profile"
            onPress={() => {
              setSafetyMenuOpen(false);
              setReportOpen(true);
            }}>
            <Text style={styles.menuRowText}>Report</Text>
          </Pressable>
          <Pressable
            style={styles.menuRow}
            accessibilityRole="button"
            accessibilityLabel="Block user"
            onPress={() => {
              if (!ownerId) return;
              setSafetyMenuOpen(false);
              Alert.alert(EmotionAiCopy.blockConfirmTitle, EmotionAiCopy.blockConfirmBody, [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Block',
                  style: 'destructive',
                  onPress: () => {
                    blockUser(ownerId);
                    handleBack();
                  },
                },
              ]);
            }}>
            <Text style={styles.menuRowText}>Block</Text>
          </Pressable>
          <Pressable
            style={styles.menuRow}
            accessibilityRole="button"
            accessibilityLabel="Limit user"
            onPress={() => {
              if (ownerId) limitUser(ownerId);
              setSafetyMenuOpen(false);
            }}>
            <Text style={styles.menuRowText}>Limit</Text>
          </Pressable>
        </View>
      </Modal>
      {ownerId ? (
        <ModerationReportSheet
          visible={reportOpen}
          onClose={() => setReportOpen(false)}
          title="Report profile"
          reportInput={{
            targetType: 'user',
            targetId: ownerId,
            targetOwnerUserId: ownerId,
            visibilityContext: 'visitor_profile',
            provenanceIds: [ownerId],
          }}
          onSubmit={submitModerationReport}
          followUp={{
            showBlock: true,
            showLimit: true,
            onBlock: () => blockUser(ownerId),
            onLimit: () => limitUser(ownerId),
          }}
        />
      ) : null}
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
  menuBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' },
  menuSheet: {
    position: 'absolute',
    right: 16,
    top: 96,
    backgroundColor: '#1A2240',
    borderRadius: 12,
    minWidth: 200,
    paddingVertical: 6,
  },
  menuRow: { minHeight: 48, justifyContent: 'center', paddingHorizontal: 16 },
  menuRowText: { fontFamily: Fonts.sans, fontSize: 14, color: '#FFF8F0' },
});
