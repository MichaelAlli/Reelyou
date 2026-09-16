import { useRouter } from 'expo-router';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import Animated, { type AnimatedStyle } from 'react-native-reanimated';

import { HomeGlassCard } from '@/components/home/HomeGlassCard';
import { HomeMySkyGraphic } from '@/components/home/graphics/HomeMySkyGraphic';
import { HomeCopy } from '@/constants/homeCopy';
import { HomeLayout, HomePalette } from '@/constants/homeLayout';
import { Fonts } from '@/constants/theme';
import { useThemedStyles } from '@/theme/useTheme';

interface HomeMySkyCardProps {
  animatedStyle?: AnimatedStyle<ViewStyle>;
}

function HomeMySkyCardComponent({ animatedStyle }: HomeMySkyCardProps) {
  const router = useRouter();
  const styles = useThemedStyles((tokens) =>
    StyleSheet.create({
      cardWrap: {
        width: '100%',
      },
      header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 8,
        marginBottom: 8,
        flexShrink: 0,
        zIndex: 2,
      },
      titleBlock: { flex: 1, gap: 3, minWidth: 0 },
      titleRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
      title: {
        fontFamily: Fonts.serif,
        fontSize: 18.5,
        fontWeight: '600',
        color: HomePalette.textPrimary,
        letterSpacing: -0.15,
      },
      info: {
        fontFamily: Fonts.sans,
        fontSize: 8.5,
        fontWeight: '600',
        color: HomePalette.lavender,
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 1,
        borderColor: 'rgba(195, 177, 225, 0.45)',
        textAlign: 'center',
        lineHeight: 12,
        overflow: 'hidden',
      },
      support: {
        fontFamily: Fonts.sans,
        fontSize: 11.5,
        lineHeight: 15,
        color: 'rgba(235, 228, 248, 0.72)',
      },
      ctaPress: {
        minHeight: 44,
        justifyContent: 'center',
        flexShrink: 0,
      },
      cta: {
        fontFamily: Fonts.sans,
        fontSize: 11.5,
        fontWeight: '600',
        color: tokens.gold,
        letterSpacing: 0.02,
      },
      canvas: {
        width: '100%',
        aspectRatio: HomeLayout.mySkyAspect,
        minHeight: HomeLayout.mySkyVisual,
        marginHorizontal: -8,
        marginBottom: -6,
        borderRadius: 16,
        overflow: 'hidden',
        zIndex: 1,
        backgroundColor: 'transparent',
      },
    }),
  );

  return (
    <Animated.View style={[styles.cardWrap, animatedStyle]}>
      <HomeGlassCard minHeight={HomeLayout.mySkyHeight} vibrant>
        <View style={styles.header}>
          <View style={styles.titleBlock}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{HomeCopy.mySkyTitle}</Text>
              <Text style={styles.info} importantForAccessibility="no-hide-descendants">
                i
              </Text>
            </View>
            <Text style={styles.support}>{HomeCopy.mySkySupport}</Text>
          </View>
          <Pressable
            hitSlop={12}
            style={styles.ctaPress}
            accessibilityRole="button"
            accessibilityLabel="View full My Sky"
            onPress={() => router.push('/(tabs)/sky' as never)}>
            <Text style={styles.cta}>{HomeCopy.mySkyCta}</Text>
          </Pressable>
        </View>
        <View style={styles.canvas} importantForAccessibility="no-hide-descendants">
          <HomeMySkyGraphic />
        </View>
      </HomeGlassCard>
    </Animated.View>
  );
}

export const HomeMySkyCard = memo(HomeMySkyCardComponent);
