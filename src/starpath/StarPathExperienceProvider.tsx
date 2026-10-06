import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { resolveActiveUserId } from '@/auth/resolveActiveUserId';
import { useReelyouAuth } from '@/auth/ReelyouAuthProvider';
import { isReelyouAuthConfigured } from '@/auth/reellyouAuthConfig';
import { registerSignOutCleanup } from '@/auth/sessionLifecycle';
import { useUserAvatar } from '@/identity/UserAvatarProvider';
import { resolveProfilePhotoUri } from '@/identity/resolveProfilePhotoUri';
import {
  DEFAULT_CUSTOM_AVATAR,
  type CustomAvatarConfig,
  type UserAvatarIdentity,
} from '@/identity/userAvatarTypes';
import {
  appendSignalDeduped,
  createSignal,
  deriveNodeUiState,
} from '@/starpath/starpathInteractionLogic';
import {
  saveStarPathInteractions,
} from '@/starpath/starpathInteractionPersistence';
import { hydrateStarPathAuthoritativeState, touchStarPathPersistenceManifest } from '@/starpath/starpathPersistenceBoundary';
import type {
  StarPathInteractionSnapshot,
  StarPathInteractionType,
  StarPathNodeUiState,
} from '@/starpath/starpathInteractionTypes';
import { getStarPathNodeCatalogEntry } from '@/starpath/starpathNodeCatalog';
import { whyThisLinesForReasons } from '@/starpath/starpathGuidanceCopy';
import { computeStarPathGuidance } from '@/starpath/starpathGuidanceEngine';
import { buildGuidanceSafeInputs } from '@/starpath/starpathGuidanceInputs';
import { saveStarPathGuidanceState } from '@/starpath/starpathGuidancePersistence';
import { EMPTY_GUIDANCE_STATE } from '@/starpath/starpathGuidanceTypes';
import { GUIDANCE_STABILITY } from '@/starpath/starpathGuidanceConfig';
import { reconcileLivingWorld } from '@/starpath/starpathDynamicWorldEngine';
import { saveStarPathDynamicWorld } from '@/starpath/starpathDynamicWorldPersistence';
import {
  EMPTY_DYNAMIC_WORLD,
  type StarPathDynamicWorldState,
  type StarPathOffscreenGrowthHint,
} from '@/starpath/starpathDynamicWorldTypes';
import { computeStarPathSiftingState } from '@/starpath/starpathSiftingEngine';
import type { RelevanceBand, StarPathSiftingState } from '@/starpath/starpathSiftingTypes';
import { parseUserReportedSupport, saveEmotionalContext } from '@/starpath/starpathEmotionalContextPersistence';
import type { UserSupportState } from '@/starpath/starpathEmotionalContextTypes';
import { markGuideMentioned, markOpportunityOpened } from '@/starpath/starpathOpportunityOrganizer';
import { EMPTY_RESOURCE_STATE, type StarPathResourceState } from '@/starpath/starpathOpportunityTypes';
import { runOpportunityOrchestrator } from '@/starpath/starpathOpportunityOrchestrator';
import { saveStarPathResourceState } from '@/starpath/starpathResourcePersistence';
import {
  dismissResource,
  opportunityByNodeId,
  saveResource,
  snoozeResource,
} from '@/starpath/starpathResourceActions';
import { isStarpathWorldSignalDemoEnabled } from '@/constants/devFlags';
import { canonicalSignalStore } from '@/signals/canonical/canonicalSignalStore';
import {
  computeStarPathSignalsWithCanonicalWorld,
  findCanonicalEventForOpportunityNode,
  type StarPathWorldGrowthCue,
} from '@/starpath/starpathCanonicalWorldSignals';
import { EMPTY_SIGNAL_STATE, type StarPathSignalState } from '@/starpath/starpathSignalTypes';
import { saveStarPathSignalState } from '@/starpath/starpathSignalPersistence';
import { maybeSeedStarpathWorldSignalDemo } from '@/starpath/starpathWorldSignalDevSeed';
import type { StarPathUiChromeSnapshot, StarPathViewportSnapshot } from '@/starpath/starpathPersistenceTypes';
import { saveStarPathUiChrome } from '@/starpath/starpathUiChromePersistence';
import type { StarPathNextStepType } from '@/starpath/starpathGuidanceTypes';
import { useReelyouConnect } from '@/connect/ReelyouConnectProvider';
import { registerStarpathActivityListener } from '@/journeyThreads/journeyThreadFutureHooks';
import { buildJourneyPersonalizationBundle } from '@/journey/buildJourneyPersonalizationBundle';
import { useOnboarding } from '@/onboarding';
import { useSkyAreaPreferences } from '@/skyAreas/SkyAreaPreferencesProvider';
import { applyGuidePreferences } from '@/starpath/starpathGuidePreferenceFilter';
import {
  gateInteractionSignals,
  gateTodayFocusText,
} from '@/starpath/personalizationPreferenceGate';
import {
  fingerprintForCandidate,
  loadRankingFeedback,
  recordRankingFeedback,
  type RankingFeedbackState,
} from '@/starpath/starpathRankingFeedback';

