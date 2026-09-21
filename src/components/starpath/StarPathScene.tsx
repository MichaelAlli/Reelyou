/** LOCKED STARPATH WORLD — preserve approved world/background/scroll behavior unless explicitly authorized. */
/** LOCKED NAV 01 STARPATH INTEGRATION — preserve vertical journey, world visuals, Guide, Next Step, and direct interactions. */
import { useRouter } from 'expo-router';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ScrollView as ScrollViewType } from 'react-native';
import type { LayoutChangeEvent } from 'react-native';
import { Platform, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
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
import { StarPathOffscreenSignalIndicator } from '@/components/starpath/StarPathOffscreenSignalIndicator';
import { StarPathOpportunityDetailSheet } from '@/components/starpath/StarPathOpportunityDetailSheet';
import { StarPathOpportunityLayer } from '@/components/starpath/StarPathOpportunityLayer';
import { opportunityByNodeId } from '@/starpath/starpathResourceActions';
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
import { saveStarPathViewport } from '@/starpath/starpathViewportPersistence';
import { buildStarPathFocusCandidates } from '@/spatialFocus/adapters/starPathFocusAdapter';
import { SpatialFocusHost } from '@/spatialFocus/SpatialFocusHost';

interface StarPathSceneProps {
  visualMode?: StarPathVisualMode;
  onNextStepPress?: () => void;
}

function StarPathSceneComponent({ visualMode = 'night', onNextStepPress }: StarPathSceneProps) {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const [nextStepExpanded, setNextStepExpanded] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const [detailNodeId, setDetailNodeId] = useState<string | null>(null);
  const [detailOpportunityNodeId, setDetailOpportunityNodeId] = useState<string | null>(null);
  const [avatarSheetOpen, setAvatarSheetOpen] = useState(false);
  const [sceneLayout, setSceneLayout] = useState({ width: 0, height: 0 });
  const spatialFocusClearRef = useRef<(() => void) | null>(null);

  const theme = useMemo(() => getStarPathTheme(visualMode), [visualMode]);
  const viewportWidth = sceneLayout.width > 0 ? sceneLayout.width : width;
  const viewportHeight = sceneLayout.height > 0 ? sceneLayout.height : height;
  const experience = useStarPathExperience();

  const metrics = useMemo(() => {
    const base = createStarPathLayoutMetrics(width, height);
    return applyDynamicWorldExpansion(base, experience.dynamicWorld.worldExpansionPx);
  }, [width, height, experience.dynamicWorld.worldExpansionPx]);
  const { graph } = useStarPathWorldGraph();
  const { scrollRef, onScroll, restoreInitialViewport } = useStarPathScrollCamera(metrics, height);
  const viewportRestoredRef = useRef(false);
  const viewportSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!experience.ready) return;
    if (experience.uiChrome) {
      setNextStepExpanded(experience.uiChrome.nextStepExpanded);
    }
  }, [experience.ready, experience.uiChrome]);

  useEffect(() => {
    if (!experience.ready || viewportRestoredRef.current) return;
    viewportRestoredRef.current = true;
    const saved = experience.savedViewport;
    const maxScroll = Math.max(0, metrics.worldHeight - height);
    if (
      saved &&
      saved.worldExpansionPx === experience.dynamicWorld.worldExpansionPx &&
      Math.abs(saved.viewportHeight - height) < 96
    ) {
      const y = Math.min(Math.max(0, saved.scrollY), maxScroll);
      (scrollRef.current as ScrollViewType | null)?.scrollTo({ y, animated: false });
      setScrollY(y);
      return;
    }
    restoreInitialViewport(false);
    setScrollY(metrics.initialScrollY);
  }, [
    experience.ready,
    experience.savedViewport,
    experience.dynamicWorld.worldExpansionPx,
    metrics.worldHeight,
    metrics.initialScrollY,
    height,
    restoreInitialViewport,
    scrollRef,
  ]);

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
      spatialFocusClearRef.current?.();
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
      const y = e.nativeEvent.contentOffset.y;
      setScrollY(y);
      if (viewportSaveTimer.current) clearTimeout(viewportSaveTimer.current);
      viewportSaveTimer.current = setTimeout(() => {
        void saveStarPathViewport({
          scrollY: y,
          worldExpansionPx: experience.dynamicWorld.worldExpansionPx,
          viewportHeight: height,
          savedAt: Date.now(),
        });
      }, 520);
    },
    [onScroll, experience.dynamicWorld.worldExpansionPx, height],
  );

  const closeDetail = useCallback(() => setDetailNodeId(null), []);

  const scrollToOpportunityNode = useCallback(
    (nodeId: string) => {
      const placed = experience.resourceState.placedNodes.find((n) => n.nodeId === nodeId);
      if (!placed) return;
      const { y } = refPointToWorldPx({ x: placed.refX, y: placed.refY }, metrics);
      const targetY = Math.max(0, y - height * 0.42);
      (scrollRef.current as ScrollViewType | null)?.scrollTo({ y: targetY, animated: true });
      setScrollY(targetY);
    },
    [experience.resourceState.placedNodes, metrics, height, scrollRef],
  );

  useEffect(() => {
    if (!experience.highlightOpportunityNodeId) return;
    scrollToOpportunityNode(experience.highlightOpportunityNodeId);
    setDetailOpportunityNodeId(experience.highlightOpportunityNodeId);
  }, [experience.highlightOpportunityNodeId, scrollToOpportunityNode]);

  const opportunityDetail = useMemo(() => {
    if (!detailOpportunityNodeId) return null;
    return opportunityByNodeId(experience.resourceState, detailOpportunityNodeId);
  }, [detailOpportunityNodeId, experience.resourceState]);

  const offscreenSignals = useMemo(
    () =>
      experience.signalState.activeSignalIds
        .map((id) => experience.signalState.signalsById[id])
        .filter(Boolean),
    [experience.signalState],
  );

  const hasBelowPathSignal = useMemo(
    () =>
      offscreenSignals.some(
        (s) => s.signalType === 'directional_light' && s.offscreenDirection === 'below',
      ),
    [offscreenSignals],
  );

  const onOpportunityPress = useCallback(
    (nodeId: string) => {
      spatialFocusClearRef.current?.();
      experience.openOpportunityNode(nodeId);
      setDetailOpportunityNodeId(nodeId);
    },
    [experience],
  );

  const handleSceneLayout = useCallback((event: LayoutChangeEvent) => {
    const { width: layoutWidth, height: layoutHeight } = event.nativeEvent.layout;
    setSceneLayout({ width: layoutWidth, height: layoutHeight });
  }, []);

  const registerSpatialFocusClear = useCallback((clear: (() => void) | null) => {
    spatialFocusClearRef.current = clear;
  }, []);

  const handleNextStep = useCallback(() => {
    if (experience.nextStepType === 'review_opportunity' && experience.nextStepSourceIds[0]) {
      const nodeId = experience.nextStepSourceIds[0];
      experience.navigateToOpportunityNode(nodeId);
      scrollToOpportunityNode(nodeId);
      setDetailOpportunityNodeId(nodeId);
      experience.openOpportunityNode(nodeId);
      return;
    }
    onNextStepPress?.();
  }, [experience, onNextStepPress, scrollToOpportunityNode]);

  const bottomInset = TabBarHeight + StarPathSpacing.controlGap;
  /** ~compact Next Step card height + breathing room above "Along the path below". */
  const nextStepCardBottom = bottomInset + 18;
  const alongPathBottomOffset = nextStepExpanded ? nextStepCardBottom + 132 : bottomInset + 8;

  const guideMessageId = experience.guideMessageId;
  const guideIntroDismissed = experience.uiChrome?.guideIntroPopupDismissed === true;
  const showGuideIntroPopup = experience.ready && !guideIntroDismissed;
  const showGuideBeacon =
    guideIntroDismissed &&
    Boolean(guideMessageId) &&
    experience.uiChrome?.guidePopupDismissedMessageId !== guideMessageId;

  const openYourGuide = useCallback(() => {
    router.push('/companion' as never);
  }, [router]);

  const dismissGuidePopup = useCallback(() => {
    experience.setUiChrome({
      guideIntroPopupDismissed: true,
      guideExpanded: false,
    });
  }, [experience]);

  const spatialFocusDisabled =
    !!detailNodeId ||
    !!detailOpportunityNodeId ||
    avatarSheetOpen ||
    showGuideIntroPopup;

  const starPathFocusCandidates = useMemo(
    () =>
      buildStarPathFocusCandidates({
        graph,
        placedNodes: experience.resourceState.placedNodes.map((node) => ({
          nodeId: node.nodeId,
          refX: node.refX,
          refY: node.refY,
        })),
        dynamicNodes: experience.dynamicWorld.nodes.map((node) => ({
          id: node.id,
          refX: node.refX,
          refY: node.refY,
        })),
        metrics,
        scrollY,
        layoutWidth: viewportWidth,
        layoutHeight: viewportHeight,
        isNodeEligible: (nodeId) => {
          const dynamicNode = experience.dynamicWorld.nodes.find((n) => n.id === nodeId);
          const ui = experience.getNodeUiState(dynamicNode?.sourceId ?? nodeId);
          return ui !== 'dismissed';
        },
      }),
    [
      experience.dynamicWorld.nodes,
      experience.getNodeUiState,
      experience.resourceState.placedNodes,
      graph,
      metrics,
      scrollY,
      viewportHeight,
      viewportWidth,
    ],
  );

  const spatialFocusBottomInset = nextStepExpanded ? nextStepCardBottom + 88 : bottomInset + 28;
  const spatialFocusFloatingNavBottom = nextStepExpanded
    ? nextStepCardBottom + 148
    : bottomInset + 52;

  const scrollToWorldNode = useCallback(
    (nodeId: string) => {
      const symbol = graph.symbolNodes.find((n) => n.id === nodeId);
      const portrait = graph.portraitNodes.find((n) => n.id === nodeId);
      const point = symbol ?? portrait;
      if (!point) return;
      const { y } = refPointToWorldPx(point, metrics);
      const targetY = Math.max(0, y - height * 0.42);
      (scrollRef.current as ScrollViewType | null)?.scrollTo({ y: targetY, animated: true });
      setScrollY(targetY);
    },
    [graph.portraitNodes, graph.symbolNodes, metrics, height, scrollRef],
  );

  const handleCommunityChromePress = useCallback(() => {
    scrollToWorldNode('sym-community');
    onNodePress('sym-community');
  }, [onNodePress, scrollToWorldNode]);

  const handleFavoritesChromePress = useCallback(() => {
    const savedResourceId = experience.resourceState.savedResourceIds[0];
    if (savedResourceId) {
      const candidate = experience.resourceState.resourcesById[savedResourceId];
      const nodeId = candidate?.relatedNodeIds[0];
      if (nodeId) {
        scrollToOpportunityNode(nodeId);
        experience.openOpportunityNode(nodeId);
        setDetailOpportunityNodeId(nodeId);
        return;
      }
    }
    const exampleNode =
      experience.resourceState.placedNodes.find((n) => n.nodeId.includes('community'))?.nodeId ??
      experience.resourceState.placedNodes[0]?.nodeId;
    if (exampleNode) {
      scrollToOpportunityNode(exampleNode);
      experience.openOpportunityNode(exampleNode);
      setDetailOpportunityNodeId(exampleNode);
    }
  }, [experience, scrollToOpportunityNode]);

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
    <View style={styles.root} testID="starpath-world" onLayout={handleSceneLayout}>
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
          <StarPathOpportunityLayer
            metrics={metrics}
            placedNodes={experience.resourceState.placedNodes}
            signalsById={experience.signalState.signalsById}
            activeSignalIds={experience.signalState.activeSignalIds}
            highlightNodeId={experience.highlightOpportunityNodeId}
            onNodePress={onOpportunityPress}
          />
          {!nextStepExpanded ? (
            <NextStepWaypoint
              x={nextStepWorld.x}
              y={nextStepWorld.y}
              onPress={() => {
                setNextStepExpanded(true);
                experience.setUiChrome({ nextStepExpanded: true });
              }}
            />
          ) : null}
        </View>
      </ScrollView>

      <StarPathTopChrome
        onCommunityPress={handleCommunityChromePress}
        onFavoritesPress={handleFavoritesChromePress}
      />

      <StarPathOffscreenGrowthIndicator
        hints={experience.offscreenGrowthHints}
        hideBelow={hasBelowPathSignal}
      />
      <StarPathOffscreenSignalIndicator
        signals={offscreenSignals}
        bottomOffset={alongPathBottomOffset}
        onNavigateToNode={(nodeId) => {
          experience.navigateToOpportunityNode(nodeId);
          scrollToOpportunityNode(nodeId);
          experience.acknowledgeSignal(`sig-${nodeId}`);
        }}
      />

      <View style={styles.overlay} pointerEvents="box-none">
        <View
          style={[styles.guideSlot, { top: StarPathSpacing.guideTop }]}
          pointerEvents="box-none"
        >
          {showGuideIntroPopup ? (
            <AIGuideControl
              theme={theme}
              variant="popup"
              onOpenGuide={openYourGuide}
              onDismissPopup={dismissGuidePopup}
              reduceMotion={!!reduceMotion}
            />
          ) : (
            <AIGuideControl
              theme={theme}
              variant="icon"
              showBeacon={showGuideBeacon}
              onOpenGuide={openYourGuide}
              reduceMotion={!!reduceMotion}
            />
          )}
        </View>

        {nextStepExpanded ? (
          <NextStepJourneyControl
            theme={theme}
            expanded
            stepTitle={experience.nextStepCopy.title}
            onExpand={() => {
              setNextStepExpanded(true);
              experience.setUiChrome({ nextStepExpanded: true });
            }}
            onCollapse={() => {
              setNextStepExpanded(false);
              experience.setUiChrome({ nextStepExpanded: false });
            }}
            onAction={handleNextStep}
            waypointX={nextStepWorld.x}
            waypointY={nextStepWorld.y - scrollY}
            cardBottom={nextStepCardBottom}
            reduceMotion={!!reduceMotion}
          />
        ) : null}
      </View>

      <View style={styles.spatialFocusViewport} pointerEvents="box-none">
        <SpatialFocusHost
          overlayMode
          layoutWidth={viewportWidth}
          layoutHeight={viewportHeight}
          candidates={starPathFocusCandidates}
          disabled={spatialFocusDisabled}
          hintSurface="starpath"
          showFloatingNav
          floatingNavBottom={spatialFocusFloatingNavBottom}
          onRegisterClear={registerSpatialFocusClear}
          topInset={StarPathSpacing.guideTop + 68}
          bottomInset={spatialFocusBottomInset}
        />
      </View>

      <StarPathOpportunityDetailSheet
        visible={!!opportunityDetail}
        theme={theme}
        candidate={opportunityDetail?.candidate ?? null}
        whyHere={
          opportunityDetail?.candidate.reasonCodes.length
            ? 'This connects with paths and interests you have been exploring.'
            : null
        }
        saved={
          opportunityDetail
            ? experience.resourceState.savedResourceIds.includes(opportunityDetail.candidate.id)
            : false
        }
        onClose={() => setDetailOpportunityNodeId(null)}
        onSave={() => {
          if (!opportunityDetail) return;
          experience.saveOpportunity(opportunityDetail.candidate.id);
        }}
        onDismiss={() => {
          if (!opportunityDetail) return;
          experience.dismissOpportunity(opportunityDetail.candidate.id);
          setDetailOpportunityNodeId(null);
        }}
        onSnooze={() => {
          if (!opportunityDetail) return;
          experience.snoozeOpportunity(opportunityDetail.candidate.id);
          setDetailOpportunityNodeId(null);
        }}
        onInterested={() => {
          if (!opportunityDetail) return;
          experience.saveOpportunity(opportunityDetail.candidate.id);
          const nodeId = opportunityDetail.candidate.relatedNodeIds[0];
          if (nodeId) {
            const entry = getStarPathNodeCatalogEntry(nodeId);
            if (entry) experience.recordInteraction(nodeId, entry.branchId, 'interested', 'discovery');
          }
        }}
      />

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
  spatialFocusViewport: {
    ...StyleSheet.absoluteFill,
    zIndex: 56,
    pointerEvents: 'box-none',
    ...(Platform.OS === 'android' ? { elevation: 56 } : null),
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
