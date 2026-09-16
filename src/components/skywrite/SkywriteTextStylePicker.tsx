import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  SKYWRITE_TEXT_STYLE_OPTIONS,
  getSkywriteWriteInputStyle,
  type SkywriteTextStyleId,
} from '@/constants/skywriteTextStyles';
import { HomePalette } from '@/constants/homeLayout';
import { Fonts } from '@/constants/theme';

interface SkywriteTextStylePickerProps {
  value: SkywriteTextStyleId;
  onSelect: (value: SkywriteTextStyleId) => void;
}

function SkywriteTextStylePickerComponent({ value, onSelect }: SkywriteTextStylePickerProps) {
  return (
    <View style={styles.grid}>
      {SKYWRITE_TEXT_STYLE_OPTIONS.map((option) => {
        const active = value === option.id;
        return (
          <Pressable
            key={option.id}
            accessibilityRole="button"
            accessibilityLabel={`${option.label} text style`}
            accessibilityState={{ selected: active }}
            onPress={() => onSelect(option.id)}
            style={[styles.option, active && styles.optionActive]}>
            <Text style={[styles.preview, getSkywriteWriteInputStyle(option.id)]}>{option.preview}</Text>
            <View style={styles.copy}>
              <Text style={[styles.label, active && styles.labelActive]}>{option.label}</Text>
              <Text style={styles.description}>{option.description}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

export const SkywriteTextStylePicker = memo(SkywriteTextStylePickerComponent);

const styles = StyleSheet.create({
  grid: {
    gap: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(167, 139, 250, 0.18)',
    backgroundColor: 'rgba(8, 8, 24, 0.45)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 48,
  },
  optionActive: {
    borderColor: 'rgba(232, 200, 114, 0.45)',
    backgroundColor: 'rgba(232, 200, 114, 0.08)',
  },
  preview: {
    width: 36,
    textAlign: 'center',
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(235, 228, 248, 0.82)',
  },
  labelActive: {
    color: HomePalette.gold,
  },
  description: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: 'rgba(235, 228, 248, 0.52)',
  },
});
