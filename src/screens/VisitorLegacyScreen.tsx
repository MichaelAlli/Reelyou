import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { BackHandler, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';

import { BottomNav } from '@/components/BottomNav';
import { LegacySegmentToggle } from '@/components/legacy/LegacySegmentToggle';
import { LegacyMomentCard } from '@/components/legacy/LegacyMomentCard';
import { GlowButton } from '@/components/GlowButton';
import { LegacyCopy } from '@/constants/legacyCopy';
import { Fonts, Spacing, TabBarHeight } from '@/constants/theme';
import { currentUser } from '@/data/mockData';
import { canViewerAccessVisitorLegacyRoutes, canViewerSeeLegacyItem } from '@/legacy/legacyViewerAccess';
import { useSubjectLegacyContent } from '@/legacy/useSubjectLegacyContent';
import { buildVisitorProfileHref } from '@/profile/visitorProfileRoute';
import {
  visitorReelYouRoute,
  visitorRippleRoute,
} from '@/profile/visitorLegacyRoutes';
import { useReelyouConnect } from '@/connect/ReelyouConnectProvider';

interface VisitorLegacyScreenProps {
  ownerId?: string;
}

export function VisitorLegacyScreen({ ownerId }: VisitorLegacyScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const navContentInset = TabBarHeight + Math.max(insets.bottom, Spacing.sm);
  const { moments, reelSequence } = useSubjectLegacyContent(ownerId ?? '');
  const { skyFollowGraph, messages } = useReelyouConnect();
  const [segment, setSegment] = useState<'journey' | 'ripples'>('journey');

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

  const visibleMoments = useMemo(() => {
    return moments.filter((moment) => canViewerSeeLegacyItem(moment, viewerContext));
  }, [moments, viewerContext]);

  const sharedReelCount = useMemo(() => {
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
      router.replace(buildVisitorProfileHref(subjectId) as never);
      return;
    }
    router.replace('/(tabs)/home' as never);
  }, [router, subjectId]);

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
        <LinearGradient colors={['#12182A', '#1A2240', '#141A2E']} style={StyleSheet.absoluteFill} />
        <SafeAreaView style={styles.safe}>
          <Text style={styles.unavailable}>Profile unavailable.</Text>
        </SafeAreaView>
        <BottomNav />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#12182A', '#1A2240', '#141A2E']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: navContentInset }]}
          showsVerticalScrollIndicator={false}>
          <Pressable onPress={handleBack} style={styles.back} accessibilityRole="button">
            <SymbolView
              name={{ ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' }}
              size={18}
              tintColor="#D4AF37"
              weight="semibold"
            />
            <Text style={styles.backText}>{LegacyCopy.back}</Text>
          </Pressable>
          <Text style={styles.title}>Shared Legacy</Text>
          <Text style={styles.sub}>Moments they have chosen to share with you.</Text>

          <LegacySegmentToggle
            active={segment}
            onJourney={() => setSegment('journey')}
            onRipples={() => setSegment('ripples')}
          />

          {segment === 'journey' ? (
            <>
              {sharedReelCount > 0 ? (
                <View style={styles.reelCard}>
                  <GlowButton
                    label="Play REEL-YOU"
                    variant="secondary"
                    onPress={() => router.push(visitorReelYouRoute(subjectId) as never)}
                  />
                  <Text style={styles.reelSub}>
                    {sharedReelCount} shared scene{sharedReelCount === 1 ? '' : 's'} ready to play.
                  </Text>
                </View>
              ) : (
                <View style={styles.reelCardMuted}>
                  <Text style={styles.emptyTitle}>No shared REEL-YOU moments yet.</Text>
                  <Text style={styles.emptyBody}>This part of their journey is private.</Text>
                </View>
              )}

              {visibleMoments.length === 0 ? (
                <View>
                  <Text style={styles.emptyTitle}>No shared Legacy moments yet.</Text>
                  <Text style={styles.emptyBody}>
                    This part of their journey may still be private — nothing is shown here until they
                    share it.
                  </Text>
                </View>
              ) : (
                visibleMoments.map((moment) => (
                  <LegacyMomentCard key={moment.legacyMomentId} moment={moment} />
                ))
              )}
            </>
          ) : (
            <View style={styles.ripplesPanel}>
              <Text style={styles.ripplesCopy}>
                Explore how their support has moved outward — filtered to what you may see.
              </Text>
              <GlowButton
                label="Open Ripples"
                onPress={() => router.push(visitorRippleRoute(subjectId) as never)}
              />
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  scroll: { paddingHorizontal: Spacing.lg },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    minHeight: 44,
    marginTop: Spacing.sm,
  },
  backText: { fontFamily: Fonts.sans, fontSize: 14, fontWeight: '600', color: '#D4AF37' },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 28,
    fontWeight: '600',
    color: '#FFF8F0',
    marginTop: 8,
  },
  sub: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(248, 244, 236, 0.72)',
    marginBottom: Spacing.lg,
  },
  reelCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.md,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
  },
  reelCardMuted: {
    marginBottom: Spacing.lg,
    padding: Spacing.md,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(167, 139, 250, 0.22)',
    backgroundColor: 'rgba(10, 14, 34, 0.55)',
    gap: 6,
  },
  reelSub: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: 'rgba(248, 244, 236, 0.62)',
    marginTop: 8,
    textAlign: 'center',
  },
  emptyTitle: { fontFamily: Fonts.serif, fontSize: 20, color: '#FFF8F0', marginBottom: 8 },
  emptyBody: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(248, 244, 236, 0.68)',
  },
  ripplesPanel: { gap: Spacing.md, marginTop: Spacing.sm },
  ripplesCopy: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(248, 244, 236, 0.72)',
  },
  unavailable: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: 'rgba(248, 244, 236, 0.72)',
    textAlign: 'center',
    marginTop: 80,
  },
});
