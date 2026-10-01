import { memo, useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

interface SkywritePlayEdgeNavigationProps {
  canPrevious: boolean;
  canNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  disabled?: boolean;
  /** Ignore taps for this long after auto-advance (ms). */
  autoAdvanceCooldownMs?: number;
  topInset?: number;
  bottomInset?: number;
}

function SkywritePlayEdgeNavigationComponent({
  canPrevious,
  canNext,
  onPrevious,
  onNext,
  disabled = false,
  autoAdvanceCooldownMs = 500,
  topInset = 72,
  bottomInset = 160,
}: SkywritePlayEdgeNavigationProps) {
  const lastNavRef = useRef(0);

  const tryNav = (action: () => void, allowed: boolean) => {
    if (disabled || !allowed) return;
    const now = Date.now();
    if (now - lastNavRef.current < autoAdvanceCooldownMs) return;
    lastNavRef.current = now;
    action();
  };

  const edgeStyle = { marginTop: topInset, marginBottom: bottomInset };

  return (
    <View style={styles.root} pointerEvents="box-none">
      <Pressable
        style={[styles.edge, styles.edgeLeft, edgeStyle]}
        disabled={disabled || !canPrevious}
        accessibilityRole="button"
        accessibilityLabel="Previous Skyreel item"
        onPress={() => tryNav(onPrevious, canPrevious)}
      />
      <View style={styles.centerCorridor} pointerEvents="none" />
      <Pressable
        style={[styles.edge, styles.edgeRight, edgeStyle]}
        disabled={disabled || !canNext}
        accessibilityRole="button"
        accessibilityLabel="Next Skyreel item"
        onPress={() => tryNav(onNext, canNext)}
      />
    </View>
  );
}

export const SkywritePlayEdgeNavigation = memo(SkywritePlayEdgeNavigationComponent);

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    zIndex: 1,
  },
  edge: {
    width: '28%',
    minHeight: 44,
  },
  edgeLeft: {},
  edgeRight: {},
  centerCorridor: {
    flex: 1,
  },
});
