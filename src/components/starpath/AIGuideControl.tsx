/** LOCKED YOUR GUIDE COMPACT EXPERIENCE — preserve approved copy/layout/behavior unless explicitly authorized. */
import { memo } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { GuideStarOrb } from '@/components/starpath/GuideStarOrb';
import {
  StarPathGlass,
  StarPathTypography,
  starpathCardShadow,
  starpathGlassControl,
} from '@/components/starpath/starpathGlass';
import { Fonts } from '@/constants/theme';
import type { StarPathThemeTokens } from '@/starpath/starpathTheme';

interface AIGuideControlProps {
  theme: StarPathThemeTokens;
  variant: 'icon' | 'popup';
  showBeacon?: boolean;
  reduceMotion?: boolean;
  onOpenGuide: () => void;
  onDismissPopup?: () => void;
}

function AIGuideControlComponent({
  theme,
  variant,
  showBeacon = false,
  reduceMotion,
  onOpenGuide,
  onDismissPopup,
}: AIGuideControlProps) {
  if (variant === 'icon') {
    return (
      <Pressable
        onPress={onOpenGuide}
        hitSlop={6}
        style={({ pressed }) => [
          starpathGlassControl.base,
          styles.trigger,
          pressed && starpathGlassControl.pressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Open Your Guide"
        testID="ai-guide-trigger"
      >
        {showBeacon ? <View style={styles.beaconRing} pointerEvents="none" /> : null}
        {showBeacon ? <View style={styles.beaconDot} pointerEvents="none" /> : null}
        <GuideStarOrb size={40} />
      </Pressable>
    );
  }

  const entering = reduceMotion ? undefined : FadeIn.duration(220);
  const exiting = reduceMotion ? undefined : FadeOut.duration(180);

  return (
    <Animated.View
      entering={entering}
      exiting={exiting}
      style={styles.panelWrap}
      testID="ai-guide-panel"
      pointerEvents="box-none"
    >
      <View style={styles.panel}>
        <GuideStarOrb size={28} />
        <Text style={[styles.title, { color: theme.labelBright }]}>Your Guide</Text>
        <Text style={[styles.subtitle, { color: theme.labelMuted }]}>Here to assist</Text>
        <View style={styles.actions}>
          <Pressable
            onPress={onOpenGuide}
            style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Open Your Guide"
          >
            <Text style={[styles.actionText, { color: theme.pathGold }]}>Open</Text>
          </Pressable>
          <Pressable
            onPress={onDismissPopup}
            style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Dismiss Guide"
          >
            <Text style={[styles.actionText, { color: theme.labelMuted }]}>Dismiss</Text>
          </Pressable>
        </View>
      </View>
    </Animated.View>
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
  beaconRing: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(232, 200, 114, 0.45)',
    backgroundColor: 'rgba(140, 120, 255, 0.12)',
  },
  beaconDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#E8C872',
    borderWidth: 1,
    borderColor: 'rgba(255, 248, 235, 0.9)',
  },
  panelWrap: {
    zIndex: 40,
  },
  panel: {
    borderRadius: 10,
    paddingTop: 6,
    paddingBottom: 7,
    paddingHorizontal: 10,
    minWidth: 96,
    maxWidth: 112,
    backgroundColor: StarPathGlass.cardBg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: StarPathGlass.guideAccentBorder,
    alignItems: 'center',
    gap: 3,
    ...starpathCardShadow,
  },
  title: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.1,
    textAlign: 'center',
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : null),
  },
  subtitle: {
    fontFamily: Fonts.sans,
    fontSize: 9,
    lineHeight: 11,
    textAlign: 'center',
    marginBottom: 1,
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : null),
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 1,
  },
  actionBtn: {
    paddingVertical: 2,
    paddingHorizontal: 2,
    minHeight: 26,
    justifyContent: 'center',
  },
  actionText: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '600',
    color: StarPathTypography.warmWhite,
  },
});
