import type { ReactNode } from 'react';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SkywriteTabIcon } from '@/components/nav/SkywriteTabIcon';
import { HomeLayout, HomePalette } from '@/constants/homeLayout';
import { Fonts, Spacing, TabBarHeight } from '@/constants/theme';
import { useThemedStyles } from '@/theme/useTheme';

type TabIconRenderer = (props: { size: number; active: boolean }) => ReactNode;

interface StarPathTabItem {
  name: string;
  label: string;
  href: string;
  icon?: string;
  renderIcon?: TabIconRenderer;
}

const STARPATH_TABS: StarPathTabItem[] = [
  { name: 'sky', label: 'My Sky', href: '/(tabs)/sky', icon: '✦' },
  {
    name: 'skywrite',
    label: 'Skywrite',
    href: '/skywrite',
    renderIcon: ({ size, active }) => <SkywriteTabIcon size={size} active={active} />,
  },
  { name: 'constellations', label: 'Constellations', href: '/(tabs)/sky', icon: '✧' },
  { name: 'starpath', label: 'Starpath', href: '/starpath', icon: '☆' },
  { name: 'impact', label: 'Impact', href: '/(tabs)/impact', icon: '◆' },
];

function StarPathReferenceBottomNavComponent() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const styles = useThemedStyles((tokens) =>
    StyleSheet.create({
      container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%',
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
        minHeight: 44,
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

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, Spacing.sm) }]}>
      <View style={styles.bar} testID="starpath-reference-bottom-nav">
        {STARPATH_TABS.map((tab) => {
          const active = tab.name === 'starpath';
          return (
            <Pressable
              key={tab.name}
              style={styles.tab}
              accessibilityRole="tab"
              accessibilityLabel={tab.label}
              accessibilityState={{ selected: active }}
              onPress={() => {
                if (active) return;
                router.push(tab.href as never);
              }}
            >
              <View importantForAccessibility="no-hide-descendants">
                {tab.renderIcon ? (
                  tab.renderIcon({ size: HomeLayout.navIconSize, active })
                ) : (
                  <Text style={[styles.icon, active && styles.activeIcon]}>{tab.icon}</Text>
                )}
              </View>
              <Text style={[styles.label, active && styles.activeLabel]}>{tab.label}</Text>
              {active ? (
                <View style={styles.activeDot} importantForAccessibility="no-hide-descendants" />
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export const StarPathReferenceBottomNav = memo(StarPathReferenceBottomNavComponent);
