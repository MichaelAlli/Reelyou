import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { HomePalette } from '@/constants/homeLayout';
import { Fonts } from '@/constants/theme';

interface SkywriteToggleRowProps {
  title: string;
  description?: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
  accessibilityLabel: string;
}

function SkywriteToggleRowComponent({
  title,
  description,
  value,
  onValueChange,
  accessibilityLabel,
}: SkywriteToggleRowProps) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value }}
      onPress={() => onValueChange(!value)}
      style={styles.row}>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
      <View style={[styles.track, value && styles.trackOn]}>
        <View style={[styles.thumb, value && styles.thumbOn]} />
      </View>
    </Pressable>
  );
}

export const SkywriteToggleRow = memo(SkywriteToggleRowComponent);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 48,
    paddingVertical: 6,
  },
  copy: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '600',
    color: HomePalette.textPrimary,
  },
  description: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    lineHeight: 15,
    color: 'rgba(235, 228, 248, 0.58)',
  },
  track: {
    width: 44,
    height: 26,
    borderRadius: 13,
    padding: 2,
    backgroundColor: 'rgba(167, 139, 250, 0.18)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(167, 139, 250, 0.24)',
    justifyContent: 'center',
  },
  trackOn: {
    backgroundColor: 'rgba(232, 200, 114, 0.18)',
    borderColor: 'rgba(232, 200, 114, 0.42)',
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(235, 228, 248, 0.72)',
  },
  thumbOn: {
    alignSelf: 'flex-end',
    backgroundColor: HomePalette.gold,
  },
});
