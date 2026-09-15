import { memo } from 'react';
import { Platform, StyleSheet, Text, View, useWindowDimensions, type ViewStyle } from 'react-native';
import Animated, { type AnimatedStyle } from 'react-native-reanimated';

import { HomeSparkleIcon } from '@/components/home/HomeIcons';
import { HomeProfilePortrait } from '@/components/home/HomeProfilePortrait';
import { HomeLayout, HomePalette, measureHomeAvatarSize } from '@/constants/homeLayout';
import { getFirstName, getTimeGreeting } from '@/constants/homeCopy';
import { Fonts } from '@/constants/theme';
import { currentUser } from '@/data/mockData';

interface HomeArrivalHeaderProps {
  greetingStyle?: AnimatedStyle<ViewStyle>;
  supportStyle?: AnimatedStyle<ViewStyle>;
  profileStyle?: AnimatedStyle<ViewStyle>;
  supportLine?: string;
}

function HomeArrivalHeaderComponent({
  greetingStyle,
  supportStyle,
  profileStyle,
  supportLine,
}: HomeArrivalHeaderProps) {
  const { width } = useWindowDimensions();
  const avatarSize = measureHomeAvatarSize(width);
  const ringOuter = avatarSize + HomeLayout.avatarGlowPad * 2;
  const firstName = getFirstName(currentUser.name);

  return (
    <View style={styles.row}>
      <View style={styles.copy}>
        <Animated.View style={greetingStyle}>
          <Text style={styles.greetingLine}>{getTimeGreeting()}</Text>
          <View style={styles.nameRow}>
            <Text style={styles.nameLine}>{firstName}</Text>
            <View style={styles.sparkleGroup}>
              <View style={styles.sparklePrimary}>
                <HomeSparkleIcon size={12} color={HomePalette.goldBright} />
              </View>
              <View style={styles.sparkleSecondary}>
                <HomeSparkleIcon size={9} color={HomePalette.gold} />
              </View>
            </View>
          </View>
        </Animated.View>
        <Animated.View style={supportStyle}>
          <Text style={styles.support}>{supportLine}</Text>
        </Animated.View>
      </View>

      <Animated.View style={[styles.avatarWrap, profileStyle, { width: ringOuter }]}>
        <View style={[styles.avatarGlow, { width: ringOuter, height: ringOuter, borderRadius: ringOuter / 2 }]}>
          <View
            style={[
              styles.avatar,
              { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 },
            ]}>
            <HomeProfilePortrait size={avatarSize} />
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

export const HomeArrivalHeader = memo(HomeArrivalHeaderComponent);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
    paddingTop: HomeLayout.profileOffsetTop,
    marginBottom: HomeLayout.heroBottomGap,
  },
  copy: {
    flex: 1,
    gap: 9,
    paddingRight: 6,
    zIndex: 2,
  },
  greetingLine: {
    fontFamily: Fonts.serif,
    fontSize: 24,
    fontWeight: '400',
    color: HomePalette.textPrimary,
    letterSpacing: 0.15,
    lineHeight: 30,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 1,
  },
  nameLine: {
    fontFamily: Fonts.serif,
    fontSize: 33,
    fontWeight: '700',
    color: '#F0DCA8',
    letterSpacing: -0.35,
    lineHeight: 38,
    ...Platform.select({
      ios: {
        textShadowColor: 'rgba(212, 175, 55, 0.28)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 6,
      },
      default: {},
    }),
  },
  sparkleGroup: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginLeft: 7,
    marginTop: 6,
    gap: 3,
  },
  sparklePrimary: {
    ...Platform.select({
      ios: {
        shadowColor: '#F5D76E',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.55,
        shadowRadius: 4,
      },
      default: {},
    }),
  },
  sparkleSecondary: {
    marginTop: 3,
    opacity: 0.86,
    ...Platform.select({
      ios: {
        shadowColor: '#E8C872',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 3,
      },
      default: {},
    }),
  },
  support: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(235, 228, 248, 0.86)',
    maxWidth: 255,
    letterSpacing: 0.05,
  },
  avatarWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginRight: 2,
  },
  avatarGlow: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(245, 214, 110, 0.88)',
    backgroundColor: 'rgba(245, 214, 110, 0.04)',
    ...Platform.select({
      ios: {
        shadowColor: '#F5A623',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.38,
        shadowRadius: 14,
      },
      android: { elevation: 8 },
      default: {},
    }),
  },
  avatar: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 248, 220, 0.58)',
  },
});
