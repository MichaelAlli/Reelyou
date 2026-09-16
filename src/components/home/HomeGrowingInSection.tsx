import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { memo } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import Animated, { type AnimatedStyle } from 'react-native-reanimated';

import {
  HomeGrowingInPillIcon,
  type GrowingInPillIconType,
} from '@/components/home/HomeGrowingInPillIcon';
import { GROWING_IN_COMMUNITY_IDS } from '@/constants/communitiesData';
import { HomeCopy } from '@/constants/homeCopy';
import { HomeLayout, HomePalette } from '@/constants/homeLayout';
import { Fonts } from '@/constants/theme';
import { useThemedStyles } from '@/theme/useTheme';

interface HomeGrowingInSectionProps {
  animatedStyle?: AnimatedStyle<ViewStyle>;
}

const PILL_THEMES: Array<{
  icon: GrowingInPillIconType;
  iconColor: string;
  gradient: [string, string, string];
  border: string;
  sheen: string;
}> = [
  {
    icon: 'briefcase',
    iconColor: '#C4B5FD',
    gradient: ['rgba(62, 42, 108, 0.92)', 'rgba(48, 32, 88, 0.88)', 'rgba(36, 24, 68, 0.94)'],
    border: 'rgba(167, 139, 250, 0.38)',
    sheen: 'rgba(196, 181, 253, 0.12)',
  },
  {
    icon: 'leaf',
    iconColor: '#F5E6B8',
    gradient: ['rgba(108, 78, 38, 0.9)', 'rgba(88, 62, 28, 0.88)', 'rgba(68, 48, 22, 0.92)'],
    border: 'rgba(232, 200, 114, 0.36)',
    sheen: 'rgba(245, 230, 184, 0.14)',
  },
  {
    icon: 'creative',
    iconColor: '#7EECD8',
    gradient: ['rgba(28, 72, 62, 0.92)', 'rgba(22, 58, 50, 0.9)', 'rgba(16, 44, 38, 0.94)'],
    border: 'rgba(94, 234, 212, 0.32)',
    sheen: 'rgba(126, 236, 216, 0.1)',
  },
  {
    icon: 'community',
    iconColor: '#D8C4FF',
    gradient: ['rgba(68, 44, 102, 0.92)', 'rgba(52, 34, 82, 0.9)', 'rgba(40, 26, 64, 0.94)'],
    border: 'rgba(196, 168, 255, 0.34)',
    sheen: 'rgba(216, 196, 255, 0.12)',
  },
];

function HomeGrowingInSectionComponent({ animatedStyle }: HomeGrowingInSectionProps) {
  const router = useRouter();

  const styles = useThemedStyles((tokens) =>
    StyleSheet.create({
      shell: {
        width: '100%',
        gap: 8,
        minHeight: HomeLayout.growingInMinHeight,
      },
      topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        flexShrink: 0,
        zIndex: 2,
      },
      title: {
        fontFamily: Fonts.serif,
        fontSize: 18.5,
        fontWeight: '600',
        color: HomePalette.textPrimary,
        letterSpacing: -0.15,
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
        flexShrink: 0,
      },
      support: {
        fontFamily: Fonts.sans,
        fontSize: 11.5,
        lineHeight: 15,
        color: 'rgba(235, 228, 248, 0.72)',
        marginTop: -2,
      },
      pillScroll: {
        flexGrow: 0,
      },
      pillRow: {
        flexDirection: 'row',
        gap: 7,
        paddingRight: 4,
        paddingTop: 2,
      },
      pillOuter: {
        borderRadius: 20,
        overflow: 'hidden',
        ...Platform.select({
          ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.18,
            shadowRadius: 4,
          },
          android: { elevation: 2 },
          default: {},
        }),
      },
      pillGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 7,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: StyleSheet.hairlineWidth + 0.5,
        minHeight: 34,
      },
      pillSheen: {
        position: 'absolute',
        top: 0,
        left: 8,
        right: 8,
        height: '42%',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
      },
      pillIconWrap: {
        width: 16,
        height: 16,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      },
      pillLabel: {
        fontFamily: Fonts.sans,
        fontSize: 11.5,
        fontWeight: '500',
        color: 'rgba(252, 251, 248, 0.94)',
        letterSpacing: -0.05,
      },
    }),
  );

  return (
    <Animated.View style={[styles.shell, animatedStyle]}>
      <View style={styles.topRow}>
        <Text style={styles.title}>{HomeCopy.growingInTitle}</Text>
        <Pressable
          hitSlop={8}
          style={styles.ctaPress}
          accessibilityRole="button"
          accessibilityLabel={HomeCopy.growingInCta}
          onPress={() => router.push('/communities' as never)}>
          <Text style={styles.cta}>{HomeCopy.growingInCta}</Text>
        </Pressable>
      </View>

      <Text style={styles.support}>{HomeCopy.growingInSubtitle}</Text>

      <ScrollView
        horizontal
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        style={styles.pillScroll}
        contentContainerStyle={styles.pillRow}>
        {HomeCopy.growingInPills.map((pill, index) => {
          const theme = PILL_THEMES[index] ?? PILL_THEMES[0];
          const communityId = GROWING_IN_COMMUNITY_IDS[index];
          return (
            <Pressable
              key={pill.label}
              hitSlop={{ top: 5, bottom: 5 }}
              accessibilityRole="button"
              accessibilityLabel={`Open ${pill.label} community`}
              onPress={() => router.push(`/community?id=${communityId}` as never)}
              style={styles.pillOuter}>
              <LinearGradient
                colors={theme.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.pillGradient, { borderColor: theme.border }]}>
                <View style={[styles.pillSheen, { backgroundColor: theme.sheen }]} pointerEvents="none" />
                <View style={styles.pillIconWrap} importantForAccessibility="no-hide-descendants">
                  <HomeGrowingInPillIcon type={theme.icon} color={theme.iconColor} size={14} />
                </View>
                <Text style={styles.pillLabel}>{pill.label}</Text>
              </LinearGradient>
            </Pressable>
          );
        })}
      </ScrollView>
    </Animated.View>
  );
}

export const HomeGrowingInSection = memo(HomeGrowingInSectionComponent);
