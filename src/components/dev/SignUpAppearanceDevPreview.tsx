import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/theme';

/**
 * DEV-ONLY Sign Up appearance preview — does not persist theme preference changes.
 */
export function SignUpAppearanceDevPreview() {
  const { resolvedAppearance, setDevAppearanceOverride, clearDevAppearanceOverride } = useTheme();

  if (!__DEV__ || !setDevAppearanceOverride) {
    return null;
  }

  return (
    <View pointerEvents="box-none" style={styles.wrap}>
      <View style={styles.panel}>
        <Text style={styles.label}>DEV Preview · {resolvedAppearance}</Text>
        <View style={styles.row}>
          <Pressable
            onPress={() => setDevAppearanceOverride('light')}
            style={[styles.chip, resolvedAppearance === 'light' && styles.chipActive]}>
            <Text style={styles.chipText}>Day</Text>
          </Pressable>
          <Pressable
            onPress={() => setDevAppearanceOverride('dark')}
            style={[styles.chip, resolvedAppearance === 'dark' && styles.chipActive]}>
            <Text style={styles.chipText}>Night</Text>
          </Pressable>
          <Pressable onPress={clearDevAppearanceOverride} style={styles.chip}>
            <Text style={styles.chipText}>Reset</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    zIndex: 9999,
  },
  panel: {
    backgroundColor: 'rgba(5, 8, 24, 0.82)',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    gap: 4,
  },
  label: {
    fontFamily: Fonts.sans,
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(248, 249, 252, 0.72)',
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: 4,
  },
  chip: {
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.28)',
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  chipActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  chipText: {
    fontFamily: Fonts.sans,
    fontSize: 10,
    fontWeight: '700',
    color: '#F8F9FC',
  },
});
