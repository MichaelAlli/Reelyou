import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CosmicTheme, Fonts, Spacing } from '@/constants/theme';

interface SectionHeaderProps {
  title: string;
  action?: string;
  onAction?: () => void;
}

export function SectionHeader({ title, action, onAction }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {action && onAction && (
        <Pressable onPress={onAction}>
          <Text style={styles.action}>{action}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  title: {
    fontFamily: Fonts.sans,
    fontSize: 18,
    fontWeight: '700',
    color: CosmicTheme.textPrimary,
  },
  action: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '600',
    color: CosmicTheme.gold,
  },
});
