import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ContributionBeaconIndicator } from '@/components/focused-sky/ContributionBeaconIndicator';
import { ContributionBeaconQueueSheet } from '@/components/focused-sky/ContributionBeaconQueueSheet';
import { FocusedSkyQuickLauncher } from '@/components/focused-sky/FocusedSkyQuickLauncher';
import { MySkywritesIndicator } from '@/components/focused-sky/MySkywritesIndicator';
import { MySkywritesSheet } from '@/components/focused-sky/MySkywritesSheet';
import { PlaySkyCue } from '@/components/skywrite/PlaySkyCue';
import { SkywriteSkyOwnerHeader } from '@/components/skywrite/SkywriteSkyOwnerHeader';
import { primeWebAudioFromUserGesture } from '@/skywrite/media/skywriteWebAudioUnlock';
import { pushSkyreelPlay } from '@/skywrite/play/skyreelNavigation';
import { usePlaySkySequenceRegistry } from '@/skywrite/play/usePlaySkySequenceRegistry';
import { loadSkyHeaderStyleId } from '@/profile/skyHeaderStylePersistence';
import type { SkyHeaderStyleId } from '@/profile/skyHeaderStyleTypes';
import { SkywriteSequenceEditorSheet } from '@/components/skywrite/SkywriteSequenceEditorSheet';
import { SkywritePlayCopy } from '@/constants/skywritePlayCopy';
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
import {
  defaultFocusedSkywriteIds,
  resolveFocusedSkyPlaySteps,
} from '@/skywrite/play/skywritePlayLogic';
import { useSkywritePlaySequence } from '@/skywrite/play/useSkywritePlaySequence';
import { useSharedSky } from '@/sharedSky/useSharedSky';
import { buildFocusedSkywriteFocusCandidates } from '@/spatialFocus/adapters/mySkyStarFocusAdapter';
import { NavigationTipCallout } from '@/navigationTips/NavigationTipCallout';
import { navigationTipMessage } from '@/navigationTips/navigationTipsCopy';
import { useNavigationTip } from '@/navigationTips/useNavigationTip';
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
    setMySkyExploreEnabled,
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
  const [sequenceEditorOpen, setSequenceEditorOpen] = useState(false);
  const { state: playSequenceState, updateFocusedConfig } = useSkywritePlaySequence();
  const { registry, ready: registryReady } = usePlaySkySequenceRegistry();
  const [headerStyleId, setHeaderStyleId] = useState<SkyHeaderStyleId>('starlight');
  const activeContributionBeacons = useContributionBeaconOverlayQueue();

  useEffect(() => {
    void loadSkyHeaderStyleId(mySkyView.skyOwner.id).then(setHeaderStyleId);
  }, [mySkyView.skyOwner.id]);

  const canPlaySky = useMemo(() => {
    if (!registryReady) return false;
    const steps = resolveFocusedSkyPlaySteps(
      mySkyView.stars,
      skywrites,
      playSequenceState.focusedSky,
      playSequenceState.singleBySkywriteId,
      { playSkyRegistry: registry },
    );
    return steps.length > 0;
  }, [mySkyView.stars, playSequenceState, registry, registryReady, skywrites]);

  const hasSkywriteStars = useMemo(
    () => defaultFocusedSkywriteIds(mySkyView.stars, skywrites).length > 0,
    [mySkyView.stars, skywrites],
  );

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
  const skywriteNavTip = useNavigationTip(
    'skywrite_basics',
    !arrivalOverlayActive && !arrivalLandingPhase,
  );
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

  const openPlaySky = useCallback(() => {
    primeWebAudioFromUserGesture();
    pushSkyreelPlay(router, '/skywrite/play?scope=focused&autoplay=1');
  }, [router]);

  const openOwnerProfile = useCallback(() => {
    router.push('/(tabs)/profile' as never);
  }, [router]);

  const openMySky = useCallback(() => {
    setMySkyExploreEnabled(false);
    router.push('/(tabs)/sky' as never);
  }, [router, setMySkyExploreEnabled]);

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
          <SkywriteSkyOwnerHeader
            displayName={mySkyView.skyOwner.name}
            headerStyleId={headerStyleId}
            onPressProfile={openOwnerProfile}
            onPressIdentityStar={openOwnerProfile}
          />
          <Text style={styles.subtitle}>{SkywritePlayCopy.skySubtitle}</Text>
          <Text style={styles.hint}>{SkywritePlayCopy.playHint}</Text>
        </View>

        <PlaySkyCue
          onPress={() => {
            skywriteNavTip.dismissIfLearned();
            openPlaySky();
          }}
          disabled={!canPlaySky}
          disabledHint={SkywritePlayCopy.playSkyNoRecent}
          showEditSequence={hasSkywriteStars}
          onEditSequence={() => setSequenceEditorOpen(true)}
        />

        {skywriteNavTip.visible ? (
          <NavigationTipCallout
            compact
            message={navigationTipMessage('skywrite_basics')}
            onDismiss={skywriteNavTip.dismiss}
          />
        ) : null}

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: launcherBottom + 88 },
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
                bottomInset={index === 0 ? 72 : 0}
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
                  focusedSkywriteImmersiveTap={index === 0}
                  directIdentityProfileNavigation={index === 0}
                  suppressInsightPreview={index === 0}
                  onSpatialFocusBlockingChange={
                    index === 0 ? setSpatialFocusBlocked : undefined
                  }
                  onSkywriteStarOpened={index === 0 ? skywriteNavTip.dismissIfLearned : undefined}
                />
              </SpatialFocusHost>
            </View>
          ))}

          <PressableSkyExplore
            label={SkywritePlayCopy.exploreFullSkySelf}
            onPress={openMySky}
          />
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

      <SkywriteSequenceEditorSheet
        visible={sequenceEditorOpen}
        config={playSequenceState.focusedSky}
        onClose={() => setSequenceEditorOpen(false)}
        onChange={updateFocusedConfig}
      />

      {arrivalOverlayActive ? (
        <View style={styles.arrivalOverlay} pointerEvents="none">
          <SkywriteToSkyTransition presentation="overlay" onComplete={handleArrivalComplete} />
        </View>
      ) : null}

      <BottomNav />
    </View>
  );
}

function PressableSkyExplore({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={12}
      style={({ pressed }) => [styles.exploreLinkWrap, pressed && styles.exploreLinkPressed]}>
      <Text style={styles.exploreLink}>{label}</Text>
    </Pressable>
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
  subtitle: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(248,244,236,0.78)',
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  },
  hint: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    lineHeight: 16,
    color: 'rgba(248,244,236,0.52)',
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
    marginTop: 2,
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
  exploreLinkWrap: {
    alignSelf: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
    minHeight: 48,
    minWidth: 220,
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    zIndex: 4,
  },
  exploreLinkPressed: { opacity: 0.88 },
  exploreLink: {
    textAlign: 'center',
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(232, 200, 114, 0.85)',
    textDecorationLine: 'underline',
  },
});
