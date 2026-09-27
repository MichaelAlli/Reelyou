import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
  AccessibilityInfo,
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  UIManager,
  View,
  type ViewStyle,
} from 'react-native';
import Animated, { type AnimatedStyle } from 'react-native-reanimated';

import { EmotionAiCopy } from '@/constants/emotionAiCopy';
import { HomeCopy } from '@/constants/homeCopy';
import { HomePalette } from '@/constants/homeLayout';
import { Fonts } from '@/constants/theme';
import { useEmergingConstellations } from '@/emergingConstellations/EmergingConstellationsProvider';
import {
  emergingGroupsHomeSignature,
  loadHomeEmergingGroupsHiddenSignature,
  saveHomeEmergingGroupsHiddenSignature,
} from '@/emergingConstellations/homeEmergingGroupsChipState';
import { listEligibleEmergingConstellations } from '@/emergingConstellations/listEligibleEmergingConstellations';
import { resolveEmergingConstellationRoute } from '@/emergingConstellations/resolveEmergingConstellationRoute';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface HomeEmergingConstellationSectionProps {
  animatedStyle?: AnimatedStyle<ViewStyle>;
}

function HomeEmergingConstellationSectionComponent({
  animatedStyle,
}: HomeEmergingConstellationSectionProps) {
  const router = useRouter();
  const { activeSuggestion, joinedMemberships, resolveConstellation, membershipFor } =
    useEmergingConstellations();

  const groups = useMemo(
    () =>
      listEligibleEmergingConstellations(
        activeSuggestion,
        joinedMemberships,
        resolveConstellation,
      ),
    [activeSuggestion, joinedMemberships, resolveConstellation],
  );

  const groupSignature = useMemo(
    () => emergingGroupsHomeSignature(groups.map((group) => group.id)),
    [groups],
  );

  const [expanded, setExpanded] = useState(false);
  const [hiddenSignature, setHiddenSignature] = useState<string | null>(null);
  const [chipReady, setChipReady] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let live = true;
    void loadHomeEmergingGroupsHiddenSignature().then((value) => {
      if (live) {
        setHiddenSignature(value);
        setChipReady(true);
      }
    });
    AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (live) setReduceMotion(value);
    });
    return () => {
      live = false;
    };
  }, []);

  const openGroup = useCallback(
    (constellationId: string) => {
      const route = resolveEmergingConstellationRoute(constellationId, membershipFor(constellationId));
      router.push(route as never);
    },
    [membershipFor, router],
  );

  const animateLayout = useCallback(() => {
    if (reduceMotion) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [reduceMotion]);

  const toggleExpanded = useCallback(() => {
    animateLayout();
    setExpanded((open) => !open);
  }, [animateLayout]);

  const hideChip = useCallback(() => {
    animateLayout();
    setExpanded(false);
    setHiddenSignature(groupSignature);
    void saveHomeEmergingGroupsHiddenSignature(groupSignature);
  }, [animateLayout, groupSignature]);

  if (groups.length === 0 || !chipReady) return null;
  if (hiddenSignature === groupSignature) return null;

  const countLabel =
    groups.length === 1 ? '1 Emerging Group' : `${groups.length} Emerging Groups`;

  return (
    <Animated.View style={[styles.wrap, animatedStyle]}>
      <View style={styles.chipRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded }}
          accessibilityLabel={
            expanded
              ? `Collapse ${countLabel}`
              : `Expand ${countLabel}`
          }
          onPress={toggleExpanded}
          style={styles.chipPress}>
          <LinearGradient
            colors={['rgba(36, 28, 52, 0.92)', 'rgba(22, 18, 38, 0.94)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.chip}>
            <Text style={styles.chipSpark}>✨</Text>
            <Text style={styles.chipLabel} numberOfLines={1}>
              {countLabel}
            </Text>
            <Text style={styles.chipCaret}>{expanded ? '▴' : '▾'}</Text>
          </LinearGradient>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Hide Emerging Groups on Home"
          hitSlop={8}
          onPress={hideChip}
          style={styles.hideBtn}>
          <Text style={styles.hideText}>×</Text>
        </Pressable>
      </View>

      {expanded ? (
        <View style={styles.expanded}>
          <Text style={styles.sectionTitle}>{HomeCopy.emergingGroupsTitle}</Text>
          <Text style={styles.sectionSupport}>{HomeCopy.emergingGroupsSubtitle}</Text>
          {groups.map((group) => {
            const joined = membershipFor(group.id)?.status === 'joined';
            return (
              <Pressable
                key={group.id}
                accessibilityRole="button"
                accessibilityLabel={`Open Emerging Group: ${group.name}`}
                onPress={() => openGroup(group.id)}>
                <LinearGradient
                  colors={['rgba(62, 42, 108, 0.55)', 'rgba(36, 24, 68, 0.72)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.card}>
                  <Text style={styles.eyebrow}>
                    {joined ? 'Your emerging group' : 'A constellation may be forming'}
                  </Text>
                  <Text style={styles.title}>{group.name}</Text>
                  <Text style={styles.body}>{group.sharedTheme}</Text>
                  <Text style={styles.transparency}>{EmotionAiCopy.aiTransparencyShort}</Text>
                  <Text style={styles.cta}>{joined ? 'Open group →' : 'View group →'}</Text>
                </LinearGradient>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </Animated.View>
  );
}

export const HomeEmergingConstellationSection = memo(HomeEmergingConstellationSectionComponent);

const styles = StyleSheet.create({
  wrap: { width: '100%' },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chipPress: {
    flex: 1,
    flexShrink: 1,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232, 200, 114, 0.28)',
    minHeight: 38,
  },
  chipSpark: {
    fontSize: 12,
  },
  chipLabel: {
    flex: 1,
    fontFamily: Fonts.sans,
    fontSize: 12.5,
    fontWeight: '600',
    color: 'rgba(248, 244, 236, 0.92)',
    letterSpacing: -0.1,
  },
  chipCaret: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: 'rgba(232, 200, 114, 0.75)',
  },
  hideBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(8, 12, 28, 0.55)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(248, 244, 236, 0.12)',
  },
  hideText: {
    fontFamily: Fonts.sans,
    fontSize: 18,
    lineHeight: 20,
    color: 'rgba(248, 244, 236, 0.45)',
    marginTop: -1,
  },
  expanded: {
    marginTop: 10,
    gap: 8,
  },
  sectionTitle: {
    fontFamily: Fonts.serif,
    fontSize: 18.5,
    fontWeight: '600',
    color: HomePalette.textPrimary,
    letterSpacing: -0.15,
  },
  sectionSupport: {
    fontFamily: Fonts.sans,
    fontSize: 11.5,
    lineHeight: 15,
    color: 'rgba(235, 228, 248, 0.72)',
    marginTop: -2,
    marginBottom: 4,
  },
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
  },
  transparency: {
    fontFamily: Fonts.sans,
    fontSize: 10,
    lineHeight: 14,
    color: 'rgba(248, 244, 236, 0.55)',
  },
  cta: {
    fontFamily: Fonts.sans,
    fontSize: 11.5,
    fontWeight: '600',
    color: '#F5E6B8',
    marginTop: 4,
  },
});
