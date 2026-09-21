import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { AIGuideControl } from '@/components/starpath/AIGuideControl';
import { NextStepJourneyControl } from '@/components/starpath/NextStepJourneyControl';
import { NextStepWaypoint } from '@/components/starpath/NextStepWaypoint';
import { StarPathAvatarIdentitySheet } from '@/components/starpath/StarPathAvatarIdentitySheet';
import { StarPathNodeDetailSheet } from '@/components/starpath/StarPathNodeDetailSheet';
import { StarPathSpacing } from '@/components/starpath/starpathGlass';
import { StarPathTopChrome } from '@/components/starpath/StarPathTopChrome';
import { StarPathWorldLayer } from '@/components/starpath/StarPathWorldLayer';
import { TabBarHeight } from '@/constants/theme';
import { currentUser } from '@/data/mockData';
import { StarPathDynamicGrowthLayer } from '@/components/starpath/StarPathDynamicGrowthLayer';
import { StarPathOffscreenGrowthIndicator } from '@/components/starpath/StarPathOffscreenGrowthIndicator';
import {
  applyDynamicWorldExpansion,
  createStarPathLayoutMetrics,
  refPointToWorldPx,
} from '@/starpath/starpathLayoutMetrics';
import { resolveStarPathNodeEntry } from '@/starpath/starpathGrowthNodeCatalog';
import { nodeVisualModifiers } from '@/starpath/starpathInteractionLogic';
import { relevanceBandVisualDelta } from '@/starpath/starpathSiftingEngine';
import { getStarPathNodeCatalogEntry } from '@/starpath/starpathNodeCatalog';
import { useStarPathExperience } from '@/starpath/StarPathExperienceProvider';
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
  const [guideExpanded, setGuideExpanded] = useState(true);
  const [nextStepExpanded, setNextStepExpanded] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const [detailNodeId, setDetailNodeId] = useState<string | null>(null);
  const [avatarSheetOpen, setAvatarSheetOpen] = useState(false);

  const theme = useMemo(() => getStarPathTheme(visualMode), [visualMode]);
  const experience = useStarPathExperience();

  const metrics = useMemo(() => {
    const base = createStarPathLayoutMetrics(width, height);
    return applyDynamicWorldExpansion(base, experience.dynamicWorld.worldExpansionPx);
  }, [width, height, experience.dynamicWorld.worldExpansionPx]);
  const { graph } = useStarPathWorldGraph();
  const { scrollRef, onScroll, restoreInitialViewport } = useStarPathScrollCamera(metrics, height);

  useEffect(() => {
    restoreInitialViewport(false);
    setScrollY(metrics.initialScrollY);
  }, [metrics.initialScrollY, width, height, restoreInitialViewport]);

  useEffect(() => {
    experience.setLivingWorldViewport(scrollY, height, metrics.contentBandHeight, metrics.paddingTop);
  }, [scrollY, height, metrics.contentBandHeight, metrics.paddingTop, experience]);

  const viewportWindow: StarPathViewportWindow = useMemo(
    () => ({ scrollY, viewportHeight: height }),
    [scrollY, height],
  );

  const nextStepWorld = useMemo(
    () => refPointToWorldPx(graph.nextStepWaypoint, metrics),
    [graph.nextStepWaypoint, metrics],
  );

  const detailEntry = useMemo(() => {
    if (!detailNodeId) return null;
    return (
      getStarPathNodeCatalogEntry(detailNodeId) ??
      resolveStarPathNodeEntry(detailNodeId, experience.dynamicWorld.nodes)
    );
  }, [detailNodeId, experience.dynamicWorld.nodes]);

  const detailUiState = useMemo(() => {
    if (!detailNodeId) return 'neutral' as const;
    const dynamicNode = experience.dynamicWorld.nodes.find((n) => n.id === detailNodeId);
    return experience.getNodeUiState(dynamicNode?.sourceId ?? detailNodeId);
  }, [detailNodeId, experience]);

  const onNodePress = useCallback(
    (id: string) => {
      const dynamicNode = experience.dynamicWorld.nodes.find((n) => n.id === id);
      const entry =
        getStarPathNodeCatalogEntry(id) ??
        (dynamicNode ? resolveStarPathNodeEntry(id, experience.dynamicWorld.nodes) : undefined);
      if (!entry) return;
      const signalNodeId = dynamicNode?.sourceId ?? id;
      experience.recordInteraction(signalNodeId, entry.branchId, 'viewed', 'node_tap');
      setDetailNodeId(id);
    },
    [experience],
  );

  const onAvatarPress = useCallback(() => {
    setAvatarSheetOpen(true);
  }, []);

  const handleScroll = useCallback(
    (e: Parameters<typeof onScroll>[0]) => {
      onScroll(e);
      setScrollY(e.nativeEvent.contentOffset.y);
    },
    [onScroll],
  );

  const closeDetail = useCallback(() => setDetailNodeId(null), []);

  const bottomInset = TabBarHeight + StarPathSpacing.controlGap;

  const nodeInteractionProps = useCallback(
    (nodeId: string) => {
      const ui = experience.getNodeUiState(nodeId);
      const mods = nodeVisualModifiers(ui);
      const bandDelta =
        ui === 'dismissed' ? null : relevanceBandVisualDelta(experience.getNodeRelevanceBand(nodeId));
      return {
        uiState: ui,
        visualOpacity: mods.opacity * (bandDelta?.opacityMultiplier ?? 1),
        showSelectionRing: mods.showSelectionRing,
        softPulse: mods.softPulse || bandDelta?.softPulse || experience.softHighlightNodeIds.has(nodeId),
        revealPulse: experience.softHighlightNodeIds.has(nodeId),
      };
    },
    [experience],
  );

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
            avatarIdentity={experience.avatarIdentity}
            activeBranchIds={experience.activeBranchIds}
            nodeInteractionProps={nodeInteractionProps}
          />
          <StarPathDynamicGrowthLayer
            metrics={metrics}
            dynamicWorld={experience.dynamicWorld}
            recentlyEmergedIds={experience.dynamicRecentlyEmergedIds}
            activeBranchIds={experience.activeBranchIds}
            nodeInteractionProps={nodeInteractionProps}
            onNodePress={onNodePress}
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

      <StarPathOffscreenGrowthIndicator hints={experience.offscreenGrowthHints} />

      <View style={styles.overlay} pointerEvents="box-none">
        {guideExpanded ? (
          <AIGuideControl
            theme={theme}
            expanded
            reactionHint={experience.guideReaction}
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
            stepTitle={experience.nextStepCopy.title}
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

      <StarPathNodeDetailSheet
        visible={!!detailEntry}
        theme={theme}
        entry={detailEntry ?? null}
        uiState={detailUiState}
        onClose={closeDetail}
        onExplore={() => {
          if (!detailEntry) return;
          const dynamicNode = experience.dynamicWorld.nodes.find((n) => n.id === detailEntry.id);
          const signalNodeId = dynamicNode?.sourceId ?? detailEntry.id;
          experience.recordInteraction(signalNodeId, detailEntry.branchId, 'explored');
          closeDetail();
        }}
        onInterested={() => {
          if (!detailEntry) return;
          const dynamicNode = experience.dynamicWorld.nodes.find((n) => n.id === detailEntry.id);
          const signalNodeId = dynamicNode?.sourceId ?? detailEntry.id;
          experience.recordInteraction(signalNodeId, detailEntry.branchId, 'interested');
          closeDetail();
        }}
        onDismiss={() => {
          if (!detailEntry) return;
          const dynamicNode = experience.dynamicWorld.nodes.find((n) => n.id === detailEntry.id);
          const signalNodeId = dynamicNode?.sourceId ?? detailEntry.id;
          experience.recordInteraction(signalNodeId, detailEntry.branchId, 'dismissed');
          closeDetail();
        }}
        onSave={() => {
          if (!detailEntry) return;
          const dynamicNode = experience.dynamicWorld.nodes.find((n) => n.id === detailEntry.id);
          const signalNodeId = dynamicNode?.sourceId ?? detailEntry.id;
          experience.recordInteraction(signalNodeId, detailEntry.branchId, 'saved');
          closeDetail();
        }}
        onUndoDismiss={() => {
          if (!detailEntry) return;
          const dynamicNode = experience.dynamicWorld.nodes.find((n) => n.id === detailEntry.id);
          const signalNodeId = dynamicNode?.sourceId ?? detailEntry.id;
          experience.undoDismiss(signalNodeId, detailEntry.branchId);
          closeDetail();
        }}
      />

      <StarPathAvatarIdentitySheet
        visible={avatarSheetOpen}
        theme={theme}
        identity={experience.avatarIdentity}
        profilePhotoUri={currentUser.avatarUri}
        onClose={() => setAvatarSheetOpen(false)}
        onSelectProfilePhoto={() => {
          if (currentUser.avatarUri) {
            experience.setProfilePhotoAvatar(currentUser.avatarUri);
          }
          setAvatarSheetOpen(false);
        }}
        onSelectPreset={(id) => {
          experience.setPresetAvatar(id);
          setAvatarSheetOpen(false);
        }}
        onSaveCustom={(config) => experience.setCustomAvatar(config)}
        onUseSilhouette={() => {
          experience.useDefaultSilhouette();
          setAvatarSheetOpen(false);
        }}
      />
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
