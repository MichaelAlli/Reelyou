import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SKY_AREA_CATEGORIES, type SkyAreaCategoryId } from '@/skyAreas/skyAreaCategory';
import { SkywriteCopy } from '@/constants/skywriteCopy';
import { Fonts, Radius } from '@/constants/theme';

interface SkywriteSkyAreaPickerProps {
  value: SkyAreaCategoryId | undefined;
  onChange: (id: SkyAreaCategoryId) => void;
}

export function SkywriteSkyAreaPicker({ value, onChange }: SkywriteSkyAreaPickerProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{SkywriteCopy.shareInAreaTitle}</Text>
      <Text style={styles.hint}>{SkywriteCopy.shareInAreaHint}</Text>
      <View style={styles.row}>
        {SKY_AREA_CATEGORIES.map((area) => {
          const selected = value === area.id;
          return (
            <Pressable
              key={area.id}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={area.label}
              onPress={() => onChange(area.id)}
              style={[styles.chip, selected && styles.chipSelected]}>
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{area.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8, marginTop: 12 },
  title: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '700',
    color: '#E8C872',
    letterSpacing: 0.3,
  },
  hint: {
    fontFamily: Fonts.sans,
    fontSize: 11.5,
    lineHeight: 16,
    color: 'rgba(235,228,248,0.62)',
  },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.28)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 36,
    justifyContent: 'center',
  },
  chipSelected: {
    borderColor: 'rgba(232, 200, 114, 0.65)',
    backgroundColor: 'rgba(232, 200, 114, 0.12)',
  },
  chipText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(235,228,248,0.85)',
  },
  chipTextSelected: { color: '#F5F0FF' },
});
