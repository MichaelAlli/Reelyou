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
  const styles = useThemedStyles((_tokens) =>
    StyleSheet.create({
      chip: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(167, 139, 250, 0.32)',
        backgroundColor: 'rgba(16, 20, 44, 0.82)',
        paddingVertical: 14,
        paddingHorizontal: 16,
      },
      chipSelected: {
        borderColor: 'rgba(232, 200, 114, 0.65)',
        backgroundColor: 'rgba(232, 200, 114, 0.12)',
        shadowColor: '#E8C872',
        shadowOpacity: 0.25,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 0 },
      },
      label: {
        flex: 1,
        fontFamily: Fonts.sans,
        fontSize: 15,
        lineHeight: 21,
        color: '#F3EDE4',
        fontWeight: '500',
      },
      check: {
        fontFamily: Fonts.sans,
        fontSize: 16,
        fontWeight: '700',
        color: '#E8C872',
      },
    }),
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.chipSelected,
        pressed && { opacity: 0.92 },
        style,
      ]}>
      <Text style={styles.label}>{label}</Text>
      {selected ? <Text style={styles.check}>{'\u2713'}</Text> : null}
    </Pressable>
  );
}

export const TodayFocusSuggestionChip = memo(TodayFocusSuggestionChipComponent);
