import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomNav } from '@/components/BottomNav';
import { ConstellationPeoplePreview } from '@/components/emergingConstellations/ConstellationPeoplePreview';
import { GlowButton } from '@/components/GlowButton';
import {
  CommunityExperienceCopy,
  constellationEmotionalLine,
  formatPeopleHereLine,
} from '@/constants/communityExperienceCopy';
import { CAREER_TRANSITION_MEMBER_FIXTURES } from '@/emergingConstellations/communitySocialFixtures';
import { resolveEmergingConstellationById } from '@/emergingConstellations/emergingConstellationFixtures';
import { useEmergingConstellations } from '@/emergingConstellations/EmergingConstellationsProvider';
import { Fonts, Spacing, TabBarHeight } from '@/constants/theme';

export function EmergingConstellationPreviewScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const insets = useSafeAreaInsets();
  const tabInset = TabBarHeight + Math.max(insets.bottom, 8);
  const { joinConstellation, dismissSuggestion } = useEmergingConstellations();
  const [whyOpen, setWhyOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  const constellation = useMemo(() => resolveEmergingConstellationById(id ?? null), [id]);

  const peoplePreview = useMemo(() => {
    const others = CAREER_TRANSITION_MEMBER_FIXTURES.filter(
      (entry) => entry.userId !== 'community-fixture-morgan',
    )
      .slice(0, 5)
      .map((entry) => entry.displayName.split(' ')[0]);
    const line = formatPeopleHereLine(others.slice(0, 3));
    return { names: others, line };
  }, []);

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

  const emotionalLine = constellationEmotionalLine(constellation);

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#12182A', '#1A2240', '#141A2E']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: tabInset }]}>
          <Pressable onPress={handleBack} style={styles.back}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>

          <Text style={styles.eyebrow}>{CommunityExperienceCopy.constellationFormingCue}</Text>
          <Text style={styles.title}>{constellation.name}</Text>
          <Text style={styles.emotional}>{emotionalLine}</Text>

          <ConstellationPeoplePreview names={peoplePreview.names} peopleLine={peoplePreview.line} />

          <View style={styles.ctaBlock}>
            <GlowButton
              label={CommunityExperienceCopy.explore}
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
              <Text style={styles.notNowText}>{CommunityExperienceCopy.notNow}</Text>
            </Pressable>
          </View>

          <Pressable onPress={() => setWhyOpen((open) => !open)} style={styles.disclosure}>
            <Text style={styles.disclosureLink}>{CommunityExperienceCopy.whyThis}</Text>
          </Pressable>
          {whyOpen ? <Text style={styles.disclosureBody}>{CommunityExperienceCopy.whyThisBody}</Text> : null}

          <Pressable onPress={() => setAboutOpen((open) => !open)} style={styles.disclosure}>
            <Text style={styles.disclosureMuted}>{CommunityExperienceCopy.aboutConstellation}</Text>
          </Pressable>
          {aboutOpen ? (
            <Text style={styles.disclosureBodyMuted}>{constellation.humanExplanation}</Text>
          ) : null}
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
  eyebrow: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(248,244,236,0.55)',
    marginTop: 12,
  },
  title: { fontFamily: Fonts.serif, fontSize: 32, color: '#FFF8F0', marginTop: 8 },
  emotional: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    lineHeight: 21,
    color: 'rgba(248,244,236,0.78)',
    marginTop: 8,
  },
  ctaBlock: { marginTop: 28 },
  notNow: { alignItems: 'center', paddingVertical: 16 },
  notNowText: { fontFamily: Fonts.sans, fontSize: 13, color: 'rgba(248,244,236,0.55)' },
  disclosure: { paddingVertical: 10, alignItems: 'center' },
  disclosureLink: { fontFamily: Fonts.sans, fontSize: 12, fontWeight: '600', color: 'rgba(196, 168, 255, 0.85)' },
  disclosureMuted: { fontFamily: Fonts.sans, fontSize: 11, color: 'rgba(248,244,236,0.4)' },
  disclosureBody: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    lineHeight: 17,
    color: 'rgba(248,244,236,0.55)',
    textAlign: 'center',
    marginBottom: 4,
    paddingHorizontal: 8,
  },
  disclosureBodyMuted: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    lineHeight: 16,
    color: 'rgba(248,244,236,0.42)',
    textAlign: 'center',
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  unavailable: { textAlign: 'center', marginTop: 80, color: '#FFF8F0' },
});
