import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { memo } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import Animated, { type AnimatedStyle } from 'react-native-reanimated';

import { HomeTodayFocusIcon } from '@/components/home/HomeTodayFocusIcon';
import { HomeCopy } from '@/constants/homeCopy';
import { HomeLayout, HomePalette } from '@/constants/homeLayout';
import { Fonts } from '@/constants/theme';
import { useThemedStyles } from '@/theme/useTheme';

interface HomeTodayFocusSectionProps {
  animatedStyle?: AnimatedStyle<ViewStyle>;
}

/** Compact Today’s Focus surface — local tokens only. */
const FOCUS = {
  radius: 16,
  pad: 12,
  iconCircle: 34,
  gap: 11,
} as const;

function HomeTodayFocusSectionComponent({ animatedStyle }: HomeTodayFocusSectionProps) {
  const router = useRouter();
  const styles = useThemedStyles((tokens) =>
    StyleSheet.create({
      wrap: {
        width: '100%',
        minHeight: HomeLayout.focusMinHeight,
      },
      shell: {
        borderRadius: FOCUS.radius,
        overflow: 'hidden',
        borderWidth: StyleSheet.hairlineWidth + 0.5,
        borderColor: 'rgba(167, 139, 250, 0.22)',
        backgroundColor: HomePalette.navyMid,
        ...Platform.select({
          ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.16,
            shadowRadius: 6,
          },
          android: { elevation: 2 },
          default: {},
        }),
      },
      topSheen: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '36%',
      },
      topAccent: {
        position: 'absolute',
        top: 0,
        left: 16,
        right: 16,
        height: StyleSheet.hairlineWidth,
        backgroundColor: 'rgba(196, 168, 255, 0.12)',
      },
      inner: {
        padding: FOCUS.pad,
        gap: 8,
      },
      mainRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: FOCUS.gap,
      },
      iconCircle: {
        width: FOCUS.iconCircle,
        height: FOCUS.iconCircle,
        borderRadius: FOCUS.iconCircle / 2,
        borderWidth: StyleSheet.hairlineWidth + 0.5,
        borderColor: 'rgba(167, 139, 250, 0.32)',
        backgroundColor: 'rgba(124, 92, 191, 0.14)',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      },
      center: {
        flex: 1,
        gap: 3,
        paddingTop: 1,
        minWidth: 0,
        zIndex: 2,
      },
      title: {
        fontFamily: Fonts.serif,
        fontSize: 15.5,
        fontWeight: '600',
        color: HomePalette.textPrimary,
        letterSpacing: -0.12,
      },
      prompt: {
        fontFamily: Fonts.sans,
        fontSize: 11.5,
        lineHeight: 15,
        color: 'rgba(235, 228, 248, 0.72)',
      },
      edit: {
        fontFamily: Fonts.sans,
        fontSize: 11,
        fontWeight: '600',
        color: tokens.gold,
        paddingTop: 2,
        flexShrink: 0,
      },
      actionRow: {
        paddingLeft: FOCUS.iconCircle + FOCUS.gap,
        marginTop: -1,
      },
      action: {
        fontFamily: Fonts.sans,
        fontSize: 11.5,
        fontWeight: '600',
        color: tokens.gold,
        letterSpacing: 0.01,
        lineHeight: 16,
        opacity: 0.92,
      },
    }),
  );

  return (
    <Animated.View style={[styles.wrap, animatedStyle]}>
      <View style={styles.shell}>
        <LinearGradient
          colors={['rgba(10, 10, 28, 0.97)', 'rgba(6, 8, 20, 0.98)', 'rgba(8, 8, 24, 0.97)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={['rgba(124, 92, 191, 0.07)', 'transparent', 'rgba(232, 200, 114, 0.04)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.04)', 'transparent']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.4 }}
          style={styles.topSheen}
          pointerEvents="none"
        />
        <View style={styles.topAccent} pointerEvents="none" />

        <View style={styles.inner}>
          <View style={styles.mainRow}>
            <View style={styles.iconCircle}>
              <HomeTodayFocusIcon size={18} />
            </View>
            <View style={styles.center}>
              <Text style={styles.title}>{HomeCopy.todayFocusTitle}</Text>
              <Text style={styles.prompt}>{HomeCopy.todayFocusPrompt}</Text>
            </View>
            <Pressable hitSlop={8}>
              <Text style={styles.edit}>{HomeCopy.todayFocusEdit}</Text>
            </Pressable>
          </View>

          <Pressable
            hitSlop={6}
            style={styles.actionRow}
            onPress={() => router.push('/skywrite' as never)}>
            <Text style={styles.action}>{HomeCopy.todayFocusAction}</Text>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}

export const HomeTodayFocusSection = memo(HomeTodayFocusSectionComponent);
