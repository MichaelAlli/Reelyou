import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { HomeBellIcon, HomeFocusQuickIcon, HomeMenuIcon } from '@/components/home/HomeIcons';
import { HomeHeaderLogo } from '@/components/home/HomeHeaderLogo';
import { useReelyouConnect } from '@/connect/ReelyouConnectProvider';
import { HomeLayout, HomePalette } from '@/constants/homeLayout';

interface HomeTopNavProps {
  onOpenMenu: () => void;
  onOpenSignals: () => void;
  onOpenTodayFocus?: () => void;
  onTodayFocusLongPress?: () => void;
  showTodayFocusQuickAccess?: boolean;
}

function HomeTopNavComponent({
  onOpenMenu,
  onOpenSignals,
  onOpenTodayFocus,
  onTodayFocusLongPress,
  showTodayFocusQuickAccess = false,
}: HomeTopNavProps) {
  const { hasUnreadSignals } = useReelyouConnect();

  return (
    <View style={styles.row} collapsable={false}>
      <View
        style={[
          styles.sideSlot,
          styles.sideSlotLeft,
          showTodayFocusQuickAccess ? { width: slot * 2 + 6 } : null,
        ]}
      >
        <Pressable
          style={styles.iconBtn}
          hitSlop={HIT_SLOP}
          onPress={onOpenMenu}
          accessibilityRole="button"
          accessibilityLabel="Open menu"
          testID="home-menu-trigger"
        >
          <HomeMenuIcon size={16} />
        </Pressable>
        {showTodayFocusQuickAccess && onOpenTodayFocus ? (
          <Pressable
            style={[styles.iconBtn, styles.focusBtn]}
            hitSlop={HIT_SLOP}
            onPress={onOpenTodayFocus}
            onLongPress={onTodayFocusLongPress}
            accessibilityRole="button"
            accessibilityLabel="Today's Focus"
            accessibilityHint="Opens your focus for today. Long press for a quick preview."
            testID="home-today-focus-quick"
          >
            <HomeFocusQuickIcon size={16} active />
            <View style={styles.focusDot} />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.logoWrap} pointerEvents="none">
        <HomeHeaderLogo />
      </View>

      <View style={styles.sideSlot}>
        <Pressable
          style={styles.iconBtn}
          hitSlop={HIT_SLOP}
          onPress={onOpenSignals}
          accessibilityRole="button"
          accessibilityLabel="Open signals"
          testID="home-signal-trigger"
        >
          <HomeBellIcon size={16} />
          {hasUnreadSignals ? (
            <View style={styles.badge} importantForAccessibility="no-hide-descendants" />
          ) : null}
        </Pressable>
      </View>
    </View>
  );
}

export const HomeTopNav = memo(HomeTopNavComponent);

const slot = HomeLayout.iconCircleSm;
const HIT_SLOP = { top: 8, bottom: 8, left: 8, right: 8 };

const styles = StyleSheet.create({
  row: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: HomeLayout.headerHeight,
    paddingBottom: HomeLayout.headerBottomGap,
    zIndex: 20,
    elevation: 20,
  },
  sideSlot: {
    width: slot,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 21,
  },
  sideSlotLeft: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'flex-start',
  },
  focusBtn: {
    borderColor: 'rgba(232, 200, 114, 0.55)',
    backgroundColor: 'rgba(232, 200, 114, 0.1)',
  },
  focusDot: {
    position: 'absolute',
    top: 7,
    right: 8,
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: HomePalette.goldBright,
    borderWidth: 1,
    borderColor: 'rgba(6, 8, 22, 0.92)',
  },
  iconBtn: {
    minWidth: 44,
    minHeight: 44,
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
