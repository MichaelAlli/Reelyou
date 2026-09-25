import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomNav } from '@/components/BottomNav';
import { devEmergingConstellationIfEligible } from '@/emergingConstellations/emergingConstellationFixtures';
import { useEmergingConstellations } from '@/emergingConstellations/EmergingConstellationsProvider';
import { Fonts, Spacing, TabBarHeight } from '@/constants/theme';

export function EmergingConstellationScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const insets = useSafeAreaInsets();
  const tabInset = TabBarHeight + Math.max(insets.bottom, 8);
  const { membershipFor, leaveConstellation, muteConstellation } = useEmergingConstellations();

  const constellation = useMemo(() => {
    const dev = devEmergingConstellationIfEligible();
    if (!dev || (id && dev.id !== id)) return null;
    return dev;
  }, [id]);

  const membership = constellation ? membershipFor(constellation.id) : undefined;
  const joined = membership?.status === 'joined';

  const handleBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/home' as never);
  }, [router]);

  if (!constellation || !joined) {
    return (
      <View style={styles.root}>
        <Text style={styles.unavailable}>Join from the preview to enter this space.</Text>
        <BottomNav />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#12182A', '#1A2240', '#141A2E']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: tabInset }]}>
          <Pressable onPress={handleBack} style={styles.back}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
          <Text style={styles.title}>{constellation.name}</Text>
          <Text style={styles.sub}>{constellation.humanExplanation}</Text>

          <Text style={styles.section}>Why this constellation exists</Text>
          <Text style={styles.body}>{constellation.sharedTheme}</Text>

          <Text style={styles.section}>Ways to contribute</Text>
          <Text style={styles.body}>Ask for perspective · Offer encouragement · Share lived experience</Text>

          <Pressable
            style={styles.chatCta}
            onPress={() =>
              router.push(
                `/emerging-constellation/chat?id=${encodeURIComponent(constellation.id)}` as never,
              )
            }>
            <Text style={styles.chatCtaText}>Enter conversation</Text>
          </Pressable>

          <Pressable
            onPress={() =>
              muteConstellation(constellation.id, !membership.notificationsMuted)
            }>
            <Text style={styles.link}>
              {membership.notificationsMuted ? 'Unmute notifications' : 'Mute notifications'}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              leaveConstellation(constellation.id);
              handleBack();
            }}>
            <Text style={styles.linkDanger}>Leave constellation</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#05070A' },
  safe: { flex: 1 },
  scroll: { paddingHorizontal: Spacing.lg },
  back: { minHeight: 44, justifyContent: 'center' },
  backText: { fontFamily: Fonts.sans, fontSize: 15, fontWeight: '600', color: '#E8C872' },
  title: { fontFamily: Fonts.serif, fontSize: 28, color: '#FFF8F0', marginTop: 8 },
  sub: { fontFamily: Fonts.sans, fontSize: 13, lineHeight: 19, color: 'rgba(248,244,236,0.72)', marginBottom: 16 },
  section: { fontFamily: Fonts.sans, fontSize: 11, fontWeight: '700', color: '#E8C872', marginTop: 12 },
  body: { fontFamily: Fonts.sans, fontSize: 14, lineHeight: 20, color: 'rgba(248,244,236,0.82)' },
  chatCta: {
    marginTop: 24,
    minHeight: 48,
    borderRadius: 999,
    backgroundColor: 'rgba(232, 200, 114, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatCtaText: { fontFamily: Fonts.sans, fontSize: 15, fontWeight: '700', color: '#F5E6B8' },
  link: { textAlign: 'center', marginTop: 16, fontFamily: Fonts.sans, fontSize: 13, color: '#C4B5FD' },
  linkDanger: { textAlign: 'center', marginTop: 10, fontFamily: Fonts.sans, fontSize: 13, color: 'rgba(248,120,120,0.85)' },
  unavailable: { textAlign: 'center', marginTop: 80, color: '#FFF8F0', paddingHorizontal: 24 },
});
