import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ContributionBeaconIndicator } from '@/components/focused-sky/ContributionBeaconIndicator';
import { ContributionBeaconQueueSheet } from '@/components/focused-sky/ContributionBeaconQueueSheet';
import { FocusedSkyQuickLauncher } from '@/components/focused-sky/FocusedSkyQuickLauncher';
import { MySkywritesIndicator } from '@/components/focused-sky/MySkywritesIndicator';
import { MySkywritesSheet } from '@/components/focused-sky/MySkywritesSheet';
import { HomeBackdrop } from '@/components/home/HomeBackdrop';
import { HomeHeaderLogo } from '@/components/home/HomeHeaderLogo';
import { MySkyRenderer } from '@/components/my-sky/MySkyRenderer';
import { MySkyStarInteractionOverlay } from '@/components/my-sky/MySkyStarInteractionOverlay';
import { SkywriteToSkyTransition } from '@/components/my-sky/SkywriteToSkyTransition';
import { BottomNav } from '@/components/BottomNav';
import { CelestialArrivalMotion } from '@/constants/celestialMotion';
import { Fonts, Spacing, TabBarHeight } from '@/constants/theme';
import { applyArrivalHighlight } from '@/mySky/mySkyState';
import { useOnboarding } from '@/onboarding';
import { useContributionBeaconOverlayQueue } from '@/skywrite/beacon/useActiveContributionBeacons';
import { consumeReturnToSkyInvitationsAfterResponse } from '@/skywrite/invitations/skyInvitationFlow';
import { stageFocusedSkywriteComposeStars } from '@/skywrite/focusedSkyComposeSnapshot';
import { useSharedSky } from '@/sharedSky/useSharedSky';
import { buildFocusedSkywriteFocusCandidates } from '@/spatialFocus/adapters/mySkyStarFocusAdapter';
import { SpatialFocusHost } from '@/spatialFocus/SpatialFocusHost';

