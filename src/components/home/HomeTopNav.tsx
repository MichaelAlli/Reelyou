import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { HomeBellIcon, HomeMenuIcon } from '@/components/home/HomeIcons';
import { HomeHeaderLogo } from '@/components/home/HomeHeaderLogo';
import { HomeLayout, HomePalette } from '@/constants/homeLayout';

function HomeTopNavComponent() {
  return (
    <View style={styles.row}>
      <View style={styles.sideSlot}>
        <Pressable style={styles.iconBtn} accessibilityRole="button" accessibilityLabel="Menu">
          <HomeMenuIcon size={16} />
        </Pressable>
      </View>

      <View style={styles.logoWrap} pointerEvents="none">
        <HomeHeaderLogo />
      </View>

      <View style={styles.sideSlot}>
        <Pressable style={styles.iconBtn} accessibilityRole="button" accessibilityLabel="Notifications">
          <HomeBellIcon size={16} />
          <View style={styles.badge} />
        </Pressable>
      </View>
    </View>
  );
}

export const HomeTopNav = memo(HomeTopNavComponent);

const slot = HomeLayout.iconCircleSm;

const styles = StyleSheet.create({
  row: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: HomeLayout.headerHeight,
    paddingBottom: HomeLayout.headerBottomGap,
  },
  sideSlot: {
    width: slot,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtn: {
    width: slot,
    height: slot,
    borderRadius: slot / 2,
    borderWidth: 1,
    borderColor: 'rgba(232, 200, 114, 0.42)',
    backgroundColor: 'rgba(6, 8, 22, 0.48)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 9,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: HomePalette.goldBright,
    borderWidth: 1,
    borderColor: 'rgba(6, 8, 22, 0.92)',
  },
  logoWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    backgroundColor: 'transparent',
  },
});
