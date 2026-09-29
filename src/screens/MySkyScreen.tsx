/** LOCKED MY SKY EXPERIENCE — preserve approved visuals/interactions unless explicitly authorized. */
/** LOCKED NAV 01 MY SKY INTEGRATION — preserve pan/zoom, immersive exploration, direct taps, and current visuals. */
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HomeHeaderLogo } from '@/components/home/HomeHeaderLogo';
import { MySkyConstellationDetailSheet } from '@/components/my-sky/MySkyConstellationDetailSheet';
import { MySkyImmersiveToggleButton } from '@/components/my-sky/MySkyImmersiveToggleButton';
import { MySkyControlRow } from '@/components/my-sky/MySkyControlRow';
import { MySkyInsightOverlay } from '@/components/my-sky/MySkyInsightOverlay';
import { MySkyLayerControls } from '@/components/my-sky/MySkyLayerControls';
import { MySkyProximityCue } from '@/components/my-sky/MySkyProximityCue';
import { MySkyConstellationsCoachmark } from '@/components/my-sky/MySkyConstellationsCoachmark';
import { MySkyConstellationsControl } from '@/components/my-sky/MySkyConstellationsControl';
import { MySkyJoinedGroupsCoachmark } from '@/components/my-sky/MySkyJoinedGroupsCoachmark';
import { MySkyJoinedGroupsControl } from '@/components/my-sky/MySkyJoinedGroupsControl';
import { MySkyJoinedGroupsSheet } from '@/components/my-sky/MySkyJoinedGroupsSheet';
import { buildMySkyConstellationFormations } from '@/emergingConstellations/buildMySkyConstellationFormations';
import { MySkySearchSheet } from '@/components/my-sky/MySkySearchSheet';
import { MySkyExploreScrollFeed } from '@/components/my-sky/MySkyExploreScrollFeed';
import { MySkyStarCanvas } from '@/components/my-sky/MySkyStarCanvas';
import { MY_SKY_SECOND_ROW_LAYER_ORDER } from '@/constants/mySkyLayers';
import { MySkyCopy } from '@/constants/mySkyCopy';
import { HomePalette } from '@/constants/homeLayout';
import { SkyArrivalCopy } from '@/constants/skyArrivalCopy';
import { Fonts, Spacing, TabBarHeight } from '@/constants/theme';
import {
  buildConstellationDetailView,
  type ConstellationDetailView,
} from '@/mySky/buildConstellationDetailView';
import {
  findPatternById,
  findPatternForNodeId,
} from '@/mySky/buildConstellationIntelligence';
import { augmentMySkyEmergingConstellation } from '@/emergingConstellations/augmentMySkyEmergingConstellation';
import { devEmergingConstellationIfEligible } from '@/emergingConstellations/emergingConstellationFixtures';
import { isEmergingConstellationDiscoveryEligible } from '@/emergingConstellations/emergingConstellationDiscoveryEligibility';
import { useEmergingConstellations } from '@/emergingConstellations/EmergingConstellationsProvider';
import { anyJoinedGroupHasUnseenActivity } from '@/emergingConstellations/joinedGroupActivityPresentation';
import {
  loadJoinedGroupsNavigationPreference,
  saveJoinedGroupsNavigationPreference,
  type JoinedGroupsNavigationPreference,
  EMPTY_JOINED_GROUPS_NAV_PREFERENCE,
} from '@/emergingConstellations/joinedGroupsNavigationPreference';
import { listJoinedEmergingConstellations } from '@/emergingConstellations/listJoinedEmergingConstellations';
import { resolveEmergingConstellationRoute } from '@/emergingConstellations/resolveEmergingConstellationRoute';
import {
  buildNearbySkies,
  resolveJumpAnchor,
  type NearbySkyAnchor,
} from '@/mySky/buildNearbySkies';
import { buildSkySearchResults } from '@/mySky/skySearchSources';
import { computeSkyRegionContext } from '@/mySky/skyRegionContext';
import { pushStarNavigationTarget, resolveStarNavigation } from '@/mySky/resolveStarNavigation';
import type { MySkyStarDisplay } from '@/mySky/types';
import type { MySkyViewportSnapshot } from '@/mySky/mySkyViewportSession';
import { computeSkyProximity, viewportSnapshotForWorldPoint } from '@/mySky/skyProximity';
import { resolveSkyConnectionActivities } from '@/mySky/skyConnectionSources';
import {
  exploreResultCap,
  resolveEffectiveExploreEnabled,
} from '@/mySky/discoveryPreferencePolicy';
import { useReelyouConnect } from '@/connect/ReelyouConnectProvider';
import { NavigationTipCallout } from '@/navigationTips/NavigationTipCallout';
import { navigationTipMessage } from '@/navigationTips/navigationTipsCopy';
import { useNavigationTip } from '@/navigationTips/useNavigationTip';
import { useOnboarding } from '@/onboarding';

