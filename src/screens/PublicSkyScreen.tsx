import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MySkyConstellationDetailSheet } from '@/components/my-sky/MySkyConstellationDetailSheet';
import { MySkyPublicSkyHeader } from '@/components/my-sky/MySkyPublicSkyHeader';
import { MySkyStarCanvas } from '@/components/my-sky/MySkyStarCanvas';
import {
  buildConstellationDetailView,
  type ConstellationDetailView,
} from '@/mySky/buildConstellationDetailView';
import { findPatternForNodeId } from '@/mySky/buildConstellationIntelligence';
import {
  buildPublicSkyView,
  resolvePublicSkyConnectionStatus,
} from '@/mySky/buildPublicSkyView';
import { DEFAULT_MY_SKY_VIEWPORT, type MySkyViewportSnapshot } from '@/mySky/mySkyViewportSession';
import { resolvePublicSkyVisitorContext } from '@/mySky/resolvePublicSkyContext';
import { resolveSkyConnectionActivities } from '@/mySky/skyConnectionSources';
import type { MySkyStarDisplay } from '@/mySky/types';
import { useOnboarding } from '@/onboarding';

interface PublicSkyScreenProps {
  userId?: string;
}

export function PublicSkyScreen({ userId }: PublicSkyScreenProps) {
  const router = useRouter();
  const { aroundYourSkyFeed, communities } = useOnboarding();
  const [viewport, setViewport] = useState<MySkyViewportSnapshot>({ ...DEFAULT_MY_SKY_VIEWPORT });
  const [constellationDetailVisible, setConstellationDetailVisible] = useState(false);
  const [constellationDetail, setConstellationDetail] = useState<ConstellationDetailView | null>(
    null,
  );
  const [constellationRevealCount, setConstellationRevealCount] = useState(0);

  const connectionActivities = useMemo(
    () => resolveSkyConnectionActivities(aroundYourSkyFeed),
    [aroundYourSkyFeed],
  );

  const connectedActorIds = useMemo(
    () => connectionActivities.map((entry) => entry.actorId),
    [connectionActivities],
  );

  const connectionStatus = useMemo(
    () => (userId ? resolvePublicSkyConnectionStatus(userId, connectedActorIds) : 'none'),
    [connectedActorIds, userId],
  );

  const publicSkyView = useMemo(() => {
    if (!userId) return null;
    return buildPublicSkyView(userId, connectionStatus);
  }, [connectionStatus, userId]);

  const visitorContext = useMemo(() => {
    if (!userId) {
      return { connectionStatus: 'none' as const };
    }
    return resolvePublicSkyVisitorContext(
      userId,
      connectionStatus,
      aroundYourSkyFeed,
      communities,
      connectionActivities,
    );
  }, [aroundYourSkyFeed, communities, connectionActivities, connectionStatus, userId]);

  const handleViewportChange = useCallback((snapshot: MySkyViewportSnapshot) => {
    setViewport(snapshot);
  }, []);

  const noopToggleLayer = useCallback(() => {}, []);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleConnect = useCallback(() => {
    // Stub — existing connection infrastructure hook point.
  }, []);

  const openConstellationDetail = useCallback(
    (patternId: string) => {
      if (!publicSkyView) return;
      const pattern = publicSkyView.patterns.find((entry) => entry.id === patternId);
      if (!pattern) return;
      setConstellationRevealCount((count) => count + 1);
      setConstellationDetail(
        buildConstellationDetailView(pattern, publicSkyView.nodes, publicSkyView.stars),
      );
      setConstellationDetailVisible(true);
    },
    [publicSkyView],
  );

  const handlePatternStarPress = useCallback(
    (star: MySkyStarDisplay) => {
      if (!publicSkyView) return;
      const pattern = findPatternForNodeId(publicSkyView.patterns, star.id);
      if (!pattern) return;
      openConstellationDetail(pattern.id);
    },
    [openConstellationDetail, publicSkyView],
  );

  const handleConstellationStarSelect = useCallback(
    (nodeId: string) => {
      if (!userId) return;
      setConstellationDetailVisible(false);
      router.push(`/my-sky-star/${nodeId}?ownerId=${userId}` as never);
    },
    [router, userId],
  );

  if (!publicSkyView) {
    return (
      <View style={styles.root}>
        <SafeAreaView style={styles.safe} edges={['top']}>
          <MySkyPublicSkyHeader
            owner={{
              id: userId ?? 'unknown',
              name: 'Sky unavailable',
              avatarInitials: '?',
              avatarColor: '#6B7280',
              isSelf: false,
            }}
            visitorContext={{ connectionStatus: 'none' }}
            onBack={handleBack}
          />
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <MySkyPublicSkyHeader
          owner={publicSkyView.skyOwner}
          visitorContext={visitorContext}
          onBack={handleBack}
          onConnect={visitorContext.connectionStatus === 'connected' ? undefined : handleConnect}
        />

        <View style={styles.skyArea}>
          <MySkyStarCanvas
            immersive
            visitorMode
            publicSkyOwnerId={publicSkyView.skyOwner.id}
            publicSkyNodes={publicSkyView.nodes}
            publicSkyConnectionStatus={connectionStatus}
            cleanSky
            showLayerControls={false}
            view={publicSkyView}
            onToggleLayer={noopToggleLayer}
            onRevealConstellations={() => setConstellationRevealCount((count) => count + 1)}
            constellationRevealCount={constellationRevealCount}
            constellationRevealActive={constellationRevealCount > 0}
            onPatternStarPress={handlePatternStarPress}
            onConnect={handleConnect}
            viewportSnapshot={viewport}
            onViewportChange={handleViewportChange}
          />
        </View>
      </SafeAreaView>

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
  skyArea: {
    flex: 1,
    minHeight: 0,
  },
});
