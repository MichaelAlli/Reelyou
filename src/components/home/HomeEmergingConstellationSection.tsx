import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import Animated, { type AnimatedStyle } from 'react-native-reanimated';

import { EmotionAiCopy } from '@/constants/emotionAiCopy';
import { HomePalette } from '@/constants/homeLayout';
import { Fonts } from '@/constants/theme';
import { useEmergingConstellations } from '@/emergingConstellations/EmergingConstellationsProvider';

interface HomeEmergingConstellationSectionProps {
  animatedStyle?: AnimatedStyle<ViewStyle>;
}

function HomeEmergingConstellationSectionComponent({
  animatedStyle,
}: HomeEmergingConstellationSectionProps) {
  const router = useRouter();
  const { activeSuggestion, dismissSuggestion } = useEmergingConstellations();

  if (!activeSuggestion) return null;

  return (
    <Animated.View style={[styles.wrap, animatedStyle]}>
      <LinearGradient
        colors={['rgba(62, 42, 108, 0.55)', 'rgba(36, 24, 68, 0.72)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}>
        <Text style={styles.eyebrow}>A constellation may be forming</Text>
        <Text style={styles.title}>{activeSuggestion.name}</Text>
        <Text style={styles.body}>{activeSuggestion.sharedTheme}</Text>
        <Text style={styles.transparency}>{EmotionAiCopy.aiTransparencyShort}</Text>
        <Text style={styles.transparencyMuted}>{EmotionAiCopy.aiSuggestionControl}</Text>
        <View style={styles.row}>
          <Pressable
            style={styles.primary}
            onPress={() =>
              router.push(
                `/emerging-constellation/preview?id=${encodeURIComponent(activeSuggestion.id)}` as never,
              )
            }>
            <Text style={styles.primaryText}>Explore</Text>
          </Pressable>
          <Pressable
            style={styles.secondary}
            onPress={() => dismissSuggestion(activeSuggestion.id)}>
            <Text style={styles.secondaryText}>Not now</Text>
          </Pressable>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

export const HomeEmergingConstellationSection = memo(HomeEmergingConstellationSectionComponent);

const styles = StyleSheet.create({
  wrap: { width: '100%' },
  card: {
    borderRadius: 18,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(196, 168, 255, 0.35)',
    gap: 6,
  },
  eyebrow: {
    fontFamily: Fonts.sans,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: 'rgba(248, 244, 236, 0.65)',
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 18,
    fontWeight: '600',
    color: HomePalette.textPrimary,
  },
  body: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    lineHeight: 17,
    color: 'rgba(248, 244, 236, 0.78)',
    marginBottom: 4,
  },
  transparency: {
    fontFamily: Fonts.sans,
    fontSize: 10,
    lineHeight: 14,
    color: 'rgba(248, 244, 236, 0.55)',
  },
  transparencyMuted: {
    fontFamily: Fonts.sans,
    fontSize: 10,
    lineHeight: 14,
    color: 'rgba(248, 244, 236, 0.45)',
    marginBottom: 6,
  },
  row: { flexDirection: 'row', gap: 10, marginTop: 4 },
  primary: {
    minHeight: 40,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: 'rgba(232, 200, 114, 0.22)',
    justifyContent: 'center',
  },
  primaryText: { fontFamily: Fonts.sans, fontSize: 13, fontWeight: '700', color: '#F5E6B8' },
  secondary: { minHeight: 40, justifyContent: 'center', paddingHorizontal: 8 },
  secondaryText: { fontFamily: Fonts.sans, fontSize: 13, fontWeight: '600', color: 'rgba(248, 244, 236, 0.55)' },
});
