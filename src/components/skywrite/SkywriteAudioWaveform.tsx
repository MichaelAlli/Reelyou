import { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { HomePalette } from '@/constants/homeLayout';

interface SkywriteAudioWaveformProps {
  active: boolean;
  seed?: number;
  barCount?: number;
}

function SkywriteAudioWaveformComponent({
  active,
  seed = 0,
  barCount = 14,
}: SkywriteAudioWaveformProps) {
  const heights = useMemo(() => {
    return Array.from({ length: barCount }, (_, index) => {
      const wave = Math.sin((index + seed) * 0.85) * 0.5 + 0.5;
      const min = active ? 0.22 : 0.18;
      const max = active ? 1 : 0.42;
      return min + wave * (max - min);
    });
  }, [active, barCount, seed]);

  return (
    <View style={styles.row} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {heights.map((height, index) => (
        <View
          key={index}
          style={[
            styles.bar,
            {
              height: 4 + height * 16,
              opacity: active ? 0.55 + height * 0.45 : 0.35,
              backgroundColor: active ? HomePalette.gold : 'rgba(167, 139, 250, 0.45)',
            },
          ]}
        />
      ))}
    </View>
  );
}

export const SkywriteAudioWaveform = memo(SkywriteAudioWaveformComponent);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 3,
    flex: 1,
    minHeight: 20,
  },
  bar: {
    flex: 1,
    borderRadius: 2,
    maxWidth: 4,
  },
});
