import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MySkyStarCanvas } from '@/components/my-sky/MySkyStarCanvas';
import { Fonts, Spacing } from '@/constants/theme';
import {
  buildPublicSkyView,
  resolvePublicSkyConnectionStatus,
} from '@/mySky/buildPublicSkyView';
import { DEFAULT_MY_SKY_VIEWPORT, type MySkyViewportSnapshot } from '@/mySky/mySkyViewportSession';
import { resolveSkyConnectionActivities } from '@/mySky/skyConnectionSources';
import { DEFAULT_MY_SKY_VISIBLE_LAYERS } from '@/mySky/skyLayers';
import { useOnboarding } from '@/onboarding';

interface PublicSkyScreenProps {
  userId?: string;
}

export function PublicSkyScreen({ userId }: PublicSkyScreenProps) {
  const router = useRouter();
  const { aroundYourSkyFeed } = useOnboarding();
  const [viewport, setViewport] = useState<MySkyViewportSnapshot>({ ...DEFAULT_MY_SKY_VIEWPORT });

  const connectionActivities = useMemo(
    () => resolveSkyConnectionActivities(aroundYourSkyFeed),
    [aroundYourSkyFeed],
  );

  const connectedActorIds = useMemo(
    () => connectionActivities.map((entry) => entry.actorId),
    [connectionActivities],
  );

  const publicSkyView = useMemo(() => {
    if (!userId) return null;
    const connectionStatus = resolvePublicSkyConnectionStatus(userId, connectedActorIds);
    return buildPublicSkyView(userId, connectionStatus);
  }, [connectedActorIds, userId]);

  const handleViewportChange = useCallback((snapshot: MySkyViewportSnapshot) => {
    setViewport(snapshot);
  }, []);

  const noopToggleLayer = useCallback(() => {}, []);

  if (!publicSkyView) {
    return (
      <View style={styles.root}>
        <SafeAreaView style={styles.safe} edges={['top']}>
          <Pressable onPress={() => router.back()} style={styles.back}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
          <Text style={styles.unavailableTitle}>Sky unavailable</Text>
          <Text style={styles.unavailableBody}>This person’s Public Sky is not available yet.</Text>
        </SafeAreaView>
      </View>
    );
  }

  const readOnlyView = {
    ...publicSkyView,
    viewState: {
      ...publicSkyView.viewState,
      visibleLayers: { ...DEFAULT_MY_SKY_VISIBLE_LAYERS, stars: true },
    },
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.back}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
          <View style={styles.titleWrap}>
            <Text style={styles.title}>{publicSkyView.skyOwner.name}</Text>
            <Text style={styles.subtitle}>Public Sky</Text>
          </View>
        </View>

        <View style={styles.skyArea}>
          <MySkyStarCanvas
            immersive
            cleanSky
            showLayerControls={false}
            view={readOnlyView}
            onToggleLayer={noopToggleLayer}
            onRevealConstellations={() => {}}
            constellationRevealCount={0}
            viewportSnapshot={viewport}
            onViewportChange={handleViewportChange}
          />
        </View>
      </SafeAreaView>
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
    paddingBottom: Spacing.xs,
    gap: Spacing.xs,
    zIndex: 2,
  },
  back: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  backText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: 'rgba(235, 228, 248, 0.82)',
  },
  titleWrap: {
    alignItems: 'center',
    gap: 2,
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 22,
    fontWeight: '600',
    color: 'rgba(248, 244, 255, 0.96)',
  },
  subtitle: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: 'rgba(235, 228, 248, 0.62)',
  },
  skyArea: {
    flex: 1,
    minHeight: 0,
  },
  unavailableTitle: {
    fontFamily: Fonts.serif,
    fontSize: 22,
    fontWeight: '600',
    color: 'rgba(248, 244, 255, 0.96)',
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
  unavailableBody: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(235, 228, 248, 0.68)',
    textAlign: 'center',
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
});
