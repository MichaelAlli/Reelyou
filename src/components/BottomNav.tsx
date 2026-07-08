import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter, usePathname } from 'expo-router';

import { CosmicTheme, Fonts, Spacing, TabBarHeight } from '@/constants/theme';
import { FloatingCreateButton } from '@/components/FloatingCreateButton';

interface TabItem {
  name: string;
  label: string;
  href: string;
  icon: string;
}

const tabs: TabItem[] = [
  { name: 'home', label: 'Home', href: '/(tabs)/home', icon: '✦' },
  { name: 'sky', label: 'Sky', href: '/(tabs)/sky', icon: '☁' },
  { name: 'impact', label: 'Impact', href: '/(tabs)/impact', icon: '◈' },
  { name: 'profile', label: 'Profile', href: '/(tabs)/profile', icon: '◎' },
];

export function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (href: string) => {
    const segment = href.split('/').pop() ?? '';
    return pathname === `/${segment}` || pathname.endsWith(`/${segment}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        {tabs.slice(0, 2).map((tab) => (
          <Pressable key={tab.name} style={styles.tab} onPress={() => router.push(tab.href as never)}>
            <Text style={[styles.icon, isActive(tab.href) && styles.activeIcon]}>{tab.icon}</Text>
            <Text style={[styles.label, isActive(tab.href) && styles.activeLabel]}>{tab.label}</Text>
          </Pressable>
        ))}

        <FloatingCreateButton onPress={() => router.push('/skywrite' as never)} />

        {tabs.slice(2).map((tab) => (
          <Pressable key={tab.name} style={styles.tab} onPress={() => router.push(tab.href as never)}>
            <Text style={[styles.icon, isActive(tab.href) && styles.activeIcon]}>{tab.icon}</Text>
            <Text style={[styles.label, isActive(tab.href) && styles.activeLabel]}>{tab.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    backgroundColor: 'transparent',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    backgroundColor: CosmicTheme.tabBar,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: CosmicTheme.cardBorder,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    minHeight: TabBarHeight,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: Spacing.xs,
  },
  icon: {
    fontSize: 18,
    color: CosmicTheme.textMuted,
  },
  activeIcon: {
    color: CosmicTheme.gold,
  },
  label: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '500',
    color: CosmicTheme.textMuted,
  },
  activeLabel: {
    color: CosmicTheme.gold,
  },
});
