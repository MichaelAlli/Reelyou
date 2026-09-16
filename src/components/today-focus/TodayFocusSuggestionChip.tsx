import { memo } from 'react';
import { Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';

import { Fonts } from '@/constants/theme';
import { useThemedStyles } from '@/theme/useTheme';

interface TodayFocusSuggestionChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

function TodayFocusSuggestionChipComponent({
  label,
  selected,
  onPress,
  style,
}: TodayFocusSuggestionChipProps) {
  const styles = useThemedStyles((tokens) =>
    StyleSheet.create({
      chip: {
        borderRadius: 16,
        borderWidth: 1,
        borderColor: selected ? 'rgba(232, 200, 114, 0.55)' : 'rgba(167, 139, 250, 0.28)',
        backgroundColor: selected ? 'rgba(232, 200, 114, 0.1)' : 'rgba(12, 10, 28, 0.72)',
        paddingVertical: 12,
        paddingHorizontal: 14,
      },
      label: {
        fontFamily: Fonts.sans,
        fontSize: 14,
        lineHeight: 20,
        color: selected ? tokens.primaryText : tokens.secondaryText,
        fontWeight: selected ? '600' : '500',
      },
    }),
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.chip, pressed && { opacity: 0.92 }, style]}>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

export const TodayFocusSuggestionChip = memo(TodayFocusSuggestionChipComponent);