export function MySkyScreen() {
  const router = useRouter();
  const { preferences, signals, signalsMeta, presentHomeSignal } = useReelyouConnect();
  const { activeSuggestion, membershipFor, joinedMemberships, resolveConstellation } =
    useEmergingConstellations();
  const {
    mySkyView,
    toggleMySkyLayer,
    triggerConstellationReveal,
    constellationRevealCount,
    constellationRevealActive,
    constellationRevealPatternId,
    completeConstellationReveal,
    setMySkyLayerVisible,
    mySkyViewport,
    setMySkyViewport,
    mySkyExploreEnabled,
    setMySkyExploreEnabled,
    aroundYourSkyFeed,
    communities,
    skywrites,
    guidingLightView,
  } = useOnboarding();

  const [cleanSkyActive, setCleanSkyActive] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [joinedGroupsSheetVisible, setJoinedGroupsSheetVisible] = useState(false);
  const [constellationSkyViewActive, setConstellationSkyViewActive] = useState(false);
  const [constellationEmptyHintVisible, setConstellationEmptyHintVisible] = useState(false);
  const [joinedGroupsNavPref, setJoinedGroupsNavPref] =
    useState<JoinedGroupsNavigationPreference>(EMPTY_JOINED_GROUPS_NAV_PREFERENCE);
  const [joinedGroupsNavReady, setJoinedGroupsNavReady] = useState(false);

  const emergingSkyCommunityId = useMemo(() => {
    if (!isEmergingConstellationDiscoveryEligible(preferences)) return null;
    const canonical = devEmergingConstellationIfEligible();
    if (!canonical) return null;
    if (activeSuggestion?.id === canonical.id) return canonical.id;
    const joined = joinedMemberships.some(
      (entry) => entry.communityId === canonical.id && entry.status === 'joined',
    );
    return joined ? canonical.id : null;
  }, [activeSuggestion, joinedMemberships, preferences]);

  const displayMySkyView = useMemo(
    () => augmentMySkyEmergingConstellation(mySkyView, emergingSkyCommunityId),
    [emergingSkyCommunityId, mySkyView],
  );

  const { visibleLayers } = displayMySkyView.viewState;
  const northStarText = displayMySkyView.northStar.originalVision.trim();

  /** Same canonical joined list as EmergingConstellationScreen / provider `joinedMemberships`. */
  const joinedEmergingGroups = useMemo(
    () => listJoinedEmergingConstellations(joinedMemberships, resolveConstellation),
    [joinedMemberships, resolveConstellation],
  );

  const joinedEmergingGroupIds = useMemo(
    () => joinedEmergingGroups.map((group) => group.id),
    [joinedEmergingGroups],
  );

  const constellationFormations = useMemo(
    () =>
      buildMySkyConstellationFormations(
        activeSuggestion,
        joinedMemberships,
        resolveConstellation,
      ),
    [activeSuggestion, joinedMemberships, resolveConstellation],
  );

  const hasJoinedEmergingGroups = joinedMemberships.some((entry) => entry.status === 'joined');

  const joinedGroupsActivityHint = useMemo(
    () => anyJoinedGroupHasUnseenActivity(joinedEmergingGroupIds, signals, signalsMeta),
    [joinedEmergingGroupIds, signals, signalsMeta],
  );

  const showJoinedGroupsCoachmark =
    hasJoinedEmergingGroups &&
    joinedGroupsNavReady &&
    !joinedGroupsNavPref.hasSeenCoachmark &&
    !cleanSkyActive;

  const showConstellationsCoachmark =
    joinedGroupsNavReady &&
    !joinedGroupsNavPref.hasSeenConstellationsCoachmark &&
    !cleanSkyActive;

  useEffect(() => {
    let live = true;
    void loadJoinedGroupsNavigationPreference().then((loaded) => {
      if (live) {
        setJoinedGroupsNavPref(loaded);
        setJoinedGroupsNavReady(true);
      }
    });
    return () => {
      live = false;
    };
  }, []);

  const persistJoinedGroupsNavPref = useCallback((next: JoinedGroupsNavigationPreference) => {
    setJoinedGroupsNavPref(next);
    void saveJoinedGroupsNavigationPreference(next);
  }, []);

  const dismissJoinedGroupsCoachmark = useCallback(() => {
    if (joinedGroupsNavPref.hasSeenCoachmark) return;
    persistJoinedGroupsNavPref({ ...joinedGroupsNavPref, hasSeenCoachmark: true });
  }, [joinedGroupsNavPref, persistJoinedGroupsNavPref]);

  const openJoinedGroupsSheet = useCallback(() => {
    dismissJoinedGroupsCoachmark();
    const openCount = joinedGroupsNavPref.openCount + 1;
    persistJoinedGroupsNavPref({
      ...joinedGroupsNavPref,
      hasSeenCoachmark: true,
      openCount,
      compactModeEligible: openCount >= 3,
    });
    setJoinedGroupsSheetVisible(true);
  }, [dismissJoinedGroupsCoachmark, joinedGroupsNavPref, persistJoinedGroupsNavPref]);

  const closeJoinedGroupsSheet = useCallback(() => {
    setJoinedGroupsSheetVisible(false);
  }, []);

  const dismissConstellationsCoachmark = useCallback(() => {
    if (joinedGroupsNavPref.hasSeenConstellationsCoachmark) return;
    persistJoinedGroupsNavPref({
      ...joinedGroupsNavPref,
      hasSeenConstellationsCoachmark: true,
    });
  }, [joinedGroupsNavPref, persistJoinedGroupsNavPref]);

  const toggleConstellationSkyView = useCallback(() => {
    dismissConstellationsCoachmark();
    setConstellationSkyViewActive((previous) => !previous);
  }, [dismissConstellationsCoachmark]);

  useEffect(() => {
    setMySkyLayerVisible('constellations', constellationSkyViewActive);
  }, [constellationSkyViewActive, setMySkyLayerVisible]);

  useEffect(() => {
    if (!constellationSkyViewActive) {
      setConstellationEmptyHintVisible(false);
      return;
    }
    if (constellationFormations.length === 0) {
      setConstellationEmptyHintVisible(true);
      return;
    }
    setConstellationEmptyHintVisible(false);
  }, [constellationFormations.length, constellationSkyViewActive]);

  useEffect(() => {
    if (!constellationEmptyHintVisible) return;
    const timer = setTimeout(() => setConstellationEmptyHintVisible(false), 3200);
    return () => clearTimeout(timer);
  }, [constellationEmptyHintVisible]);

  const openJoinedGroupFromSheet = useCallback(
    (communityId: string) => {
      for (const signal of signals) {
        if (signal.sourceId === communityId && signal.type === 'communities' && !signal.read) {
          presentHomeSignal(signal);
        }
      }
      setJoinedGroupsSheetVisible(false);
      const route = resolveEmergingConstellationRoute(communityId, membershipFor(communityId));
      router.push(route as never);
    },
    [membershipFor, presentHomeSignal, router, signals],
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [highlightOwnerId, setHighlightOwnerId] = useState<string | null>(null);
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [worldSize, setWorldSize] = useState({ width: 0, height: 0 });
  const [liveViewport, setLiveViewport] = useState<MySkyViewportSnapshot>(mySkyViewport);
  const [jumpSnapshot, setJumpSnapshot] = useState<MySkyViewportSnapshot | null>(null);
  const [constellationDetailVisible, setConstellationDetailVisible] = useState(false);
  const [constellationDetail, setConstellationDetail] = useState<ConstellationDetailView | null>(
    null,
  );
  const [previousNearbyOwnerId, setPreviousNearbyOwnerId] = useState<string | null>(null);
  const [ephemeralAnchor, setEphemeralAnchor] = useState<NearbySkyAnchor | null>(null);
  const returningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const preExploreViewportRef = useRef<MySkyViewportSnapshot | null>(null);
  const exploreScrollOffsetRef = useRef(0);
  const exploreScrollActive = mySkyExploreEnabled && !cleanSkyActive;
  const mySkyNavTip = useNavigationTip(
    'my_sky_overview',
    joinedGroupsNavReady && !cleanSkyActive && !exploreScrollActive,
  );

  const joinedCommunityIds = useMemo(
    () => communities.joined.map((entry) => entry.id),
    [communities.joined],
  );
  const guidanceActive = Boolean(guidingLightView.light?.title?.trim());

  const connectionActivities = useMemo(
    () => resolveSkyConnectionActivities(aroundYourSkyFeed),
    [aroundYourSkyFeed],
  );

  const effectiveExploreEnabled = useMemo(
    () => resolveEffectiveExploreEnabled(mySkyExploreEnabled, preferences.discoveryPreferences),
    [mySkyExploreEnabled, preferences.discoveryPreferences],
  );

  const exploreCap = useMemo(
    () => exploreResultCap(preferences.discoveryPreferences),
    [preferences.discoveryPreferences],
  );

  const nearbyAnchors = useMemo(
    () =>
      buildNearbySkies(
        aroundYourSkyFeed,
        connectionActivities,
        communities,
        effectiveExploreEnabled,
        displayMySkyView.skyOwner.id,
        exploreCap,
      ),
    [
      aroundYourSkyFeed,
      communities,
      connectionActivities,
      effectiveExploreEnabled,
      exploreCap,
      mySkyView.skyOwner.id,
    ],
  );

  const searchCatalog = useMemo(
    () =>
      buildSkySearchResults(
        '',
        aroundYourSkyFeed,
        connectionActivities,
        communities,
        effectiveExploreEnabled,
      ),
    [aroundYourSkyFeed, communities, connectionActivities, effectiveExploreEnabled],
  );

  const displayAnchors = useMemo(() => {
    if (!ephemeralAnchor) return nearbyAnchors;
    if (nearbyAnchors.some((anchor) => anchor.ownerId === ephemeralAnchor.ownerId)) {
      return nearbyAnchors;
    }
    return [...nearbyAnchors, ephemeralAnchor];
  }, [ephemeralAnchor, nearbyAnchors]);

  const proximity = useMemo(
    () => computeSkyProximity(liveViewport, worldSize.width, worldSize.height, displayAnchors),
    [displayAnchors, liveViewport, worldSize.height, worldSize.width],
  );

  const regionContext = useMemo(
    () =>
      computeSkyRegionContext(
        proximity,
        displayMySkyView.skyOwner.id,
        { x: mySkyView.identityStar.x, y: mySkyView.identityStar.y },
        liveViewport,
        worldSize.width,
        worldSize.height,
        previousNearbyOwnerId,
      ),
    [
      liveViewport,
      mySkyView.identityStar.x,
      mySkyView.identityStar.y,
      mySkyView.skyOwner.id,
      previousNearbyOwnerId,
      proximity,
      worldSize.height,
      worldSize.width,
    ],
  );

  useEffect(() => {
    if (
      (proximity.phase === 'entered' || proximity.phase === 'entering') &&
      proximity.anchor
    ) {
      setPreviousNearbyOwnerId(proximity.anchor.ownerId);
    }
  }, [proximity.anchor, proximity.phase]);

  useEffect(() => {
    if (returningTimerRef.current) {
      clearTimeout(returningTimerRef.current);
      returningTimerRef.current = null;
    }

    if (regionContext.mode !== 'returning') return;

    returningTimerRef.current = setTimeout(() => {
      setPreviousNearbyOwnerId(null);
    }, 1400);

    return () => {
      if (returningTimerRef.current) {
        clearTimeout(returningTimerRef.current);
        returningTimerRef.current = null;
      }
    };
  }, [regionContext.mode]);

  useEffect(() => {
    setLiveViewport(mySkyViewport);
  }, [mySkyViewport]);

  const handleViewportChange = useCallback(
    (snapshot: MySkyViewportSnapshot) => {
      setMySkyViewport(snapshot);
      setLiveViewport(snapshot);
      setJumpSnapshot(null);
    },
    [setMySkyViewport],
  );

  const handleViewportLiveChange = useCallback((snapshot: MySkyViewportSnapshot) => {
    setLiveViewport(snapshot);
  }, []);

  const jumpToAnchor = useCallback(
    (anchor: NearbySkyAnchor) => {
      if (worldSize.width <= 0 || worldSize.height <= 0) return;
      const snapshot = viewportSnapshotForWorldPoint(
        anchor.x,
        anchor.y,
        worldSize.width,
        worldSize.height,
        anchor.tier === 'explore' ? 1.05 : 1.12,
      );
      if (anchor.id.startsWith('nearby-sky-ephemeral-')) {
        setEphemeralAnchor(anchor);
      }
      setJumpSnapshot(snapshot);
      setLiveViewport(snapshot);
    },
    [worldSize.height, worldSize.width],
  );

  const resolveAnchorForOwner = useCallback(
    (ownerId: string) => {
      const searchResult = searchCatalog.find((entry) => entry.id === ownerId) ?? null;
      return resolveJumpAnchor(
        ownerId,
        nearbyAnchors,
        searchResult,
        effectiveExploreEnabled,
      );
    },
    [effectiveExploreEnabled, nearbyAnchors, searchCatalog],
  );

  const handleJumpFromSearch = useCallback(
    (ownerId: string) => {
      const anchor = resolveAnchorForOwner(ownerId);
      if (anchor) {
        jumpToAnchor(anchor);
        setHighlightOwnerId(ownerId);
        if (highlightTimerRef.current) {
          clearTimeout(highlightTimerRef.current);
        }
        highlightTimerRef.current = setTimeout(() => {
          setHighlightOwnerId(null);
          highlightTimerRef.current = null;
        }, 2600);
      }
      setSearchVisible(false);
    },
    [jumpToAnchor, resolveAnchorForOwner],
  );

  const handleViewSkyFromSearch = useCallback(
    (publicSkyId: string) => {
      setSearchVisible(false);
      router.push(`/public-sky?id=${publicSkyId}` as never);
    },
    [router],
  );

  useEffect(() => {
    return () => {
      if (highlightTimerRef.current) {
        clearTimeout(highlightTimerRef.current);
      }
    };
  }, []);

  const toggleCleanSky = useCallback(() => {
    setCleanSkyActive((active) => !active);
  }, []);

  const handleToggleExplore = useCallback(
    (enabled: boolean) => {
      if (enabled) {
        mySkyNavTip.dismissIfLearned();
        preExploreViewportRef.current = liveViewport;
        setMySkyExploreEnabled(true);
        return;
      }
      setMySkyExploreEnabled(false);
      const restore = preExploreViewportRef.current;
      if (restore) {
        setMySkyViewport(restore);
        setLiveViewport(restore);
        setJumpSnapshot(null);
      }
    },
    [liveViewport, mySkyNavTip, setMySkyExploreEnabled, setMySkyViewport],
  );

  const openConstellationDetail = useCallback(
    (patternId: string) => {
      const pattern = displayMySkyView.patterns.find((entry) => entry.id === patternId);
      if (!pattern) return;
      triggerConstellationReveal(pattern.id);
      setConstellationDetail(
        buildConstellationDetailView(pattern, displayMySkyView.nodes, displayMySkyView.stars),
      );
      setConstellationDetailVisible(true);
    },
    [
      displayMySkyView.nodes,
      displayMySkyView.patterns,
      displayMySkyView.stars,
      triggerConstellationReveal,
    ],
  );

  const openPatternExperience = useCallback(
    (patternId: string) => {
      const pattern = findPatternById(displayMySkyView.patterns, patternId);
      if (!pattern) return;
      if (pattern.emergingCommunityId) {
        const route = resolveEmergingConstellationRoute(
          pattern.emergingCommunityId,
          membershipFor(pattern.emergingCommunityId),
        );
        router.push(route as never);
        return;
      }
      openConstellationDetail(patternId);
    },
    [displayMySkyView.patterns, membershipFor, openConstellationDetail, router],
  );

  const handleEmergingGroupPress = useCallback(
    (communityId: string) => {
      const route = resolveEmergingConstellationRoute(communityId, membershipFor(communityId));
      router.push(route as never);
    },
    [membershipFor, router],
  );

  const handlePatternStarPress = useCallback(
    (star: MySkyStarDisplay) => {
      const pattern = findPatternForNodeId(displayMySkyView.patterns, star.id);
      if (!pattern) return;
      openConstellationDetail(pattern.id);
    },
    [displayMySkyView.patterns, openConstellationDetail],
  );

  const emergingConstellationTapEnabled =
    Boolean(emergingSkyCommunityId) &&
    (constellationSkyViewActive ||
      constellationRevealActive ||
      constellationDetailVisible ||
      visibleLayers.constellations);

  const navigateStarById = useCallback(
    (nodeId: string) => {
      const star = displayMySkyView.stars.find((entry) => entry.id === nodeId);
      if (!star) return;

      const target = resolveStarNavigation(star, {
        skywrites,
        joinedCommunityIds,
        guidanceActive,
        nodes: displayMySkyView.nodes,
      });

      if (target.kind === 'none') return;
      pushStarNavigationTarget(router, target, {
        skyOwnerId: displayMySkyView.skyOwner.id,
      });
    },
    [displayMySkyView.skyOwner.id, displayMySkyView.stars, guidanceActive, joinedCommunityIds, router, skywrites],
  );

  const handleConstellationStarSelect = useCallback(
    (nodeId: string) => {
      setConstellationDetailVisible(false);
      navigateStarById(nodeId);
    },
    [navigateStarById],
  );

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        {!cleanSkyActive ? (
          <>
            <View style={styles.header}>
              <HomeHeaderLogo />
              <Text style={styles.headerTitle}>{SkyArrivalCopy.mySkyTitle}</Text>
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                {SkyArrivalCopy.mySkySubtitle}
              </Text>
            </View>

            <View style={styles.controls}>
              <MySkyControlRow
                northStarText={northStarText}
                exploreEnabled={mySkyExploreEnabled}
                onToggleExplore={handleToggleExplore}
                onOpenSearch={() => setSearchVisible(true)}
              />
              {mySkyNavTip.visible ? (
                <NavigationTipCallout
                  compact
                  message={navigationTipMessage('my_sky_overview')}
                  onDismiss={mySkyNavTip.dismiss}
                />
              ) : null}
            </View>

            <View style={styles.layerRow}>
              <View style={styles.layerRowLeftCluster}>
                <MySkyLayerControls
                  compact
                  minimal
                  layerOrder={MY_SKY_SECOND_ROW_LAYER_ORDER}
                  visibleLayers={visibleLayers}
                  onToggleLayer={toggleMySkyLayer}
                  onRevealConstellations={triggerConstellationReveal}
                  constellationRevealActive={constellationRevealActive}
                />
                <View style={styles.groupsQuickAccess}>
                  <MySkyJoinedGroupsControl
                    showActivityHint={joinedGroupsActivityHint}
                    onPress={openJoinedGroupsSheet}
                  />
                  <MySkyJoinedGroupsCoachmark
                    visible={showJoinedGroupsCoachmark}
                    anchored
                    onDismiss={dismissJoinedGroupsCoachmark}
                  />
                </View>
              </View>
              <View style={styles.layerRowRightCluster}>
                <View style={styles.constellationsQuickAccess}>
                  <MySkyConstellationsControl
                    active={constellationSkyViewActive}
                    onPress={toggleConstellationSkyView}
                  />
                  <MySkyConstellationsCoachmark
                    visible={showConstellationsCoachmark}
                    onDismiss={dismissConstellationsCoachmark}
                  />
                </View>
                {!exploreScrollActive ? (
                  <MySkyImmersiveToggleButton
                    immersiveActive={cleanSkyActive}
                    onPress={toggleCleanSky}
                  />
                ) : null}
              </View>
            </View>
          </>
        ) : null}

        <View style={[styles.skyArea, cleanSkyActive && styles.skyAreaClean]}>
          {!cleanSkyActive && constellationEmptyHintVisible ? (
            <View style={styles.constellationEmptyHint} pointerEvents="none">
              <Text style={styles.constellationEmptyHintText}>
                {MySkyCopy.constellationsSkyEmptyHint}
              </Text>
            </View>
          ) : null}
          {!cleanSkyActive && !exploreScrollActive ? (
            <MySkyProximityCue
              anchor={proximity.anchor}
              phase={proximity.phase}
              regionMode={regionContext.mode}
              onPress={jumpToAnchor}
            />
          ) : null}
          {exploreScrollActive ? (
            <MySkyExploreScrollFeed
              nearbyAnchors={displayAnchors}
              bottomInset={TabBarHeight + Spacing.lg}
              initialScrollOffsetY={exploreScrollOffsetRef.current}
              onScrollOffsetChange={(offsetY) => {
                exploreScrollOffsetRef.current = offsetY;
              }}
            />
          ) : (
          <MySkyStarCanvas
            immersive
            cleanSky={cleanSkyActive}
            showLayerControls={false}
            showNearbySkies
            nearbyAnchors={displayAnchors}
            proximityOwnerId={proximity.anchor?.ownerId ?? null}
            proximityPhase={proximity.phase}
            highlightOwnerId={highlightOwnerId}
            onJumpToSky={jumpToAnchor}
            resolveAnchorForOwner={resolveAnchorForOwner}
            view={displayMySkyView}
            onToggleLayer={toggleMySkyLayer}
            onRevealConstellations={() => triggerConstellationReveal(null)}
            constellationRevealCount={constellationRevealCount}
            constellationRevealActive={constellationRevealActive}
            constellationRevealPatternId={constellationRevealPatternId}
            onConstellationRevealComplete={completeConstellationReveal}
            onPatternStarPress={handlePatternStarPress}
            emergingConstellationTapEnabled={emergingConstellationTapEnabled}
            onEmergingGroupPress={handleEmergingGroupPress}
            viewportSnapshot={mySkyViewport}
            jumpSnapshot={jumpSnapshot}
            onViewportChange={handleViewportChange}
            onViewportLiveChange={handleViewportLiveChange}
            onWorldSizeChange={setWorldSize}
            spatialFocusSuspended={
              searchVisible ||
              joinedGroupsSheetVisible ||
              constellationDetailVisible ||
              constellationRevealActive
            }
          />
          )}
          {!cleanSkyActive && !exploreScrollActive ? (
            <MySkyInsightOverlay
              view={displayMySkyView}
              visibleLayers={visibleLayers}
            />
          ) : (
            <MySkyImmersiveToggleButton
              immersiveActive={cleanSkyActive}
              onPress={toggleCleanSky}
              floating
            />
          )}
        </View>
      </SafeAreaView>

      <MySkyJoinedGroupsSheet
        visible={joinedGroupsSheetVisible}
        groups={joinedEmergingGroups}
        signals={signals}
        signalsMeta={signalsMeta}
        onClose={closeJoinedGroupsSheet}
        onSelectGroup={openJoinedGroupFromSheet}
      />

      <MySkySearchSheet
        visible={searchVisible}
        query={searchQuery}
        onQueryChange={setSearchQuery}
        onClose={() => setSearchVisible(false)}
        exploreEnabled={effectiveExploreEnabled}
        discoveryPreferences={preferences.discoveryPreferences}
        nearbyAnchors={nearbyAnchors}
        onJumpToSky={handleJumpFromSearch}
        onViewSky={handleViewSkyFromSearch}
        resolveAnchorForOwner={resolveAnchorForOwner}
      />

      <MySkyConstellationDetailSheet
        visible={constellationDetailVisible}
        detail={constellationDetail}
        onClose={() => setConstellationDetailVisible(false)}
        onSelectStar={handleConstellationStarSelect}
      />
    </View>
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
    paddingHorizontal: Spacing.md,
    paddingTop: 0,
    paddingBottom: 0,
    alignItems: 'center',
    gap: 1,
    zIndex: 2,
  },
  headerTitle: {
    fontFamily: Fonts.serif,
    fontSize: 20,
    fontWeight: '600',
    color: HomePalette.textPrimary,
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    lineHeight: 14,
    color: 'rgba(235, 228, 248, 0.62)',
    textAlign: 'center',
    maxWidth: 280,
  },
  controls: {
    paddingHorizontal: Spacing.sm,
    paddingTop: 2,
    zIndex: 3,
  },
  layerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: Spacing.xs,
    paddingRight: Spacing.sm,
    paddingBottom: 2,
    gap: 6,
    zIndex: 2,
  },
  layerRowLeftCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    gap: 6,
    minWidth: 0,
  },
  layerRowRightCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    gap: 6,
  },
  groupsQuickAccess: {
    flexShrink: 0,
    alignItems: 'center',
  },
  constellationsQuickAccess: {
    flexShrink: 0,
    alignItems: 'center',
  },
  constellationEmptyHint: {
    position: 'absolute',
    top: 8,
    alignSelf: 'center',
    zIndex: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(8, 10, 26, 0.72)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(167, 139, 250, 0.22)',
  },
  constellationEmptyHintText: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: 'rgba(248, 244, 236, 0.72)',
  },
  skyArea: {
    flex: 1,
    paddingHorizontal: 0,
    minHeight: 0,
    marginTop: 2,
  },
  skyAreaClean: {
    marginTop: 0,
  },
});
