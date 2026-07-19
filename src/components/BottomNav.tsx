import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FloatingCreateButton } from '@/components/FloatingCreateButton';
import { Fonts, Spacing, TabBarHeight } from '@/constants/theme';
import { useThemedStyles } from '@/theme/useTheme';

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
  const insets = useSafeAreaInsets();
  const styles = useThemedStyles((tokens) =>
    StyleSheet.create({
      container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: Spacing.sm,
        backgroundColor: 'transparent',
      },
      bar: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-around',
        backgroundColor: tokens.navigationBackground,
        borderRadius: 28,
        borderWidth: 1,
        borderColor: tokens.border,
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
        color: tokens.navigationIconInactive,
      },
      activeIcon: {
        color: tokens.navigationIconActive,
      },
      label: {
        fontFamily: Fonts.sans,
        fontSize: 11,
        fontWeight: '500',
        color: tokens.navigationIconInactive,
      },
      activeLabel: {
        color: tokens.navigationIconActive,
      },
    }),
  );

  const isActive = (href: string) => {
    const segment = href.split('/').pop() ?? '';
    return pathname === `/${segment}` || pathname.endsWith(`/${segment}`);
  };

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, Spacing.sm) }]}>
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
