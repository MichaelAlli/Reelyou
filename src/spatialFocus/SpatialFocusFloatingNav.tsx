import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Fonts } from '@/constants/theme';

interface SpatialFocusFloatingNavProps {
  bottom: number;
  onLeft: () => void;
  onRight: () => void;
  disabled?: boolean;
}

function SpatialFocusFloatingNavComponent({
  bottom,
  onLeft,
  onRight,
  disabled = false,
}: SpatialFocusFloatingNavProps) {
  if (disabled) return null;

  return (
    <View
      style={[styles.wrap, { bottom }]}
      pointerEvents="box-none"
      accessibilityElementsHidden={false}>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Focus previous nearby point"
          onPress={onLeft}
          style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}>
          <Text style={styles.glyph}>‹</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Focus next nearby point"
          onPress={onRight}
          style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}>
          <Text style={styles.glyph}>›</Text>
        </Pressable>
      </View>
    </View>
  );
}

export const SpatialFocusFloatingNav = memo(SpatialFocusFloatingNavComponent);

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 38,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(8, 10, 22, 0.78)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232, 200, 114, 0.32)',
  },
  chip: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(232, 200, 114, 0.1)',
  },
  chipPressed: {
    opacity: 0.82,
  },
  glyph: {
    fontFamily: Fonts.sans,
    fontSize: 22,
    lineHeight: 24,
    color: 'rgba(248, 244, 236, 0.92)',
    marginTop: -2,
  },
});
