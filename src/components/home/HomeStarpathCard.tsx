import { memo } from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import Animated, { type AnimatedStyle } from 'react-native-reanimated';

import { HomeGlassCard } from '@/components/home/HomeGlassCard';
import { HomeStarpathGraphic } from '@/components/home/graphics/HomeStarpathGraphic';
import { HomeCopy } from '@/constants/homeCopy';
import { HomeLayout, HomePalette } from '@/constants/homeLayout';
import { Fonts } from '@/constants/theme';
import { useThemedStyles } from '@/theme/useTheme';

interface HomeStarpathCardProps {
  animatedStyle?: AnimatedStyle<ViewStyle>;
}

function HomeStarpathCardComponent({ animatedStyle }: HomeStarpathCardProps) {
  const styles = useThemedStyles((tokens) =>
    StyleSheet.create({
      header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 8,
        marginBottom: 8,
        flexShrink: 0,
        zIndex: 2,
      },
      titleRow: { flex: 1, gap: 3, minWidth: 0 },
      title: {
        fontFamily: Fonts.serif,
        fontSize: 18.5,
        fontWeight: '600',
        color: HomePalette.textPrimary,
        letterSpacing: -0.18,
      },
      starAccent: {
        color: tokens.gold,
        fontSize: 11,
      },
      subtitle: {
        fontFamily: Fonts.sans,
        fontSize: 11.5,
        lineHeight: 15,
        color: 'rgba(235, 228, 248, 0.72)',
      },
      cta: {
        fontFamily: Fonts.sans,
        fontSize: 11.5,
        fontWeight: '600',
        color: tokens.gold,
        paddingTop: 2,
        letterSpacing: 0.02,
        flexShrink: 0,
      },
      visual: {
        flex: 1,
        minHeight: HomeLayout.starpathVisual,
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
    <Animated.View style={animatedStyle}>
      <HomeGlassCard height={HomeLayout.starpathHeight} vibrant>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>
              <Text style={styles.starAccent}>✦ </Text>
              {HomeCopy.starpathTitle}
            </Text>
            <Text style={styles.subtitle}>{HomeCopy.starpathSubtitle}</Text>
          </View>
          <Text style={styles.cta}>{HomeCopy.starpathCta}</Text>
        </View>
        <View style={styles.visual}>
          <HomeStarpathGraphic />
        </View>
      </HomeGlassCard>
    </Animated.View>
  );
}

export const HomeStarpathCard = memo(HomeStarpathCardComponent);
