import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { memo } from 'react';
import { Platform, Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import Animated, { type AnimatedStyle } from 'react-native-reanimated';

import { HomeCopy } from '@/constants/homeCopy';
import { HomePalette } from '@/constants/homeLayout';
import { Fonts } from '@/constants/theme';
import { useOnboarding } from '@/onboarding';

interface HomeTodayFocusCompactRowProps {
  animatedStyle?: AnimatedStyle<ViewStyle>;
}

function HomeTodayFocusCompactRowComponent({ animatedStyle }: HomeTodayFocusCompactRowProps) {
  const router = useRouter();
  const { todayFocus } = useOnboarding();
  const focusText = todayFocus.value?.trim() ?? '';

  if (!focusText) return null;

  return (
    <Animated.View style={[styles.wrap, animatedStyle]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Today's Focus: ${focusText}. View or change.`}
        onPress={() => router.push('/today-focus' as never)}
        style={({ pressed }) => [styles.shell, pressed && styles.pressed]}>
        <LinearGradient
          colors={['rgba(14, 18, 40, 0.92)', 'rgba(8, 10, 26, 0.95)']}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={['rgba(232, 200, 114, 0.08)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <View style={styles.row}>
          <View style={styles.textCol}>
            <Text style={styles.label}>{HomeCopy.todayFocusTitle.toUpperCase()}</Text>
            <Text style={styles.focus} numberOfLines={2}>
              {focusText}
            </Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export const HomeTodayFocusCompactRow = memo(HomeTodayFocusCompactRowComponent);

const styles = StyleSheet.create({
  wrap: { width: '100%' },
  shell: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232, 200, 114, 0.28)',
    minHeight: 56,
    ...Platform.select({
      ios: {
        shadowColor: '#E8C872',
        shadowOpacity: 0.12,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
      },
      android: { elevation: 2 },
      default: {},
    }),
  },
  pressed: { opacity: 0.92 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  textCol: { flex: 1, gap: 3, minWidth: 0 },
  label: {
    fontFamily: Fonts.sans,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.7,
    color: 'rgba(232, 200, 114, 0.85)',
  },
  focus: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '600',
    color: HomePalette.textPrimary,
  },
  chevron: {
    fontSize: 22,
    color: 'rgba(232, 200, 114, 0.75)',
    marginTop: 2,
  },
});