interface StarPathExperienceContextValue {
  ready: boolean;
  interactions: StarPathInteractionSnapshot;
  getNodeUiState: (nodeId: string) => StarPathNodeUiState;
  recordInteraction: (
    nodeId: string,
    branchId: string,
    type: StarPathInteractionType,
    source?: 'node_detail' | 'node_tap' | 'discovery',
  ) => void;
  undoDismiss: (nodeId: string, branchId: string) => void;
  softHighlightNodeIds: Set<string>;
  activeBranchIds: Set<string>;
  guideReaction: string | null;
  guideWhyThisLines: string[];
  guideMessageId: string | null;
  dismissActiveGuide: () => void;
  snoozeActiveGuide: () => void;
  nextStepCopy: { title: string; actionLabel: string };
  avatarIdentity: UserAvatarIdentity;
  setProfilePhotoAvatar: (uri?: string | null) => void;
  setPresetAvatar: (presetId: string) => void;
  setCustomAvatar: (config: CustomAvatarConfig) => void;
  useDefaultSilhouette: () => void;
  siftingState: StarPathSiftingState;
  getNodeRelevanceBand: (nodeId: string) => RelevanceBand | undefined;
  dynamicWorld: StarPathDynamicWorldState;
  dynamicRecentlyEmergedIds: Set<string>;
  offscreenGrowthHints: StarPathOffscreenGrowthHint[];
  setLivingWorldViewport: (scrollY: number, viewportHeight: number, contentBandHeight: number, paddingTop: number) => void;
  resourceState: StarPathResourceState;
  signalState: StarPathSignalState;
  highlightOpportunityNodeId: string | null;
  nextStepType: StarPathNextStepType;
  nextStepSourceIds: string[];
  guideShowsOpportunity: boolean;
  navigateToOpportunityNode: (nodeId: string) => void;
  openOpportunityNode: (nodeId: string) => void;
  saveOpportunity: (candidateId: string) => void;
  dismissOpportunity: (candidateId: string) => void;
  snoozeOpportunity: (candidateId: string) => void;
  showGuideOpportunity: () => void;
  reportUserSupportLabel: (label: string) => void;
  uiChrome: StarPathUiChromeSnapshot | null;
  setUiChrome: (patch: Partial<StarPathUiChromeSnapshot>) => void;
  savedViewport: StarPathViewportSnapshot | null;
  acknowledgeSignal: (signalId: string) => void;
  worldGrowthCue: StarPathWorldGrowthCue | null;
  dismissWorldGrowthCue: () => void;
  viewWorldGrowthCue: () => void;
}

const StarPathExperienceContext = createContext<StarPathExperienceContextValue | null>(null);

