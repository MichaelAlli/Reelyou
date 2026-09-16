import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SKYWRITE_VISIBILITY_OPTIONS } from '@/constants/skywriteCopy';
import { HomePalette } from '@/constants/homeLayout';
import { Fonts } from '@/constants/theme';
import type { Privacy } from '@/types';

interface SkywriteVisibilityControlProps {
  value: Privacy;
  expanded: boolean;
  onToggleExpanded: () => void;
  onSelect: (value: Privacy) => void;
}

function SkywriteVisibilityControlComponent({
  value,
  expanded,
  onToggleExpanded,
  onSelect,
}: SkywriteVisibilityControlProps) {
  const active = SKYWRITE_VISIBILITY_OPTIONS.find((option) => option.id === value);

  return (
    <View style={styles.wrap}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Who can see this"
        accessibilityState={{ expanded }}
        onPress={onToggleExpanded}
        style={styles.header}>
        <Text style={styles.icon}>{active?.icon ?? '🌐'}</Text>
        <View style={styles.copy}>
          <Text style={styles.label}>Who can see this?</Text>
          <Text style={styles.value}>{active?.collapsed ?? 'Public Sky · Everyone'}</Text>
        </View>
        <Text style={styles.chevron}>{expanded ? '▴' : '▾'}</Text>
      </Pressable>
      {expanded ? (
        <View style={styles.options}>
          {SKYWRITE_VISIBILITY_OPTIONS.map((option) => {
            const selected = value === option.id;
            return (
              <Pressable
                key={option.id}
                accessibilityRole="button"
                accessibilityLabel={`${option.title} ${option.subtitle}`}
                accessibilityState={{ selected }}
                onPress={() => onSelect(option.id)}
                style={[styles.option, selected && styles.optionSelected]}>
                <Text style={styles.optionIcon}>{option.icon}</Text>
                <View style={styles.optionCopy}>
                  <Text style={[styles.optionTitle, selected && styles.optionTitleSelected]}>
                    {option.title}
                  </Text>
                  <Text style={styles.optionSub}>{option.subtitle}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

export const SkywriteVisibilityControl = memo(SkywriteVisibilityControlComponent);

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(167, 139, 250, 0.22)',
    backgroundColor: 'rgba(6, 8, 22, 0.45)',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  icon: {
    fontSize: 15,
    width: 20,
    textAlign: 'center',
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(235, 228, 248, 0.55)',
  },
  value: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '600',
    color: HomePalette.textPrimary,
  },
  chevron: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: HomePalette.gold,
  },
  options: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(167, 139, 250, 0.14)',
    padding: 10,
    gap: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(167, 139, 250, 0.14)',
    padding: 12,
    backgroundColor: 'rgba(6, 8, 22, 0.45)',
  },
  optionSelected: {
    borderColor: 'rgba(232, 200, 114, 0.45)',
    backgroundColor: 'rgba(232, 200, 114, 0.08)',
  },
  optionIcon: {
    fontSize: 16,
    width: 24,
    textAlign: 'center',
  },
  optionCopy: {
    flex: 1,
    gap: 2,
  },
  optionTitle: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(235, 228, 248, 0.82)',
  },
  optionTitleSelected: {
    color: HomePalette.gold,
  },
  optionSub: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: 'rgba(235, 228, 248, 0.55)',
  },
});
