import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useThemedStyles } from '@/theme/useTheme';

interface TabPillProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function TabPill({ tabs, activeTab, onTabChange }: TabPillProps) {
  const styles = useThemedStyles((tokens) =>
    StyleSheet.create({
      scroll: {
        flexGrow: 0,
        marginBottom: Spacing.md,
      },
      pill: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: Radius.full,
        marginRight: Spacing.sm,
        backgroundColor: tokens.elevatedSurface,
        borderWidth: 1,
        borderColor: 'transparent',
      },
      activePill: {
        backgroundColor: tokens.goldMuted,
        borderColor: tokens.gold,
      },
      label: {
        fontFamily: Fonts.sans,
        fontSize: 13,
        fontWeight: '600',
        color: tokens.mutedText,
      },
      activeLabel: {
        color: tokens.goldLight,
      },
    }),
  );

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
      {tabs.map((tab) => {
        const isActive = tab === activeTab;
        return (
          <Pressable
            key={tab}
            onPress={() => onTabChange(tab)}
            style={[styles.pill, isActive && styles.activePill]}>
            <Text style={[styles.label, isActive && styles.activeLabel]}>{tab}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
