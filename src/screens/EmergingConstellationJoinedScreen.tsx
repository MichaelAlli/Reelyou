import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomNav } from '@/components/BottomNav';
import { DEV_EMERGING_CONSTELLATION_ID } from '@/emergingConstellations/emergingConstellationFixtures';
import { useEmergingConstellations } from '@/emergingConstellations/EmergingConstellationsProvider';
import { Fonts, Spacing, TabBarHeight } from '@/constants/theme';

export function EmergingConstellationJoinedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tabInset = TabBarHeight + Math.max(insets.bottom, 8);
  const { joinedMemberships, resolveConstellation } = useEmergingConstellations();

  const communities = useMemo(
    () =>
      joinedMemberships
        .map((entry) => resolveConstellation(entry.communityId))
        .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry)),
    [joinedMemberships, resolveConstellation],
  );

  const handleBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/home' as never);
  }, [router]);

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#12182A', '#1A2240', '#141A2E']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: tabInset }]}>
          <Pressable onPress={handleBack} style={styles.back}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
          <Text style={styles.title}>Your communities</Text>
          {communities.length === 0 ? (
            <Text style={styles.empty}>You have not joined a community yet.</Text>
          ) : (
            communities.map((community) => (
              <Pressable
                key={community.id}
                style={styles.card}
                onPress={() =>
                  router.push(
                    `/emerging-constellation?id=${encodeURIComponent(community.id)}` as never,
                  )
                }>
                <Text style={styles.cardTitle}>{community.name}</Text>
                <Text style={styles.cardBody} numberOfLines={2}>
                  {community.description}
                </Text>
              </Pressable>
            ))
          )}
          <Pressable
            style={styles.qaLink}
            onPress={() =>
              router.push(
                `/emerging-constellation/preview?id=${encodeURIComponent(DEV_EMERGING_CONSTELLATION_ID)}` as never,
              )
            }>
            <Text style={styles.qaLinkText}>Explore emerging community</Text>
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
  title: { fontFamily: Fonts.serif, fontSize: 26, color: '#FFF8F0', marginTop: 8 },
  empty: { fontFamily: Fonts.sans, fontSize: 14, color: 'rgba(248,244,236,0.62)', marginTop: 16 },
  card: {
    marginTop: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(10, 14, 34, 0.72)',
  },
  cardTitle: { fontFamily: Fonts.sans, fontSize: 16, fontWeight: '700', color: '#FFF8F0' },
  cardBody: { fontFamily: Fonts.sans, fontSize: 13, lineHeight: 18, color: 'rgba(248,244,236,0.65)', marginTop: 4 },
  qaLink: { marginTop: 24, alignItems: 'center' },
  qaLinkText: { fontFamily: Fonts.sans, fontSize: 12, color: '#C4B5FD' },
});
