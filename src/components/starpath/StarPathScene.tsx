import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { AIGuideControl } from '@/components/starpath/AIGuideControl';
import { NextStepJourneyControl } from '@/components/starpath/NextStepJourneyControl';
import { NextStepWaypoint } from '@/components/starpath/NextStepWaypoint';
import { StarPathSpacing } from '@/components/starpath/starpathGlass';
import { StarPathTopChrome } from '@/components/starpath/StarPathTopChrome';
import { StarPathWorldLayer } from '@/components/starpath/StarPathWorldLayer';
import { TabBarHeight } from '@/constants/theme';
import { createStarPathLayoutMetrics } from '@/starpath/starpathLayoutMetrics';
import { refPointToWorldPx } from '@/starpath/starpathLayoutMetrics';
import { getStarPathTheme, type StarPathVisualMode } from '@/starpath/starpathTheme';
import { useStarPathScrollCamera } from '@/starpath/useStarPathScrollCamera';
import { useStarPathWorldGraph } from '@/starpath/useStarPathWorldGraph';
import type { StarPathViewportWindow } from '@/starpath/starpathWorldVisibility';

interface StarPathSceneProps {
  visualMode?: StarPathVisualMode;
  onNextStepPress?: () => void;
}

function StarPathSceneComponent({ visualMode = 'night', onNextStepPress }: StarPathSceneProps) {
  const { width, height } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const [, setSelectedId] = useState<string | null>(null);
  const [guideExpanded, setGuideExpanded] = useState(true);
  const [nextStepExpanded, setNextStepExpanded] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const theme = useMemo(() => getStarPathTheme(visualMode), [visualMode]);

  const metrics = useMemo(() => createStarPathLayoutMetrics(width, height), [width, height]);
  const { graph } = useStarPathWorldGraph();
  const { scrollRef, onScroll, restoreInitialViewport } = useStarPathScrollCamera(metrics, height);

  useEffect(() => {
    restoreInitialViewport(false);
    setScrollY(metrics.initialScrollY);
  }, [metrics.initialScrollY, width, height, restoreInitialViewport]);

  const viewportWindow: StarPathViewportWindow = useMemo(
    () => ({ scrollY, viewportHeight: height }),
    [scrollY, height],
  );

  const nextStepWorld = useMemo(
    () => refPointToWorldPx(graph.nextStepWaypoint, metrics),
    [graph.nextStepWaypoint, metrics],
  );

  const onNodePress = useCallback((id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  }, []);

  const onAvatarPress = useCallback(() => {
    onNodePress('journey-avatar');
  }, [onNodePress]);

  const handleScroll = useCallback(
    (e: Parameters<typeof onScroll>[0]) => {
      onScroll(e);
      setScrollY(e.nativeEvent.contentOffset.y);
    },
    [onScroll],
  );

  const bottomInset = TabBarHeight + StarPathSpacing.controlGap;

  return (
    <View style={styles.root} testID="starpath-world">
      <ScrollView
        ref={scrollRef}
        style={styles.viewport}
        contentContainerStyle={{ width, height: metrics.worldHeight }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        bounces
        testID="starpath-viewport"
      >
        <View style={{ width, height: metrics.worldHeight }}>
          <StarPathWorldLayer
            metrics={metrics}
            graph={graph}
            viewportWindow={viewportWindow}
            onNodePress={onNodePress}
            onAvatarPress={onAvatarPress}
          />
          {!nextStepExpanded ? (
            <NextStepWaypoint
              x={nextStepWorld.x}
              y={nextStepWorld.y}
              onPress={() => setNextStepExpanded(true)}
            />
          ) : null}
        </View>
      </ScrollView>

      <StarPathTopChrome />

      <View style={styles.overlay} pointerEvents="box-none">
        {guideExpanded ? (
          <AIGuideControl
            theme={theme}
            expanded
            onExpand={() => setGuideExpanded(true)}
            onCollapse={() => setGuideExpanded(false)}
            reduceMotion={!!reduceMotion}
          />
        ) : (
          <View
            style={[styles.guideSlot, { top: StarPathSpacing.guideTop }]}
            pointerEvents="box-none"
          >
            <AIGuideControl
              theme={theme}
              expanded={false}
              onExpand={() => setGuideExpanded(true)}
              onCollapse={() => setGuideExpanded(false)}
              reduceMotion={!!reduceMotion}
            />
          </View>
        )}

        {nextStepExpanded ? (
          <NextStepJourneyControl
            theme={theme}
            expanded
            onExpand={() => setNextStepExpanded(true)}
            onCollapse={() => setNextStepExpanded(false)}
            onAction={onNextStepPress}
            waypointX={nextStepWorld.x}
            waypointY={nextStepWorld.y - scrollY}
            cardBottom={bottomInset}
            reduceMotion={!!reduceMotion}
          />
        ) : null}
      </View>
    </View>
  );
}

export const StarPathScene = memo(StarPathSceneComponent);
export const StarPathWorld = StarPathScene;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#030510',
  },
  viewport: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    pointerEvents: 'box-none',
  },
  guideSlot: {
    position: 'absolute',
    left: StarPathSpacing.guideLeft,
    zIndex: 50,
  },
});
