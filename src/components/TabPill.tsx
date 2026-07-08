import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { CosmicTheme, Fonts, Radius, Spacing } from '@/constants/theme';

interface TabPillProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function TabPill({ tabs, activeTab, onTabChange }: TabPillProps) {
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

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
    marginBottom: Spacing.md,
  },
  pill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    marginRight: Spacing.sm,
    backgroundColor: CosmicTheme.backgroundElevated,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activePill: {
    backgroundColor: CosmicTheme.goldMuted,
    borderColor: CosmicTheme.gold,
  },
  label: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '600',
    color: CosmicTheme.textMuted,
  },
  activeLabel: {
    color: CosmicTheme.goldLight,
  },
});
