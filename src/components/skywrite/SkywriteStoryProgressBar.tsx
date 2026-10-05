import { memo } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { safeStoryFillRatio } from '@/skywrite/play/skywriteStoryProgress';

interface SkywriteStoryProgressBarProps {
  stepIndex: number;
  stepCount: number;
  /** Fill ratio 0–1 for the current segment only. */
  currentSegmentFill: number;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

function SkywriteStoryProgressBarComponent({
  stepIndex,
  stepCount,
  currentSegmentFill,
  style,
  accessibilityLabel = 'Story progress',
}: SkywriteStoryProgressBarProps) {
  if (stepCount < 1) return null;
  const currentFill = safeStoryFillRatio(currentSegmentFill * 1000, 1000);

  return (
    <View
      style={[styles.row, style]}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{
        min: 0,
        max: stepCount,
        now: stepIndex + currentFill,
      }}>
      {Array.from({ length: stepCount }).map((_, i) => {
        let fill = 0;
        if (i < stepIndex) fill = 1;
        else if (i === stepIndex) fill = currentFill;
        return (
          <View key={`story-seg-${i}`} style={styles.track}>
            <View style={[styles.fill, { width: `${fill * 100}%` }]} />
          </View>
        );
      })}
    </View>
  );
}

export const SkywriteStoryProgressBar = memo(SkywriteStoryProgressBarComponent);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    minHeight: 3,
  },
  track: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 248, 240, 0.28)',
  },
  fill: {
    height: '100%',
    backgroundColor: 'rgba(255, 248, 240, 0.95)',
    borderRadius: 2,
  },
});
