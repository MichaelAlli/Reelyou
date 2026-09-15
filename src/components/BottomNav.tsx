import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SkywriteTabIcon } from '@/components/nav/SkywriteTabIcon';
import { Fonts, Spacing, TabBarHeight } from '@/constants/theme';
import { HomeLayout, HomePalette } from '@/constants/homeLayout';
import { useThemedStyles } from '@/theme/useTheme';

type TabIconRenderer = (props: { size: number; active: boolean }) => ReactNode;

interface TabItem {
  name: string;
  label: string;
  href: string;
  /** Unicode glyph for text-based tab icons (Home, My Sky, Starpath, Me). */
  icon?: string;
  /** Custom SVG renderer — used only by Skywrite. */
  renderIcon?: TabIconRenderer;
}

const tabs: TabItem[] = [
  { name: 'home', label: 'Home', href: '/(tabs)/home', icon: '⌂' },
  { name: 'sky', label: 'My Sky', href: '/(tabs)/sky', icon: '✦' },
  { name: 'starpath', label: 'Starpath', href: '/starpath', icon: '☆' },
  {
    name: 'skywrite',
    label: 'Skywrite',
    href: '/skywrite',
    renderIcon: ({ size, active }) => <SkywriteTabIcon size={size} active={active} />,
  },
  { name: 'me', label: 'Me', href: '/(tabs)/profile', icon: '◎' },
];

export function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const styles = useThemedStyles((tokens) =>
    StyleSheet.create({
      container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: Spacing.sm,
        backgroundColor: '#05070A',
      },
      bar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(3, 5, 14, 0.96)',
        borderRadius: 24,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(232, 200, 114, 0.22)',
        paddingTop: 7,
        paddingBottom: 8,
        paddingHorizontal: 4,
        minHeight: TabBarHeight - 6,
      },
      tab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        paddingVertical: 2,
      },
      icon: {
        fontSize: HomeLayout.navIconSize,
        color: HomePalette.lavender,
      },
      activeIcon: {
        color: tokens.gold,
      },
      label: {
        fontFamily: Fonts.sans,
        fontSize: 9,
        fontWeight: '500',
        color: HomePalette.lavender,
      },
      activeLabel: {
        color: tokens.gold,
        fontWeight: '600',
      },
      activeDot: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: tokens.gold,
        marginTop: 1,
      },
    }),
  );

  const isActive = (tab: TabItem) => {
    const segment = tab.href.split('/').pop() ?? '';
    if (tab.name === 'home') {
      return pathname === '/home' || pathname.endsWith('/home');
    }
    if (tab.name === 'sky') {
      return pathname === '/sky' || pathname.endsWith('/sky');
    }
    if (tab.name === 'starpath') {
      return pathname === '/starpath' || pathname.endsWith('/starpath');
    }
    if (tab.name === 'skywrite') {
      return pathname === '/skywrite' || pathname.endsWith('/skywrite');
    }
    return pathname === `/${segment}` || pathname.endsWith(`/${segment}`);
  };

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, Spacing.sm) }]}>
      <View style={styles.bar}>
        {tabs.map((tab) => {
          const active = isActive(tab);
          return (
            <Pressable key={tab.name} style={styles.tab} onPress={() => router.push(tab.href as never)}>
              {tab.renderIcon ? (
                tab.renderIcon({ size: HomeLayout.navIconSize, active })
              ) : (
                <Text style={[styles.icon, active && styles.activeIcon]}>{tab.icon}</Text>
              )}
              <Text style={[styles.label, active && styles.activeLabel]}>{tab.label}</Text>
              {active ? <View style={styles.activeDot} /> : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
