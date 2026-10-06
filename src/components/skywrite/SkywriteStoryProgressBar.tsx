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
  const currentFill = safeStoryFillRatio(
    Number.isFinite(currentSegmentFill) ? currentSegmentFill * 1000 : 0,
    1000,
  );

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
        const isCurrent = i === stepIndex;
        return (
          <View
            key={`story-seg-${i}`}
            style={[styles.track, isCurrent && styles.trackCurrent]}>
            <View
              style={[
                styles.fill,
                i < stepIndex && styles.fillComplete,
                isCurrent && styles.fillActive,
                { flex: fill },
              ]}
            />
            <View style={{ flex: Math.max(0, 1 - fill) }} />
          </View>
        );
      })}
    </View>
  );
}

export const SkywriteStoryProgressBar = SkywriteStoryProgressBarComponent;

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
    backgroundColor: 'rgba(255, 248, 240, 0.22)',
  },
  trackCurrent: {
    backgroundColor: 'rgba(232, 200, 114, 0.18)',
  },
  fill: {
    height: '100%',
    backgroundColor: 'rgba(255, 248, 240, 0.92)',
    borderRadius: 2,
  },
  fillComplete: {
    backgroundColor: 'rgba(255, 248, 240, 0.88)',
  },
  fillActive: {
    backgroundColor: 'rgba(232, 200, 114, 0.95)',
    shadowColor: '#E8C872',
    shadowOpacity: 0.35,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
  },
});
