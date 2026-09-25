import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomNav } from '@/components/BottomNav';
import { GlowButton } from '@/components/GlowButton';
import { devEmergingConstellationIfEligible } from '@/emergingConstellations/emergingConstellationFixtures';
import { useEmergingConstellations } from '@/emergingConstellations/EmergingConstellationsProvider';
import { Fonts, Spacing, TabBarHeight } from '@/constants/theme';

export function EmergingConstellationPreviewScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const insets = useSafeAreaInsets();
  const tabInset = TabBarHeight + Math.max(insets.bottom, 8);
  const { joinConstellation, dismissSuggestion } = useEmergingConstellations();

  const constellation = useMemo(() => {
    const dev = devEmergingConstellationIfEligible();
    if (!dev || (id && dev.id !== id)) return null;
    return dev;
  }, [id]);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/home' as never);
  }, [router]);

  if (!constellation) {
    return (
      <View style={styles.root}>
        <Text style={styles.unavailable}>Nothing to explore right now.</Text>
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
          <Text style={styles.eyebrow}>Emerging constellation</Text>
          <Text style={styles.title}>{constellation.name}</Text>
          <Text style={styles.body}>{constellation.sharedTheme}</Text>
          <Text style={styles.explain}>{constellation.humanExplanation}</Text>
          <GlowButton
            label="Join constellation"
            onPress={() => {
              joinConstellation(constellation.id);
              router.push(`/emerging-constellation?id=${encodeURIComponent(constellation.id)}` as never);
            }}
          />
          <Pressable
            onPress={() => {
              dismissSuggestion(constellation.id);
              handleBack();
            }}
            style={styles.notNow}>
            <Text style={styles.notNowText}>Not now</Text>
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
  eyebrow: { fontFamily: Fonts.sans, fontSize: 11, fontWeight: '700', color: 'rgba(248,244,236,0.55)', marginTop: 8 },
  title: { fontFamily: Fonts.serif, fontSize: 28, color: '#FFF8F0', marginTop: 6 },
  body: { fontFamily: Fonts.sans, fontSize: 14, lineHeight: 20, color: 'rgba(248,244,236,0.78)', marginTop: 10 },
  explain: { fontFamily: Fonts.sans, fontSize: 13, lineHeight: 19, color: 'rgba(248,244,236,0.65)', marginVertical: 20 },
  notNow: { alignItems: 'center', paddingVertical: 14 },
  notNowText: { fontFamily: Fonts.sans, fontSize: 13, color: 'rgba(248,244,236,0.55)' },
  unavailable: { textAlign: 'center', marginTop: 80, color: '#FFF8F0' },
});
