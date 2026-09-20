import { memo } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, Path, RadialGradient, Stop } from 'react-native-svg';

import {
  StarPathGlass,
  StarPathTypography,
  starpathCardShadow,
} from '@/components/starpath/starpathGlass';
import { Fonts } from '@/constants/theme';
import type { StarPathThemeTokens } from '@/starpath/starpathTheme';

interface NextStepCardProps {
  theme: StarPathThemeTokens;
  onPress?: () => void;
  onDismiss?: () => void;
}

function NextStepCardComponent({ theme, onPress, onDismiss }: NextStepCardProps) {
  const body = (
    <>
        <Text style={[styles.kicker, { color: theme.labelMuted }]}>NEXT STEP</Text>

        <View style={styles.iconWrap}>
          <Svg width={40} height={40}>
            <Defs>
              <RadialGradient id="nextSparkle" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={1} />
                <Stop offset="45%" stopColor="#FFE8A8" stopOpacity={0.96} />
                <Stop offset="100%" stopColor={theme.pathGoldBright} stopOpacity={0.86} />
              </RadialGradient>
            </Defs>
            <Circle cx={20} cy={20} r={17} fill="url(#nextSparkle)" />
            <Circle cx={20} cy={20} r={17} fill="transparent" stroke={theme.pathGold} strokeWidth={1} />
            <Path
              d="M 6 20 C 10 18, 14 16, 20 16 C 26 16, 30 18, 34 20"
              stroke="rgba(255,230,180,0.55)"
              strokeWidth={1}
              fill="none"
            />
            <Path
              d="M 6 20 C 10 22, 14 24, 20 24 C 26 24, 30 22, 34 20"
              stroke="rgba(255,230,180,0.4)"
              strokeWidth={1}
              fill="none"
            />
          </Svg>
          <Text style={styles.sparkle}>✦</Text>
        </View>

        <Text style={[styles.title, { color: theme.labelBright }]}>Share a reflection</Text>

        <View style={styles.progressRow}>
          {[0, 1, 2, 3, 4].map((i) => (
            <View
              key={`seg-${i}`}
              style={[
                styles.segment,
                { backgroundColor: i <= 1 ? theme.pathGold : 'rgba(255, 255, 255, 0.12)' },
              ]}
            />
          ))}
        </View>
    </>
  );

  return (
    <View style={styles.wrap} testID="next-step-card">
      <View style={styles.card}>
        {onDismiss ? (
          <Pressable
            onPress={onDismiss}
            hitSlop={8}
            style={styles.dismiss}
            accessibilityRole="button"
            accessibilityLabel="Collapse Next Step"
          >
            <Text style={[styles.dismissText, { color: theme.labelMuted }]}>×</Text>
          </Pressable>
        ) : null}
        {onPress ? (
          <Pressable
            onPress={onPress}
            style={({ pressed }) => [styles.body, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Next step: Share a reflection"
          >
            {body}
          </Pressable>
        ) : (
          <View style={styles.body}>{body}</View>
        )}
      </View>
    </View>
  );
}

export const NextStepCard = memo(NextStepCardComponent);

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    maxWidth: 146,
  },
  pressed: {
    opacity: 0.94,
  },
  body: {
    alignItems: 'center',
    gap: 4,
    width: '100%',
  },
  card: {
    borderRadius: StarPathGlass.cardRadius - 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: StarPathGlass.cardBorder,
    backgroundColor: StarPathGlass.cardBg,
    paddingVertical: 10,
    paddingHorizontal: 11,
    alignItems: 'center',
    ...starpathCardShadow,
  },
  kicker: {
    fontFamily: Fonts.sans,
    fontSize: 8,
    letterSpacing: 1.35,
    fontWeight: '700',
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : null),
  },
  iconWrap: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkle: {
    position: 'absolute',
    fontSize: 15,
    color: '#1A1538',
    fontWeight: '700',
  },
  title: {
    fontFamily: Fonts.sans,
    fontWeight: '600',
    fontSize: 11,
    lineHeight: 15,
    textAlign: 'center',
    color: StarPathTypography.warmWhite,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 3,
    marginTop: 1,
    width: '100%',
    maxWidth: 100,
    justifyContent: 'center',
  },
  segment: {
    flex: 1,
    maxWidth: 16,
    height: 2,
    borderRadius: 2,
  },
  dismiss: {
    position: 'absolute',
    top: 2,
    right: 4,
    zIndex: 2,
    padding: 8,
    minWidth: 36,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissText: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    lineHeight: 16,
    fontWeight: '600',
  },
});