/** LOCKED FOCUSED SKYWRITE SKY — canonical shared Sky view; preserve stars, launcher, and arrival overlay flow unless explicitly authorized. */
/** LOCKED NAV 01 SKYWRITE INTEGRATION — preserve existing stars, scrolling, launcher, arrival, constellation, and tap/detail systems. */
export function FocusedSkywriteScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const {
    communities,
    skywrites,
    guidingLightView,
    mySkyView,
    skyArrivalHandoff,
    setSkyArrivalHandoff,
    clearSkyArrivalHandoff,
    triggerConstellationReveal,
    constellationRevealCount,
    constellationRevealActive,
    constellationRevealPatternId,
    completeConstellationReveal,
  } = useOnboarding();
  const joinedCommunityIds = useMemo(
    () => communities.joined.map((entry) => entry.id),
    [communities.joined],
  );
  const guidanceActive = Boolean(guidingLightView.light);
  const { focusedView, setScrollOffsetY } = useSharedSky();
  const [spatialFocusBlocked, setSpatialFocusBlocked] = useState(false);
  const [beaconSheetOpen, setBeaconSheetOpen] = useState(false);
  const [beaconQueueIndex, setBeaconQueueIndex] = useState(0);
  const [invitationResponseAck, setInvitationResponseAck] = useState(false);
  const [mySkywritesOpen, setMySkywritesOpen] = useState(false);
  const activeContributionBeacons = useContributionBeaconOverlayQueue();

  useFocusEffect(
    useCallback(() => {
      if (!consumeReturnToSkyInvitationsAfterResponse()) return;
      setInvitationResponseAck(true);
      setBeaconSheetOpen(true);
    }, []),
  );

  const panelHeight = Math.min(Math.round(height * 0.72), 620);
  const regionCount = Math.min(
    3,
    Math.max(1, 1 + (focusedView?.joinedGroups.length ? 1 : 0) + (focusedView?.peaceState ? 0 : 1)),
  );

  const arrivalOverlayActive = skyArrivalHandoff?.skywriteStatus === 'animating';
  const arrivalLandingPhase = skyArrivalHandoff?.skywriteStatus === 'landed';
  const freezeStarField =
    (arrivalOverlayActive || arrivalLandingPhase) &&
    Boolean(skyArrivalHandoff?.renderStarsSnapshot);

  const displayView = useMemo(() => {
    const snapshot = skyArrivalHandoff?.renderStarsSnapshot;
    if (freezeStarField && snapshot) {
      return { ...mySkyView, stars: snapshot };
    }
    if (!skyArrivalHandoff?.skyNodeId) return mySkyView;
    return {
      ...mySkyView,
      stars: applyArrivalHighlight(mySkyView.stars, skyArrivalHandoff.skyNodeId),
    };
  }, [
    freezeStarField,
    mySkyView,
    skyArrivalHandoff?.renderStarsSnapshot,
    skyArrivalHandoff?.skyNodeId,
  ]);

  const suppressConstellationFx = arrivalOverlayActive || arrivalLandingPhase;

  const openComposer = useCallback(() => {
    stageFocusedSkywriteComposeStars(mySkyView.stars);
    router.push('/skywrite/compose' as never);
  }, [mySkyView.stars, router]);

  const openMySky = useCallback(() => {
    router.push('/(tabs)/sky' as never);
  }, [router]);

  const handleArrivalComplete = useCallback(() => {
    if (!skyArrivalHandoff) return;
    setSkyArrivalHandoff({
      ...skyArrivalHandoff,
      skywriteStatus: 'landed',
    });
    const landingPauseMs = CelestialArrivalMotion.starBreathDelayMs;
    setTimeout(() => {
      triggerConstellationReveal();
      clearSkyArrivalHandoff();
    }, landingPauseMs);
  }, [clearSkyArrivalHandoff, setSkyArrivalHandoff, skyArrivalHandoff, triggerConstellationReveal]);

  const launcherBottom = TabBarHeight + Math.max(insets.bottom, Spacing.sm) + 8;
  const canvasWidth = width - Spacing.sm * 2;

  return (
    <View style={styles.root}>
      <HomeBackdrop />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <HomeHeaderLogo />
          <Text style={styles.title}>Your Skywrite Sky</Text>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: launcherBottom + 56 },
          ]}
          showsVerticalScrollIndicator={false}
          onScroll={(event) => setScrollOffsetY(event.nativeEvent.contentOffset.y)}
          scrollEventThrottle={32}>
          {Array.from({ length: regionCount }).map((_, index) => (
            <View
              key={`sky-region-${index}`}
              style={[
                styles.canvas,
                {
                  height: panelHeight,
                  marginTop: index === 0 ? 0 : Spacing.sm,
                },
              ]}>
              <SpatialFocusHost
                layoutWidth={canvasWidth}
                layoutHeight={panelHeight}
                hintSurface={index === 0 ? 'skywrite' : undefined}
                disabled={
                  index !== 0 ||
                  arrivalOverlayActive ||
                  arrivalLandingPhase ||
                  spatialFocusBlocked
                }
                candidates={
                  index === 0
                    ? buildFocusedSkywriteFocusCandidates({
                        stars: displayView.stars,
                        identityStar: displayView.identityStar,
                        includeIdentity: true,
                        layoutWidth: canvasWidth,
                        layoutHeight: panelHeight,
                      })
                    : []
                }>
                <View
                  style={[
                    styles.parallax,
                    { transform: [{ translateY: index * -12 }] },
                  ]}>
                  <MySkyRenderer
                    view={displayView}
                    mode="resting"
                    highlightStarId={
                      index === 0 && !arrivalOverlayActive && !arrivalLandingPhase && skyArrivalHandoff?.skyNodeId
                        ? skyArrivalHandoff.skyNodeId
                        : null
                    }
                    constellationRevealCount={
                      suppressConstellationFx ? 0 : constellationRevealCount
                    }
                    constellationRevealActive={
                      suppressConstellationFx ? false : constellationRevealActive
                    }
                    revealPatternId={suppressConstellationFx ? null : constellationRevealPatternId}
                    onConstellationRevealComplete={completeConstellationReveal}
                  />
                </View>
                <MySkyStarInteractionOverlay
                  layoutWidth={canvasWidth}
                  layoutHeight={panelHeight}
                  view={displayView}
                  skywrites={skywrites}
                  joinedCommunityIds={joinedCommunityIds}
                  guidanceActive={guidanceActive}
                  showIdentityStar={index === 0}
                  allowTapDuringGesture
                  onSpatialFocusBlockingChange={
                    index === 0 ? setSpatialFocusBlocked : undefined
                  }
                />
              </SpatialFocusHost>
            </View>
          ))}

          <PressableSkyExplore onPress={openMySky} />
        </ScrollView>
      </SafeAreaView>

      <View style={[styles.launcherDock, { bottom: launcherBottom }]} pointerEvents="box-none">
        <View style={styles.quickAccessRow}>
          <MySkywritesIndicator onPress={() => setMySkywritesOpen(true)} />
          {activeContributionBeacons.length > 0 ? (
            <ContributionBeaconIndicator
              count={activeContributionBeacons.length}
              onPress={() => setBeaconSheetOpen(true)}
            />
          ) : (
            <View style={styles.quickAccessSpacer} />
          )}
        </View>
        <FocusedSkyQuickLauncher onPress={openComposer} />
      </View>

      <ContributionBeaconQueueSheet
        visible={beaconSheetOpen}
        queue={activeContributionBeacons}
        initialIndex={beaconQueueIndex}
        onIndexChange={setBeaconQueueIndex}
        onClose={() => setBeaconSheetOpen(false)}
        responseSentAck={invitationResponseAck}
        onClearResponseSentAck={() => setInvitationResponseAck(false)}
      />

      <MySkywritesSheet visible={mySkywritesOpen} onClose={() => setMySkywritesOpen(false)} />

      {arrivalOverlayActive ? (
        <View style={styles.arrivalOverlay} pointerEvents="none">
          <SkywriteToSkyTransition presentation="overlay" onComplete={handleArrivalComplete} />
        </View>
      ) : null}

      <BottomNav />
    </View>
  );
}

function PressableSkyExplore({ onPress }: { onPress: () => void }) {
  return (
    <Text accessibilityRole="button" onPress={onPress} style={styles.exploreLink}>
      Explore full My Sky
    </Text>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#05070A',
  },
  safe: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: Spacing.sm,
    paddingBottom: 4,
    gap: 4,
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 20,
    color: '#FFF8F0',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.sm,
  },
  canvas: {
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232, 200, 114, 0.18)',
    backgroundColor: 'rgba(4, 6, 16, 0.35)',
  },
  parallax: {
    flex: 1,
  },
  launcherDock: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 20,
  },
  quickAccessRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  quickAccessSpacer: {
    width: 44,
    height: 44,
  },
  arrivalOverlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 50,
  },
  exploreLink: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
    textAlign: 'center',
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: 'rgba(232, 200, 114, 0.72)',
  },
});
