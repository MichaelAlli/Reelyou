import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo } from 'react';
import { BackHandler, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';

import { BottomNav } from '@/components/BottomNav';
import { GlowButton } from '@/components/GlowButton';
import { LegacyCopy } from '@/constants/legacyCopy';
import { Fonts, Spacing } from '@/constants/theme';
import { currentUser } from '@/data/mockData';
import {
  canViewerAccessVisitorLegacyRoutes,
  canViewerSeeLegacyItem,
} from '@/legacy/legacyViewerAccess';
import { useSubjectLegacyContent } from '@/legacy/useSubjectLegacyContent';
import { buildVisitorProfileHref } from '@/profile/visitorProfileRoute';
import { visitorLegacyRoute } from '@/profile/visitorLegacyRoutes';
import { useReelyouConnect } from '@/connect/ReelyouConnectProvider';

interface VisitorReelYouScreenProps {
  ownerId?: string;
}

export function VisitorReelYouScreen({ ownerId }: VisitorReelYouScreenProps) {
  const router = useRouter();
  const { reelSequence, moments } = useSubjectLegacyContent(ownerId ?? '');
  const { skyFollowGraph, messages } = useReelyouConnect();
  const subjectId = ownerId ?? '';

  const viewerContext = useMemo(
    () => ({
      subjectUserId: subjectId,
      viewerUserId: currentUser.id,
      followGraph: skyFollowGraph,
      blockedUserIds: messages.blockedUserIds,
    }),
    [messages.blockedUserIds, skyFollowGraph, subjectId],
  );

  const accessAllowed = subjectId ? canViewerAccessVisitorLegacyRoutes(viewerContext) : false;

  const sharedSceneCount = useMemo(() => {
    return reelSequence.momentIds.filter((id) => {
      const moment = moments.find((m) => m.legacyMomentId === id);
      return moment ? canViewerSeeLegacyItem(moment, viewerContext) : false;
    }).length;
  }, [moments, reelSequence.momentIds, viewerContext]);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    if (subjectId) {
      router.replace(visitorLegacyRoute(subjectId) as never);
      return;
    }
    router.replace(buildVisitorProfileHref(subjectId) as never);
  }, [router, subjectId]);

  const handlePlay = useCallback(() => {
    if (sharedSceneCount === 0) return;
    router.push(
      `/legacy/reel-you?visitorOwnerId=${encodeURIComponent(subjectId)}` as never,
    );
  }, [router, sharedSceneCount, subjectId]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      handleBack();
      return true;
    });
    return () => subscription.remove();
  }, [handleBack]);

  if (!subjectId || !accessAllowed) {
    return (
      <View style={styles.root}>
        <Text style={styles.unavailable}>Profile unavailable.</Text>
        <BottomNav />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#12182A', '#1A2240', '#141A2E']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Pressable onPress={handleBack} style={styles.back} accessibilityRole="button">
          <SymbolView
            name={{ ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' }}
            size={18}
            tintColor="#D4AF37"
            weight="semibold"
          />
          <Text style={styles.backText}>{LegacyCopy.back}</Text>
        </Pressable>
        <Text style={styles.title}>REEL-YOU</Text>
        {sharedSceneCount > 0 ? (
          <>
            <Text style={styles.body}>
              Playback includes only moments shared with you — no private scenes are included.
            </Text>
            <GlowButton label="Play shared REEL-YOU" onPress={handlePlay} />
          </>
        ) : (
          <>
            <Text style={styles.emptyTitle}>No shared REEL-YOU moments yet.</Text>
            <Text style={styles.emptyBody}>This part of their journey is private.</Text>
          </>
        )}
      </SafeAreaView>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: Spacing.lg },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 44,
    marginTop: Spacing.sm,
  },
  backText: { fontFamily: Fonts.sans, fontSize: 14, fontWeight: '600', color: '#D4AF37' },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 28,
    fontWeight: '600',
    color: '#FFF8F0',
    marginTop: 12,
  },
  body: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(248, 244, 236, 0.72)',
    marginTop: 12,
    marginBottom: 20,
  },
  emptyTitle: {
    fontFamily: Fonts.serif,
    fontSize: 20,
    color: '#FFF8F0',
    marginTop: 24,
  },
  emptyBody: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(248, 244, 236, 0.68)',
    marginTop: 8,
  },
  unavailable: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: 'rgba(248, 244, 236, 0.72)',
    textAlign: 'center',
    marginTop: 80,
  },
});
