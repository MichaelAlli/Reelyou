import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Fonts, Spacing } from '@/constants/theme';
import { useThemedStyles } from '@/theme/useTheme';

interface SectionHeaderProps {
  title: string;
  action?: string;
  onAction?: () => void;
}

export function SectionHeader({ title, action, onAction }: SectionHeaderProps) {
  const styles = useThemedStyles((tokens) =>
    StyleSheet.create({
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
        color: tokens.primaryText,
      },
      action: {
        fontFamily: Fonts.sans,
        fontSize: 13,
        fontWeight: '600',
        color: tokens.gold,
      },
    }),
  );

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
