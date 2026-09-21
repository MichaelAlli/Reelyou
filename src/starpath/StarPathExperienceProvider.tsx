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

import { currentUser } from '@/data/mockData';
import { loadUserAvatarIdentity, saveUserAvatarIdentity } from '@/identity/userAvatarPersistence';
import {
  DEFAULT_CUSTOM_AVATAR,
  DEFAULT_USER_AVATAR_IDENTITY,
  type CustomAvatarConfig,
  type UserAvatarIdentity,
} from '@/identity/userAvatarTypes';
import {
  appendSignalDeduped,
  createSignal,
  deriveNodeUiState,
} from '@/starpath/starpathInteractionLogic';
import {
  loadStarPathInteractions,
  saveStarPathInteractions,
} from '@/starpath/starpathInteractionPersistence';
import type {
  StarPathInteractionSnapshot,
  StarPathInteractionType,
  StarPathNodeUiState,
} from '@/starpath/starpathInteractionTypes';
import { getStarPathNodeCatalogEntry } from '@/starpath/starpathNodeCatalog';
import { pickGuideReaction, pickNextStepSuggestion } from '@/starpath/starpathExperienceCopy';
import { reconcileLivingWorld } from '@/starpath/starpathDynamicWorldEngine';
import {
  loadStarPathDynamicWorld,
  saveStarPathDynamicWorld,
} from '@/starpath/starpathDynamicWorldPersistence';
import {
  EMPTY_DYNAMIC_WORLD,
  type StarPathDynamicWorldState,
  type StarPathOffscreenGrowthHint,
} from '@/starpath/starpathDynamicWorldTypes';
import { computeStarPathSiftingState } from '@/starpath/starpathSiftingEngine';
import type { RelevanceBand, StarPathSiftingState } from '@/starpath/starpathSiftingTypes';

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
}

const StarPathExperienceContext = createContext<StarPathExperienceContextValue | null>(null);

export function StarPathExperienceProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [interactions, setInteractions] = useState<StarPathInteractionSnapshot>({
    version: 1,
    signals: [],
    softHighlightNodeIds: [],
    activeBranchIds: [],
  });
  const [avatarIdentity, setAvatarIdentity] = useState<UserAvatarIdentity>(DEFAULT_USER_AVATAR_IDENTITY);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const siftingRef = useRef<StarPathSiftingState | null>(null);
  const [dynamicWorld, setDynamicWorld] = useState<StarPathDynamicWorldState>(EMPTY_DYNAMIC_WORLD);
  const [dynamicRecentlyEmergedIds, setDynamicRecentlyEmergedIds] = useState<string[]>([]);
  const [offscreenGrowthHints, setOffscreenGrowthHints] = useState<StarPathOffscreenGrowthHint[]>([]);
  const [growthGuideHint, setGrowthGuideHint] = useState<string | null>(null);
  const exploreTriggerRef = useRef<string | null>(null);
  const [explorePulse, setExplorePulse] = useState(0);
  const viewportRef = useRef({ scrollY: 0, viewportHeight: 852, contentBandHeight: 852, paddingTop: 0 });
  const dynamicSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [loadedInteractions, loadedAvatar, loadedDynamic] = await Promise.all([
        loadStarPathInteractions(),
        loadUserAvatarIdentity(),
        loadStarPathDynamicWorld(),
      ]);
      if (!mounted) return;
      setInteractions(loadedInteractions);
      setAvatarIdentity(loadedAvatar);
      setDynamicWorld(loadedDynamic);
      setReady(true);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const scheduleSave = useCallback((next: StarPathInteractionSnapshot, avatar: UserAvatarIdentity) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void saveStarPathInteractions(next);
      void saveUserAvatarIdentity(avatar);
    }, 280);
  }, []);

  const siftingState = useMemo(() => {
    const next = computeStarPathSiftingState(interactions.signals, {
      previousState: siftingRef.current,
    });
    siftingRef.current = next;
    return next;
  }, [interactions.signals]);

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
    },
    [],
  );

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
      setGrowthGuideHint(result.growthGuideHint);
      if (dynamicSaveTimer.current) clearTimeout(dynamicSaveTimer.current);
      dynamicSaveTimer.current = setTimeout(() => {
        void saveStarPathDynamicWorld(result.world);
      }, 320);
      return result.world;
    });
  }, [ready, interactions.signals, siftingState, explorePulse]);

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
        scheduleSave(next, avatarIdentity);
        if (type === 'explored') {
          exploreTriggerRef.current = nodeId;
          setExplorePulse((n) => n + 1);
        }
        return next;
      });
    },
    [avatarIdentity, scheduleSave],
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
        scheduleSave(next, avatarIdentity);
        return next;
      });
    },
    [avatarIdentity, scheduleSave],
  );

  const setProfilePhotoAvatar = useCallback(
    (uri?: string | null) => {
      setAvatarIdentity((prev) => {
        const next: UserAvatarIdentity = {
          ...prev,
          avatarSourceType: 'profilePhoto',
          profilePhotoUri: uri ?? null,
        };
        scheduleSave(interactions, next);
        return next;
      });
    },
    [interactions, scheduleSave],
  );

  const setPresetAvatar = useCallback(
    (presetId: string) => {
      setAvatarIdentity((prev) => {
        const next: UserAvatarIdentity = {
          ...prev,
          avatarSourceType: 'presetAvatar',
          avatarAssetId: presetId,
        };
        scheduleSave(interactions, next);
        return next;
      });
    },
    [interactions, scheduleSave],
  );

  const setCustomAvatar = useCallback(
    (config: CustomAvatarConfig) => {
      setAvatarIdentity((prev) => {
        const next: UserAvatarIdentity = {
          ...prev,
          avatarSourceType: 'customAvatar',
          customAvatarConfig: config,
        };
        scheduleSave(interactions, next);
        return next;
      });
    },
    [interactions, scheduleSave],
  );

  const useDefaultSilhouette = useCallback(() => {
    setAvatarIdentity((prev) => {
      const next: UserAvatarIdentity = { ...prev, avatarSourceType: 'defaultSilhouette' };
      scheduleSave(interactions, next);
      return next;
    });
  }, [interactions, scheduleSave]);

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
      guideReaction: pickGuideReaction(interactions, growthGuideHint),
      nextStepCopy: pickNextStepSuggestion(interactions, siftingState.nextStepHints),
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
    }),
    [
      ready,
      interactions,
      siftingState,
      growthGuideHint,
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

/** Profile photo fallback when user selects profile source without URI yet. */
export function resolveProfilePhotoUri(identity: UserAvatarIdentity): string | null {
  if (identity.profilePhotoUri) return identity.profilePhotoUri;
  return null;
}

export function getDefaultProfilePhotoCandidate(): string | null {
  return null;
}

export { DEFAULT_CUSTOM_AVATAR, currentUser };
