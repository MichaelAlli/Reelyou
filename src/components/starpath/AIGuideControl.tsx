import { memo } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

import { GuideStarOrb } from '@/components/starpath/GuideStarOrb';
import {
  StarPathGlass,
  StarPathSpacing,
  StarPathTypography,
  starpathCardShadow,
  starpathGlassControl,
} from '@/components/starpath/starpathGlass';
import { Fonts } from '@/constants/theme';
import type { StarPathThemeTokens } from '@/starpath/starpathTheme';

interface AIGuideControlProps {
  theme: StarPathThemeTokens;
  expanded: boolean;
  onExpand: () => void;
  onCollapse: () => void;
  reduceMotion?: boolean;
  reactionHint?: string | null;
}

function AIGuideControlComponent({
  theme,
  expanded,
  onExpand,
  onCollapse,
  reduceMotion,
  reactionHint,
}: AIGuideControlProps) {
  const router = useRouter();

  if (!expanded) {
    return (
      <Pressable
        onPress={onExpand}
        hitSlop={6}
        style={({ pressed }) => [
          starpathGlassControl.base,
          styles.trigger,
          pressed && starpathGlassControl.pressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Open AI Guide"
        testID="ai-guide-trigger"
      >
        <GuideStarOrb size={40} />
      </Pressable>
    );
  }

  const entering = reduceMotion ? undefined : FadeIn.duration(280);
  const exiting = reduceMotion ? undefined : FadeOut.duration(220);

  return (
    <View style={styles.expandedRoot} testID="ai-guide-panel">
      <Pressable style={styles.backdrop} onPress={onCollapse} accessibilityLabel="Dismiss AI Guide" />
      <Animated.View entering={entering} exiting={exiting} style={styles.panelWrap}>
        <View style={styles.panel}>
          <GuideStarOrb size={32} />
          <Text style={[styles.title, { color: theme.labelBright }]}>AI GUIDE</Text>
          <Text style={[styles.hint, { color: theme.labelMuted }]}>
            {reactionHint ?? 'Guidance for this stretch of your Starpath.'}
          </Text>
          <View style={styles.actions}>
            <Pressable
              onPress={() => router.push('/companion')}
              style={({ pressed }) => [styles.linkBtn, pressed && styles.pressed]}
            >
              <Text style={[styles.linkText, { color: theme.pathGold }]}>Open guide</Text>
            </Pressable>
            <Pressable
              onPress={onCollapse}
              style={({ pressed }) => [styles.closeBtn, pressed && styles.pressed]}
              accessibilityLabel="Close AI Guide"
            >
              <Text style={[styles.closeText, { color: theme.labelBright }]}>Done</Text>
            </Pressable>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

export const AIGuideControl = memo(AIGuideControlComponent);
export const AICompanionCard = AIGuideControl;
export const AICompanionControl = AIGuideControl;

const styles = StyleSheet.create({
  trigger: {
    borderColor: StarPathGlass.guideAccentBorder,
  },
  pressed: {
    opacity: 0.88,
  },
  expandedRoot: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 40,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: StarPathGlass.backdropDim,
  },
  panelWrap: {
    position: 'absolute',
    top: StarPathSpacing.guideTop,
    left: StarPathSpacing.guideLeft,
    maxWidth: 200,
  },
  panel: {
    borderRadius: 16,
    paddingVertical: 11,
    paddingHorizontal: 14,
    backgroundColor: StarPathGlass.cardBg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: StarPathGlass.guideAccentBorder,
    alignItems: 'center',
    gap: 6,
    ...starpathCardShadow,
  },
  title: {
    fontFamily: Fonts.sans,
    ...StarPathTypography.kicker,
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : null),
  },
  hint: {
    fontFamily: Fonts.sans,
    ...StarPathTypography.caption,
    color: StarPathTypography.mutedLilac,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  linkBtn: {
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  linkText: {
    fontFamily: Fonts.sans,
    fontSize: 10,
    fontWeight: '600',
  },
  closeBtn: {
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  closeText: {
    fontFamily: Fonts.sans,
    fontSize: 10,
    fontWeight: '600',
  },
});
