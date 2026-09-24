import { Pressable, StyleSheet, Text, View } from 'react-native';

import { LegacyCopy } from '@/constants/legacyCopy';
import { Fonts } from '@/constants/theme';

export type LegacySegment = 'journey' | 'ripples';

interface LegacySegmentToggleProps {
  active: LegacySegment;
  onJourney: () => void;
  onRipples: () => void;
  variant?: 'dark' | 'light';
}

export function LegacySegmentToggle({
  active,
  onJourney,
  onRipples,
  variant = 'dark',
}: LegacySegmentToggleProps) {
  const isLight = variant === 'light';

  return (
    <View style={styles.row}>
      <Pressable
        onPress={onJourney}
        accessibilityRole="button"
        accessibilityState={{ selected: active === 'journey' }}
        style={[
          styles.chip,
          isLight ? styles.chipLight : styles.chipDark,
          active === 'journey' && (isLight ? styles.chipActiveLight : styles.chipActiveDark),
        ]}>
        <Text
          style={[
            styles.label,
            isLight ? styles.labelLight : styles.labelDark,
            active === 'journey' && (isLight ? styles.labelActiveLight : styles.labelActiveDark),
          ]}>
          {LegacyCopy.legacyJourney}
        </Text>
      </Pressable>
      <Pressable
        onPress={onRipples}
        accessibilityRole="button"
        accessibilityState={{ selected: active === 'ripples' }}
        style={[
          styles.chip,
          isLight ? styles.chipLight : styles.chipDark,
          active === 'ripples' && (isLight ? styles.chipActiveLight : styles.chipActiveDark),
        ]}>
        <Text
          style={[
            styles.label,
            isLight ? styles.labelLight : styles.labelDark,
            active === 'ripples' && (isLight ? styles.labelActiveLight : styles.labelActiveDark),
          ]}>
          {LegacyCopy.legacyRipples}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
    marginBottom: 12,
  },
  chip: {
    flex: 1,
    minHeight: 40,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipDark: {
    borderColor: 'rgba(212, 175, 55, 0.45)',
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
  },
  chipActiveDark: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderColor: 'rgba(212, 175, 55, 0.75)',
  },
  chipLight: {
    borderColor: 'rgba(255, 255, 255, 0.75)',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  chipActiveLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderColor: 'rgba(232, 200, 114, 0.75)',
  },
  label: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  labelDark: {
    color: 'rgba(248, 244, 255, 0.82)',
  },
  labelActiveDark: {
    color: '#E8C872',
  },
  labelLight: {
    color: 'rgba(45, 55, 72, 0.78)',
  },
  labelActiveLight: {
    color: '#7A5A12',
  },
});
