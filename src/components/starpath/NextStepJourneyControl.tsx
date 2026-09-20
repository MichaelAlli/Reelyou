import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';

import { NextStepCard } from '@/components/starpath/NextStepCard';
import { NextStepWaypoint } from '@/components/starpath/NextStepWaypoint';
import type { StarPathThemeTokens } from '@/starpath/starpathTheme';

interface NextStepJourneyControlProps {
  theme: StarPathThemeTokens;
  expanded: boolean;
  onExpand: () => void;
  onCollapse: () => void;
  onAction?: () => void;
  waypointX: number;
  waypointY: number;
  cardBottom: number;
  reduceMotion?: boolean;
}

function NextStepJourneyControlComponent({
  theme,
  expanded,
  onExpand,
  onCollapse,
  onAction,
  waypointX,
  waypointY,
  cardBottom,
  reduceMotion,
}: NextStepJourneyControlProps) {
  if (!expanded) {
    return <NextStepWaypoint x={waypointX} y={waypointY} onPress={onExpand} />;
  }

  const entering = reduceMotion ? undefined : SlideInDown.duration(280);
  const exiting = reduceMotion ? undefined : FadeOut.duration(220);

  return (
    <View style={styles.expandedRoot} pointerEvents="box-none">
      <Pressable style={styles.backdrop} onPress={onCollapse} accessibilityLabel="Dismiss Next Step" />
      <Animated.View
        entering={entering}
        exiting={exiting}
        style={[styles.cardSlot, { bottom: cardBottom }]}
        pointerEvents="box-none"
      >
        <NextStepCard
          theme={theme}
          onPress={() => {
            onAction?.();
            onCollapse();
          }}
          onDismiss={onCollapse}
        />
      </Animated.View>
    </View>
  );
}

export const NextStepJourneyControl = memo(NextStepJourneyControlComponent);

const styles = StyleSheet.create({
  expandedRoot: {
    ...StyleSheet.absoluteFill,
    zIndex: 35,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'transparent',
  },
  cardSlot: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
});