export function StarPathExperienceProvider({
  children,
  todayFocusText = null,
}: {
  children: ReactNode;
  todayFocusText?: string | null;
}) {
  const auth = useReelyouAuth();
  const viewerId = resolveActiveUserId(auth.user);
  const { preferences: userPreferences, messages, skyFollowGraph } = useReelyouConnect();
  const { personalizationProfile } = useOnboarding();
  const { selectedIds: skyContextAreaIds } = useSkyAreaPreferences();
  const journeyPersonalization = useMemo(
    () =>
      buildJourneyPersonalizationBundle({
        profile: personalizationProfile,
        selectedSkyAreaIds: skyContextAreaIds,
      }),
    [personalizationProfile, skyContextAreaIds],
  );
  const userAvatar = useUserAvatar();
  const [ready, setReady] = useState(false);
  const [interactions, setInteractions] = useState<StarPathInteractionSnapshot>({
    version: 1,
    signals: [],
    softHighlightNodeIds: [],
    activeBranchIds: [],
  });
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const siftingRef = useRef<StarPathSiftingState | null>(null);
  const [dynamicWorld, setDynamicWorld] = useState<StarPathDynamicWorldState>(EMPTY_DYNAMIC_WORLD);
  const [dynamicRecentlyEmergedIds, setDynamicRecentlyEmergedIds] = useState<string[]>([]);
  const [offscreenGrowthHints, setOffscreenGrowthHints] = useState<StarPathOffscreenGrowthHint[]>([]);
  const [guidanceMeta, setGuidanceMeta] = useState(EMPTY_GUIDANCE_STATE);
  const [guidancePulse, setGuidancePulse] = useState(0);
  const guidanceSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const guidancePersistRef = useRef(EMPTY_GUIDANCE_STATE);
  const activeGuideIdRef = useRef<string | null>(null);
  const exploreTriggerRef = useRef<string | null>(null);
  const [explorePulse, setExplorePulse] = useState(0);
  const viewportRef = useRef({ scrollY: 0, viewportHeight: 852, contentBandHeight: 852, paddingTop: 0 });
  const dynamicSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [resourceState, setResourceState] = useState<StarPathResourceState>(EMPTY_RESOURCE_STATE);
  const [signalState, setSignalState] = useState<StarPathSignalState>(EMPTY_SIGNAL_STATE);
  const [worldGrowthCue, setWorldGrowthCue] = useState<StarPathWorldGrowthCue | null>(null);
  const [canonicalSignalTail, setCanonicalSignalTail] = useState(0);
  const [supportState, setSupportState] = useState<UserSupportState>('unknown');
  const [highlightOpportunityNodeId, setHighlightOpportunityNodeId] = useState<string | null>(null);
  const [opportunityContext, setOpportunityContext] = useState({
    primaryOpportunityNodeId: null as string | null,
    primaryOpportunityCandidateId: null as string | null,
    timeSensitiveOpportunityId: null as string | null,
    opportunityGuideEscalation: false,
  });
  const [viewportVersion, setViewportVersion] = useState(0);
  const resourceSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const signalSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const orchestratorGen = useRef(0);
  const lastViewportBump = useRef(0);
  const lastGuideMentionRef = useRef<string | null>(null);
  const resourceStateRef = useRef(resourceState);
  resourceStateRef.current = resourceState;
  const [uiChrome, setUiChromeState] = useState<StarPathUiChromeSnapshot | null>(null);
  const [savedViewport, setSavedViewport] = useState<StarPathViewportSnapshot | null>(null);
  const uiChromeSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [rankingFeedback, setRankingFeedback] = useState<RankingFeedbackState>({ entries: [] });
  const rankingFeedbackRef = useRef(rankingFeedback);
  rankingFeedbackRef.current = rankingFeedback;
  const [journeyActivityPulse, setJourneyActivityPulse] = useState(0);

  useEffect(() => {
    return registerStarpathActivityListener(() => {
      setJourneyActivityPulse((value) => value + 1);
    });
  }, []);

  const resetStarpathSessionMemory = useCallback(() => {
    setInteractions({
      version: 1,
      signals: [],
      softHighlightNodeIds: [],
      activeBranchIds: [],
    });
    setDynamicWorld(EMPTY_DYNAMIC_WORLD);
    setGuidanceMeta(EMPTY_GUIDANCE_STATE);
    guidancePersistRef.current = EMPTY_GUIDANCE_STATE;
    setResourceState(EMPTY_RESOURCE_STATE);
    setSignalState(EMPTY_SIGNAL_STATE);
    setSupportState('unknown');
    setUiChromeState(null);
    setSavedViewport(null);
    setRankingFeedback({ entries: [] });
    setWorldGrowthCue(null);
  }, []);

  useEffect(() => {
    return registerSignOutCleanup(resetStarpathSessionMemory);
  }, [resetStarpathSessionMemory]);

  useEffect(() => {
    if (isReelyouAuthConfigured() && !viewerId) {
      resetStarpathSessionMemory();
      setReady(false);
      return;
    }

    let mounted = true;
    setReady(false);
    void (async () => {
      const { bundle } = await hydrateStarPathAuthoritativeState();
      const feedback = await loadRankingFeedback();
      if (!mounted) return;
      setRankingFeedback(feedback);
      setInteractions(bundle.interactions);
      setDynamicWorld(bundle.dynamicWorld);
      setGuidanceMeta(bundle.guidance);
      guidancePersistRef.current = bundle.guidance;
      setResourceState(bundle.resources);
      setSignalState(bundle.signals);
      setSupportState(bundle.emotional.supportState);
      setUiChromeState(bundle.uiChrome);
      setSavedViewport(bundle.viewport);
      setReady(true);
    })();
    return () => {
      mounted = false;
    };
  }, [resetStarpathSessionMemory, viewerId]);

  const manifestTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scheduleManifestTouch = useCallback(() => {
    if (manifestTimer.current) clearTimeout(manifestTimer.current);
    manifestTimer.current = setTimeout(() => {
      void touchStarPathPersistenceManifest();
    }, 400);
  }, []);

  const focusForGuidance = useMemo(
    () => gateTodayFocusText(todayFocusText, userPreferences.personalizationPreferences),
    [todayFocusText, userPreferences.personalizationPreferences],
  );

  const activeViewerId = viewerId;

  const worldSignalBridge = useMemo(
    () => ({
      canonicalStore: canonicalSignalStore,
      userId: activeViewerId,
      signalPrefs: { quietMode: userPreferences.signalPreferences.quietMode },
      privacy: {
        viewerUserId: activeViewerId,
        ownerUserId: activeViewerId,
        blockedUserIds: messages.blockedUserIds,
        isMutualSkyFriend: false,
      },
      allowOpportunityWorldCue: userPreferences.discoveryPreferences.showOpportunityDiscovery,
      reduceMotion: userPreferences.accessibilityPreferences.preferReducedMotion,
    }),
    [
      activeViewerId,
      userPreferences.signalPreferences.quietMode,
      userPreferences.discoveryPreferences.showOpportunityDiscovery,
      userPreferences.accessibilityPreferences.preferReducedMotion,
      messages.blockedUserIds,
    ],
  );

  const signalsForSifting = useMemo(
    () => gateInteractionSignals(interactions.signals, userPreferences.personalizationPreferences),
    [interactions.signals, userPreferences.personalizationPreferences],
  );

  const scheduleSave = useCallback((next: StarPathInteractionSnapshot) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void saveStarPathInteractions(next);
      scheduleManifestTouch();
    }, 280);
  }, [scheduleManifestTouch]);

  const siftingState = useMemo(() => {
    const next = computeStarPathSiftingState(signalsForSifting, {
      previousState: siftingRef.current,
    });
    siftingRef.current = next;
    return next;
  }, [signalsForSifting]);

  const getNodeUiState = useCallback(
    (nodeId: string) => deriveNodeUiState(nodeId, interactions.signals),
    [interactions.signals],
  );

  const getNodeRelevanceBand = useCallback(
    (nodeId: string) => siftingState.nodeRelevance[nodeId]?.relevanceBand,
    [siftingState],
  );

  const setLivingWorldViewport = useCallback(
    (scrollY: number, viewportHeight: number, contentBandHeight: number, paddingTop: number) => {
      viewportRef.current = { scrollY, viewportHeight, contentBandHeight, paddingTop };
      const now = Date.now();
      if (now - lastViewportBump.current > 220) {
        lastViewportBump.current = now;
        setViewportVersion((v) => v + 1);
      }
    },
    [],
  );

  const scheduleResourceSave = useCallback((next: StarPathResourceState) => {
    if (resourceSaveTimer.current) clearTimeout(resourceSaveTimer.current);
    resourceSaveTimer.current = setTimeout(() => {
      void saveStarPathResourceState(next);
      scheduleManifestTouch();
    }, 320);
  }, [scheduleManifestTouch]);

  const scheduleSignalSave = useCallback((next: StarPathSignalState) => {
    if (signalSaveTimer.current) clearTimeout(signalSaveTimer.current);
    signalSaveTimer.current = setTimeout(() => {
      void saveStarPathSignalState(next);
      scheduleManifestTouch();
    }, 320);
  }, [scheduleManifestTouch]);

  useEffect(() => {
    if (!ready || !activeViewerId) return;
    const gen = ++orchestratorGen.current;
    const baseInputs = buildGuidanceSafeInputs(
      interactions.signals,
      siftingState,
      dynamicWorld,
      dynamicRecentlyEmergedIds,
      focusForGuidance,
      journeyPersonalization,
    );
    const parsed = userPreferences.emotionalContextPreference.adjustGuidanceIntensity
      ? parseUserReportedSupport(focusForGuidance)
      : 'unknown';
    const mergedSupport: UserSupportState =
      parsed !== 'unknown' ? parsed : supportState;

    void (async () => {
      const result = await runOpportunityOrchestrator({
        now: Date.now(),
        guidanceInputs: baseInputs,
        resourceState: resourceStateRef.current,
        signalState,
        supportState: mergedSupport,
        viewport: viewportRef.current,
        worldBridge: worldSignalBridge,
        peopleDiscovery: {
          viewerId: activeViewerId!,
          followGraph: skyFollowGraph,
          blockedUserIds: messages.blockedUserIds,
        },
        rankingFeedback: rankingFeedbackRef.current,
      });
      if (gen !== orchestratorGen.current) return;
      setResourceState(result.resourceState);
      setSignalState(result.signalState);
      setWorldGrowthCue(result.worldGrowthCue);
      if (userPreferences.discoveryPreferences.showOpportunityDiscovery) {
        setOpportunityContext({
          primaryOpportunityNodeId: result.primaryOpportunityNodeId,
          primaryOpportunityCandidateId: result.primaryOpportunityCandidateId,
          timeSensitiveOpportunityId: result.timeSensitiveOpportunityId,
          opportunityGuideEscalation:
            result.escalateGuideForOpportunity &&
            userPreferences.guidePreferences.opportunityNudges &&
            userPreferences.guidePreferences.timeSensitiveGuidance,
        });
      } else {
        setOpportunityContext({
          primaryOpportunityNodeId: null,
          primaryOpportunityCandidateId: null,
          timeSensitiveOpportunityId: null,
          opportunityGuideEscalation: false,
        });
      }
      scheduleResourceSave(result.resourceState);
      scheduleSignalSave(result.signalState);
    })();
  }, [
    ready,
    interactions.signals,
    siftingState,
    dynamicWorld,
    dynamicRecentlyEmergedIds,
    focusForGuidance,
    journeyPersonalization,
    journeyActivityPulse,
    userPreferences.discoveryPreferences.showOpportunityDiscovery,
    resourceState.dismissedResourceIds,
    resourceState.savedResourceIds,
    resourceState.snoozedResourceUntil,
    supportState,
    userPreferences.guidePreferences.opportunityNudges,
    userPreferences.guidePreferences.timeSensitiveGuidance,
    userPreferences.emotionalContextPreference.adjustGuidanceIntensity,
    worldSignalBridge,
    canonicalSignalTail,
    skyFollowGraph,
    messages.blockedUserIds,
    rankingFeedback,
  ]);

  useEffect(() => {
    if (!ready || !resourceState.placedNodes.length) return;
    maybeSeedStarpathWorldSignalDemo(
      canonicalSignalStore,
      resourceState.placedNodes,
      isStarpathWorldSignalDemoEnabled(),
    );
    setCanonicalSignalTail(canonicalSignalStore.getState().events.length);
  }, [ready, resourceState.placedNodes]);

  useEffect(() => {
    if (!ready || !resourceState.placedNodes.length) return;
    const parsed = userPreferences.emotionalContextPreference.adjustGuidanceIntensity
      ? parseUserReportedSupport(focusForGuidance)
      : 'unknown';
    const mergedSupport: UserSupportState = parsed !== 'unknown' ? parsed : supportState;
    setSignalState((prev) => {
      const merged = computeStarPathSignalsWithCanonicalWorld({
        now: Date.now(),
        placedNodes: resourceState.placedNodes,
        resourcesById: resourceState.resourcesById,
        dismissedResourceIds: resourceState.dismissedResourceIds,
        viewportScrollY: viewportRef.current.scrollY,
        viewportHeight: viewportRef.current.viewportHeight,
        paddingTop: viewportRef.current.paddingTop,
        contentBandHeight: viewportRef.current.contentBandHeight,
        supportState: mergedSupport,
        previous: prev,
        canonicalStore: worldSignalBridge.canonicalStore,
        userId: worldSignalBridge.userId,
        signalPrefs: worldSignalBridge.signalPrefs,
        privacy: worldSignalBridge.privacy,
        allowOpportunityWorldCue: worldSignalBridge.allowOpportunityWorldCue,
        reduceMotion: worldSignalBridge.reduceMotion,
      });
      setWorldGrowthCue(merged.growthCue);
      scheduleSignalSave(merged.signalState);
      return merged.signalState;
    });
  }, [
    ready,
    viewportVersion,
    resourceState.placedNodes,
    resourceState.resourcesById,
    resourceState.dismissedResourceIds,
    focusForGuidance,
    supportState,
    userPreferences.emotionalContextPreference.adjustGuidanceIntensity,
    scheduleSignalSave,
    worldSignalBridge,
    canonicalSignalTail,
  ]);

  useEffect(() => {
    if (!ready) return;
    const exploreNodeId = exploreTriggerRef.current;
    exploreTriggerRef.current = null;
    setDynamicWorld((prev) => {
      const result = reconcileLivingWorld(prev, {
        now: Date.now(),
        sifting: siftingState,
        signals: interactions.signals,
        exploreTriggerNodeId: exploreNodeId,
        ...viewportRef.current,
      });
      setDynamicRecentlyEmergedIds(result.recentlyEmergedIds);
      setOffscreenGrowthHints(result.offscreenHints);
      if (dynamicSaveTimer.current) clearTimeout(dynamicSaveTimer.current);
      dynamicSaveTimer.current = setTimeout(() => {
        void saveStarPathDynamicWorld(result.world);
        scheduleManifestTouch();
      }, 320);
      return result.world;
    });
  }, [ready, interactions.signals, siftingState, explorePulse, scheduleManifestTouch]);

  const guidancePack = useMemo(() => {
    const inputs = buildGuidanceSafeInputs(
      interactions.signals,
      siftingState,
      dynamicWorld,
      dynamicRecentlyEmergedIds,
      focusForGuidance,
      journeyPersonalization,
      userPreferences.discoveryPreferences.showOpportunityDiscovery
        ? {
            ...opportunityContext,
            dismissedOpportunityIds: resourceState.dismissedResourceIds,
          }
        : {
            primaryOpportunityNodeId: null,
            primaryOpportunityCandidateId: null,
            timeSensitiveOpportunityId: null,
            opportunityGuideEscalation: false,
            dismissedOpportunityIds: resourceState.dismissedResourceIds,
          },
    );
    const out = computeStarPathGuidance(inputs, {
      previous: {
        ...guidancePersistRef.current,
        guideDismissedIds: guidanceMeta.guideDismissedIds,
        guideSnoozedUntil: guidanceMeta.guideSnoozedUntil,
      },
      explicitPulse: guidancePulse > 0,
    });
    guidancePersistRef.current = out.state;
    return applyGuidePreferences(out, userPreferences.guidePreferences);
  }, [
    interactions.signals,
    siftingState,
    dynamicWorld,
    dynamicRecentlyEmergedIds,
    focusForGuidance,
    journeyPersonalization,
    userPreferences.discoveryPreferences.showOpportunityDiscovery,
    guidanceMeta.guideDismissedIds,
    guidanceMeta.guideSnoozedUntil,
    guidancePulse,
    opportunityContext,
    resourceState.dismissedResourceIds,
    userPreferences.guidePreferences,
  ]);

  useEffect(() => {
    const guide = guidancePack.guide;
    if (!guide) return;
    if (lastGuideMentionRef.current === guide.messageId) return;
    if (
      !['opportunity_notice', 'time_sensitive_opportunity', 'undiscovered_opportunity'].includes(guide.type)
    ) {
      return;
    }
    const candidateId = opportunityContext.primaryOpportunityCandidateId;
    if (!candidateId) return;
    lastGuideMentionRef.current = guide.messageId;
    setResourceState((prev) => {
      const next = markGuideMentioned(prev, candidateId, Date.now());
      scheduleResourceSave(next);
      return next;
    });
  }, [guidancePack.guide?.messageId, guidancePack.guide?.type, opportunityContext.primaryOpportunityCandidateId, scheduleResourceSave]);

  useEffect(() => {
    if (!ready) return;
    if (guidancePulse > 0) setGuidancePulse(0);
    if (guidanceSaveTimer.current) clearTimeout(guidanceSaveTimer.current);
    guidanceSaveTimer.current = setTimeout(() => {
      void saveStarPathGuidanceState(guidancePersistRef.current);
      scheduleManifestTouch();
    }, 280);
  }, [ready, guidancePack.guide?.messageId, guidancePack.nextStep.stepId, guidancePulse, guidanceMeta]);

  const dismissActiveGuide = useCallback(() => {
    const id = guidancePack.guide?.messageId ?? activeGuideIdRef.current;
    if (!id) return;
    activeGuideIdRef.current = id;
    setGuidanceMeta((prev) => {
      const next = {
        ...prev,
        guideDismissedIds: prev.guideDismissedIds.includes(id)
          ? prev.guideDismissedIds
          : [...prev.guideDismissedIds, id],
      };
      guidancePersistRef.current = { ...guidancePersistRef.current, guideDismissedIds: next.guideDismissedIds };
      return next;
    });
    setGuidancePulse((n) => n + 1);
  }, [guidancePack.guide?.messageId]);

  const snoozeActiveGuide = useCallback(() => {
    const id = guidancePack.guide?.messageId;
    if (!id) return;
    const until = Date.now() + GUIDANCE_STABILITY.snoozeDurationMs;
    setGuidanceMeta((prev) => {
      const guideSnoozedUntil = { ...prev.guideSnoozedUntil, [id]: until };
      guidancePersistRef.current = { ...guidancePersistRef.current, guideSnoozedUntil };
      return { ...prev, guideSnoozedUntil };
    });
    setGuidancePulse((n) => n + 1);
  }, [guidancePack.guide?.messageId]);

  const recordInteraction = useCallback(
    (
      nodeId: string,
      branchId: string,
      type: StarPathInteractionType,
      source: 'node_detail' | 'node_tap' | 'discovery' = 'node_detail',
    ) => {
      setInteractions((prev) => {
        const signal = createSignal({ nodeId, branchId, interactionType: type, source });
        const signals = appendSignalDeduped(prev.signals, signal);
        let softHighlightNodeIds = [...prev.softHighlightNodeIds];

        if (type === 'explored') {
          const entry = getStarPathNodeCatalogEntry(nodeId);
          const related = entry?.relatedNodeIds?.[0];
          if (related && !softHighlightNodeIds.includes(related)) {
            softHighlightNodeIds = [...softHighlightNodeIds, related];
          }
        }

        const next = { ...prev, signals, softHighlightNodeIds };
        scheduleSave(next);
        if (type === 'explored') {
          exploreTriggerRef.current = nodeId;
          setExplorePulse((n) => n + 1);
        }
        if (['explored', 'interested', 'saved', 'selected'].includes(type)) {
          setGuidancePulse((n) => n + 1);
        }
        return next;
      });
    },
    [scheduleSave],
  );

  const undoDismiss = useCallback(
    (nodeId: string, branchId: string) => {
      setInteractions((prev) => {
        const reversed = createSignal({
          nodeId,
          branchId,
          interactionType: 'dismissed',
          source: 'node_detail',
          reversed: true,
        });
        const explored = createSignal({
          nodeId,
          branchId,
          interactionType: 'explored',
          source: 'node_detail',
        });
        const next = { ...prev, signals: appendSignalDeduped(appendSignalDeduped(prev.signals, reversed), explored) };
        scheduleSave(next);
        return next;
      });
    },
    [scheduleSave],
  );

  const setProfilePhotoAvatar = useCallback(
    (uri?: string | null) => {
      userAvatar.setProfilePhotoUri(uri ?? null);
    },
    [userAvatar],
  );
  const setPresetAvatar = userAvatar.setPresetAvatar;
  const setCustomAvatar = userAvatar.setCustomAvatar;
  const useDefaultSilhouette = userAvatar.useDefaultSilhouette;
  const avatarIdentity = userAvatar.identity;

  const feedbackOpportunitySignal = useCallback(
    (candidateId: string, type: StarPathInteractionType) => {
      const candidate = resourceStateRef.current.resourcesById[candidateId];
      const nodeId = candidate?.relatedNodeIds[0];
      if (!nodeId) return;
      const entry = getStarPathNodeCatalogEntry(nodeId);
      if (!entry) return;
      recordInteraction(nodeId, entry.branchId, type, 'discovery');
    },
    [recordInteraction],
  );

  const acknowledgeSignal = useCallback(
    (signalId: string) => {
      setSignalState((prev) => {
        const acknowledgedSignalIds = prev.acknowledgedSignalIds.includes(signalId)
          ? prev.acknowledgedSignalIds
          : [...prev.acknowledgedSignalIds, signalId];
        const next = { ...prev, acknowledgedSignalIds };
        scheduleSignalSave(next);
        return next;
      });
    },
    [scheduleSignalSave],
  );

  const setUiChrome = useCallback((patch: Partial<StarPathUiChromeSnapshot>) => {
    setUiChromeState((prev) => {
      const next: StarPathUiChromeSnapshot = {
        guideExpanded: patch.guideExpanded ?? prev?.guideExpanded ?? false,
        nextStepExpanded: patch.nextStepExpanded ?? prev?.nextStepExpanded ?? true,
        guidePopupDismissedMessageId:
          patch.guidePopupDismissedMessageId !== undefined
            ? patch.guidePopupDismissedMessageId
            : (prev?.guidePopupDismissedMessageId ?? null),
        guideIntroPopupDismissed:
          patch.guideIntroPopupDismissed ?? prev?.guideIntroPopupDismissed ?? false,
        savedAt: Date.now(),
      };
      if (uiChromeSaveTimer.current) clearTimeout(uiChromeSaveTimer.current);
      uiChromeSaveTimer.current = setTimeout(() => {
        void saveStarPathUiChrome(next);
        scheduleManifestTouch();
      }, 280);
      return next;
    });
  }, [scheduleManifestTouch]);

  const dismissWorldGrowthCue = useCallback(() => {
    setWorldGrowthCue((active) => {
      if (!active) return null;
      canonicalSignalStore.dismissPresentation(active.signalEventId);
      setSignalState((prev) => {
        const growthId = `cws-growth-${active.nodeId}`;
        const { [growthId]: _removed, ...signalsById } = prev.signalsById;
        const next = {
          ...prev,
          signalsById,
          activeSignalIds: prev.activeSignalIds.filter((id) => id !== growthId),
        };
        scheduleSignalSave(next);
        return next;
      });
      return null;
    });
  }, [scheduleSignalSave]);

  const viewWorldGrowthCue = useCallback(() => {
    setWorldGrowthCue((active) => {
      if (!active) return null;
      canonicalSignalStore.setPresentationStatus(active.signalEventId, 'opened');
      setHighlightOpportunityNodeId(active.nodeId);
      acknowledgeSignal(`cws-growth-${active.nodeId}`);
      return null;
    });
  }, [acknowledgeSignal]);

  const openOpportunityNode = useCallback(
    (nodeId: string) => {
      setHighlightOpportunityNodeId(nodeId);
      acknowledgeSignal(`sig-${nodeId}`);
      const match = opportunityByNodeId(resourceStateRef.current, nodeId);
      const canonical = findCanonicalEventForOpportunityNode(
        canonicalSignalStore,
        activeViewerId ?? '',
        nodeId,
        match?.candidate.id,
      );
      if (canonical) {
        canonicalSignalStore.setPresentationStatus(canonical.id, 'opened');
      }
      setResourceState((prev) => {
        const next = markOpportunityOpened(prev, nodeId, Date.now());
        scheduleResourceSave(next);
        return next;
      });
      if (match) feedbackOpportunitySignal(match.candidate.id, 'viewed');
    },
    [acknowledgeSignal, activeViewerId, feedbackOpportunitySignal, scheduleResourceSave],
  );

  const navigateToOpportunityNode = useCallback((nodeId: string) => {
    setHighlightOpportunityNodeId(nodeId);
  }, []);

  const saveOpportunity = useCallback(
    (candidateId: string) => {
      setResourceState((prev) => {
        const next = saveResource(prev, candidateId);
        scheduleResourceSave(next);
        return next;
      });
      feedbackOpportunitySignal(candidateId, 'saved');
      setGuidancePulse((n) => n + 1);
    },
    [feedbackOpportunitySignal, scheduleResourceSave],
  );

  const dismissOpportunity = useCallback(
    (candidateId: string) => {
      setResourceState((prev) => {
        const next = dismissResource(prev, candidateId);
        scheduleResourceSave(next);
        return next;
      });
      const node = resourceStateRef.current.resourcesById[candidateId]?.relatedNodeIds[0];
      if (node) {
        const canonical = findCanonicalEventForOpportunityNode(
          canonicalSignalStore,
          activeViewerId ?? '',
          node,
          candidateId,
        );
        if (canonical) canonicalSignalStore.dismissPresentation(canonical.id);
      }
      feedbackOpportunitySignal(candidateId, 'dismissed');
      const candidate = resourceStateRef.current.resourcesById[candidateId];
      if (candidate) {
        void recordRankingFeedback({
          candidateId,
          kind: 'less_like',
          fingerprint: fingerprintForCandidate(candidate),
        }).then((_) => loadRankingFeedback().then(setRankingFeedback));
      }
      setGuidancePulse((n) => n + 1);
    },
    [activeViewerId, feedbackOpportunitySignal, scheduleResourceSave],
  );

  const snoozeOpportunity = useCallback(
    (candidateId: string) => {
      setResourceState((prev) => {
        const next = snoozeResource(prev, candidateId, Date.now());
        scheduleResourceSave(next);
        return next;
      });
      setGuidancePulse((n) => n + 1);
    },
    [scheduleResourceSave],
  );

  const showGuideOpportunity = useCallback(() => {
    const nodeId =
      guidancePack.guide?.sourceIds[0] ?? opportunityContext.primaryOpportunityNodeId;
    if (nodeId) navigateToOpportunityNode(nodeId);
  }, [guidancePack.guide?.sourceIds, navigateToOpportunityNode, opportunityContext.primaryOpportunityNodeId]);

  const reportUserSupportLabel = useCallback((label: string) => {
    const parsed = parseUserReportedSupport(label);
    setSupportState(parsed);
    void saveEmotionalContext({ supportState: parsed, userReportedLabel: label, updatedAt: Date.now() });
  }, []);

  const guideShowsOpportunity = useMemo(() => {
    const t = guidancePack.guide?.type;
    return (
      t === 'opportunity_notice' ||
      t === 'time_sensitive_opportunity' ||
      t === 'undiscovered_opportunity'
    );
  }, [guidancePack.guide?.type]);

  const resolvedAvatar = useMemo(() => {
    if (avatarIdentity.avatarSourceType === 'profilePhoto') {
      const uri = avatarIdentity.profilePhotoUri ?? undefined;
      if (uri) return avatarIdentity;
      return { ...avatarIdentity, avatarSourceType: 'defaultSilhouette' as const };
    }
    return avatarIdentity;
  }, [avatarIdentity]);

  const value = useMemo<StarPathExperienceContextValue>(
    () => ({
      ready,
      interactions,
      getNodeUiState,
      recordInteraction,
      undoDismiss,
      softHighlightNodeIds: new Set(interactions.softHighlightNodeIds),
      activeBranchIds: new Set(siftingState.guideSummary.elevatedBranchIds),
      guideReaction: guidancePack.guide?.body ?? null,
      guideWhyThisLines: whyThisLinesForReasons(guidancePack.guide?.reasonCodes ?? []),
      guideMessageId: guidancePack.guide?.messageId ?? null,
      dismissActiveGuide,
      snoozeActiveGuide,
      nextStepCopy: {
        title: guidancePack.nextStep.title,
        actionLabel: guidancePack.nextStep.actionLabel,
      },
      siftingState,
      getNodeRelevanceBand,
      dynamicWorld,
      dynamicRecentlyEmergedIds: new Set(dynamicRecentlyEmergedIds),
      offscreenGrowthHints,
      setLivingWorldViewport,
      avatarIdentity: resolvedAvatar,
      setProfilePhotoAvatar,
      setPresetAvatar,
      setCustomAvatar,
      useDefaultSilhouette,
      resourceState,
      signalState,
      highlightOpportunityNodeId,
      nextStepType: guidancePack.nextStep.type,
      nextStepSourceIds: guidancePack.nextStep.sourceIds,
      guideShowsOpportunity,
      navigateToOpportunityNode,
      openOpportunityNode,
      saveOpportunity,
      dismissOpportunity,
      snoozeOpportunity,
      showGuideOpportunity,
      reportUserSupportLabel,
      uiChrome,
      setUiChrome,
      savedViewport,
      acknowledgeSignal,
      worldGrowthCue,
      dismissWorldGrowthCue,
      viewWorldGrowthCue,
    }),
    [
      ready,
      interactions,
      siftingState,
      guidancePack,
      dismissActiveGuide,
      snoozeActiveGuide,
      dynamicWorld,
      dynamicRecentlyEmergedIds,
      offscreenGrowthHints,
      setLivingWorldViewport,
      getNodeRelevanceBand,
      getNodeUiState,
      recordInteraction,
      undoDismiss,
      resolvedAvatar,
      setProfilePhotoAvatar,
      setPresetAvatar,
      setCustomAvatar,
      useDefaultSilhouette,
      resourceState,
      signalState,
      highlightOpportunityNodeId,
      guideShowsOpportunity,
      navigateToOpportunityNode,
      openOpportunityNode,
      saveOpportunity,
      dismissOpportunity,
      snoozeOpportunity,
      showGuideOpportunity,
      reportUserSupportLabel,
      uiChrome,
      setUiChrome,
      savedViewport,
      acknowledgeSignal,
      worldGrowthCue,
      dismissWorldGrowthCue,
      viewWorldGrowthCue,
    ],
  );

  return (
    <StarPathExperienceContext.Provider value={value}>{children}</StarPathExperienceContext.Provider>
  );
}

export function useStarPathExperience(): StarPathExperienceContextValue {
  const ctx = useContext(StarPathExperienceContext);
  if (!ctx) throw new Error('useStarPathExperience must be used within StarPathExperienceProvider');
  return ctx;
}

export { resolveProfilePhotoUri } from '@/identity/resolveProfilePhotoUri';

export function getDefaultProfilePhotoCandidate(): string | null {
  return null;
}

export { DEFAULT_CUSTOM_AVATAR };
