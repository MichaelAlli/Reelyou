import { LinearGradient } from 'expo-linear-gradient';
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
import { useRouter } from 'expo-router';

import { HomeSkywriteSendIcon } from '@/components/home/HomeSkywriteSendIcon';
import { SkywriteTabIcon } from '@/components/nav/SkywriteTabIcon';
import { HomeCopy } from '@/constants/homeCopy';
import { HomePalette } from '@/constants/homeLayout';
import { Fonts } from '@/constants/theme';

interface HomeSkywriteBarProps {
  animatedStyle?: AnimatedStyle<ViewStyle>;
}

/** Compact Skywrite entry — local sizing only; does not alter global Home layout tokens. */
const SKYWRITE = {
  height: 58,
  radius: 16,
  padH: 13,
  padV: 10,
  iconCircle: 34,
  gap: 11,
} as const;

function HomeSkywriteBarComponent({ animatedStyle }: HomeSkywriteBarProps) {
  const router = useRouter();

  return (
    <Animated.View style={[styles.wrap, animatedStyle]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open Skywrite"
        onPress={() => router.push('/skywrite/compose' as never)}
        style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}>
        <View style={styles.shell}>
          <LinearGradient
            colors={['rgba(10, 12, 30, 0.96)', 'rgba(5, 7, 18, 0.98)', 'rgba(8, 10, 26, 0.97)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.045)', 'transparent']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 0.35 }}
            style={styles.topSheen}
            pointerEvents="none"
          />
          <View style={styles.topAccent} pointerEvents="none" />

          <View style={styles.row}>
            <View style={styles.iconCircle} importantForAccessibility="no-hide-descendants">
              <SkywriteTabIcon size={22} active />
            </View>

            <View style={styles.copy}>
              <Text style={styles.hint} numberOfLines={1}>
                {HomeCopy.skywriteHint}
              </Text>
              <Text style={styles.main} numberOfLines={1}>
                {HomeCopy.skywritePlaceholder}
              </Text>
            </View>

            <View style={styles.iconCircle} importantForAccessibility="no-hide-descendants">
              <HomeSkywriteSendIcon size={16} />
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export const HomeSkywriteBar = memo(HomeSkywriteBarComponent);

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
  },
  pressable: {
    borderRadius: SKYWRITE.radius,
  },
  pressed: {
    opacity: 0.94,
    transform: [{ scale: 0.995 }],
  },
  shell: {
    minHeight: SKYWRITE.height,
    borderRadius: SKYWRITE.radius,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth + 0.5,
    borderColor: 'rgba(232, 200, 114, 0.24)',
    backgroundColor: HomePalette.navyMid,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.22,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
      default: {},
    }),
  },
  topSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '38%',
  },
  topAccent: {
    position: 'absolute',
    top: 0,
    left: 18,
    right: 18,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(232, 200, 114, 0.14)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SKYWRITE.gap,
    minHeight: SKYWRITE.height,
    paddingHorizontal: SKYWRITE.padH,
    paddingVertical: SKYWRITE.padV,
  },
  iconCircle: {
    width: SKYWRITE.iconCircle,
    height: SKYWRITE.iconCircle,
    borderRadius: SKYWRITE.iconCircle / 2,
    borderWidth: StyleSheet.hairlineWidth + 0.5,
    borderColor: 'rgba(232, 200, 114, 0.34)',
    backgroundColor: 'rgba(232, 200, 114, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  copy: {
    flex: 1,
    justifyContent: 'center',
    gap: 3,
    minWidth: 0,
    zIndex: 2,
  },
  hint: {
    fontFamily: Fonts.sans,
    fontSize: 10.5,
    lineHeight: 13,
    letterSpacing: 0.08,
    color: 'rgba(214, 206, 232, 0.62)',
  },
  main: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '500',
    letterSpacing: -0.15,
    color: 'rgba(252, 251, 248, 0.94)',
  },
});
