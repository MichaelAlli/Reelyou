import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HomeHeaderLogo } from '@/components/home/HomeHeaderLogo';
import { MySkyCleanSkyToggle } from '@/components/my-sky/MySkyCleanSkyToggle';
import { MySkyControlRow } from '@/components/my-sky/MySkyControlRow';
import { MySkyInsightOverlay } from '@/components/my-sky/MySkyInsightOverlay';
import { MySkyLayerControls } from '@/components/my-sky/MySkyLayerControls';
import { MySkyProximityCue } from '@/components/my-sky/MySkyProximityCue';
import { MySkySearchSheet } from '@/components/my-sky/MySkySearchSheet';
import { MySkyStarCanvas } from '@/components/my-sky/MySkyStarCanvas';
import { HomePalette } from '@/constants/homeLayout';
import { SkyArrivalCopy } from '@/constants/skyArrivalCopy';
import { Fonts, Spacing } from '@/constants/theme';
import {
  buildNearbySkies,
  findNearbySkyAnchor,
  type NearbySkyAnchor,
} from '@/mySky/buildNearbySkies';
import type { MySkyViewportSnapshot } from '@/mySky/mySkyViewportSession';
import { computeSkyProximity, viewportSnapshotForWorldPoint } from '@/mySky/skyProximity';
import { resolveSkyConnectionActivities } from '@/mySky/skyConnectionSources';
import { useOnboarding } from '@/onboarding';

export function MySkyScreen() {
  const {
    mySkyView,
    toggleMySkyLayer,
    triggerConstellationReveal,
    constellationRevealCount,
    constellationRevealActive,
    mySkyViewport,
    setMySkyViewport,
    mySkyExploreEnabled,
    setMySkyExploreEnabled,
    aroundYourSkyFeed,
    communities,
  } = useOnboarding();
  const { visibleLayers } = mySkyView.viewState;
  const northStarText = mySkyView.northStar.originalVision.trim();

  const [cleanSkyActive, setCleanSkyActive] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [worldSize, setWorldSize] = useState({ width: 0, height: 0 });
  const [liveViewport, setLiveViewport] = useState<MySkyViewportSnapshot>(mySkyViewport);
  const [jumpSnapshot, setJumpSnapshot] = useState<MySkyViewportSnapshot | null>(null);

  const connectionActivities = useMemo(
    () => resolveSkyConnectionActivities(aroundYourSkyFeed),
    [aroundYourSkyFeed],
  );

  const nearbyAnchors = useMemo(
    () =>
      buildNearbySkies(
        aroundYourSkyFeed,
        connectionActivities,
        communities,
        mySkyExploreEnabled,
        mySkyView.skyOwner.id,
      ),
    [
      aroundYourSkyFeed,
      communities,
      connectionActivities,
      mySkyExploreEnabled,
      mySkyView.skyOwner.id,
    ],
  );

  const proximity = useMemo(
    () => computeSkyProximity(liveViewport, worldSize.width, worldSize.height, nearbyAnchors),
    [liveViewport, nearbyAnchors, worldSize.height, worldSize.width],
  );

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
      setJumpSnapshot(snapshot);
      setLiveViewport(snapshot);
    },
    [worldSize.height, worldSize.width],
  );

  const handleJumpFromSearch = useCallback(
    (ownerId: string) => {
      const anchor = findNearbySkyAnchor(nearbyAnchors, ownerId);
      if (anchor) {
        jumpToAnchor(anchor);
      }
      setSearchVisible(false);
    },
    [jumpToAnchor, nearbyAnchors],
  );

  const toggleCleanSky = useCallback(() => {
    setCleanSkyActive((active) => !active);
  }, []);

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
                onToggleExplore={setMySkyExploreEnabled}
                onOpenSearch={() => setSearchVisible(true)}
              />
            </View>

            <View style={styles.layerRow}>
              <View style={styles.layerScroll}>
                <MySkyLayerControls
                  compact
                  minimal
                  visibleLayers={visibleLayers}
                  onToggleLayer={toggleMySkyLayer}
                  onRevealConstellations={triggerConstellationReveal}
                  constellationRevealActive={constellationRevealActive}
                />
              </View>
              <MySkyCleanSkyToggle
                compact
                active={cleanSkyActive}
                onToggle={toggleCleanSky}
              />
            </View>
          </>
        ) : null}

        <View style={[styles.skyArea, cleanSkyActive && styles.skyAreaClean]}>
          {!cleanSkyActive ? (
            <MySkyProximityCue
              anchor={proximity.anchor}
              phase={proximity.phase}
              onPress={jumpToAnchor}
            />
          ) : null}
          <MySkyStarCanvas
            immersive
            cleanSky={cleanSkyActive}
            showLayerControls={false}
            showNearbySkies
            nearbyAnchors={nearbyAnchors}
            proximityOwnerId={proximity.anchor?.ownerId ?? null}
            proximityPhase={proximity.phase}
            view={mySkyView}
            onToggleLayer={toggleMySkyLayer}
            onRevealConstellations={triggerConstellationReveal}
            constellationRevealCount={constellationRevealCount}
            constellationRevealActive={constellationRevealActive}
            viewportSnapshot={mySkyViewport}
            jumpSnapshot={jumpSnapshot}
            onViewportChange={handleViewportChange}
            onViewportLiveChange={handleViewportLiveChange}
            onWorldSizeChange={setWorldSize}
          />
          {!cleanSkyActive ? (
            <MySkyInsightOverlay view={mySkyView} visibleLayers={visibleLayers} />
          ) : (
            <MySkyCleanSkyToggle active floating onToggle={toggleCleanSky} />
          )}
        </View>
      </SafeAreaView>

      <MySkySearchSheet
        visible={searchVisible}
        onClose={() => setSearchVisible(false)}
        nearbyAnchors={nearbyAnchors}
        onJumpToSky={handleJumpFromSearch}
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
    paddingLeft: Spacing.sm,
    paddingRight: Spacing.sm,
    paddingBottom: 2,
    gap: 6,
    zIndex: 2,
  },
  layerScroll: {
    flex: 1,
    minWidth: 0,
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
