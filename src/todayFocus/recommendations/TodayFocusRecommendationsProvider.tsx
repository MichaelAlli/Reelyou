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

import { useReelyouConnect } from '@/connect/ReelyouConnectProvider';
import { currentUser } from '@/data/mockData';
import { isEmergingConstellationDemoEnabled } from '@/constants/devFlags';
import { useHumanPotentialMetrics } from '@/humanPotential/HumanPotentialMetricsProvider';
import { useOnboarding } from '@/onboarding';
import { useSkyAreaPreferences } from '@/skyAreas/SkyAreaPreferencesProvider';
import { useSavedThreads } from '@/skywrite/savedThreads/SavedThreadsProvider';
import { useSkywriteLibrary } from '@/skywrite/library/SkywriteLibraryProvider';
import { useSkywriteThreads } from '@/skywrite/threads/SkywriteThreadProvider';
import { buildFocusContext, buildTodayFocusSession } from '@/todayFocus/recommendations/buildFocusContext';
import { buildFocusRecommendations } from '@/todayFocus/recommendations/buildFocusRecommendations';
import { buildTodayFocusGuideResponse } from '@/todayFocus/recommendations/buildTodayFocusGuideResponse';
import type {
  FocusRecommendation,
  FocusRecommendationSession,
  TodayFocusGuideResponse,
} from '@/todayFocus/recommendations/focusRecommendationTypes';
import {
  findStableSession,
  fingerprintForFocusText,
  loadFocusRecommendationState,
  markRecommendationDismissed,
  markRecommendationOpened,
  persistedStateEquals,
  recommendationKey,
  saveFocusRecommendationState,
  upsertRecommendationSession,
  type FocusRecommendationPersistedState,
} from '@/todayFocus/recommendations/focusRecommendationStore';
import { registerTodayFocusChangeListener } from '@/todayFocus/recommendations/todayFocusChangeBridge';
import { inferSkyAreaIdsForFocus } from '@/todayFocus/recommendations/inferSkyAreaIdsForFocus';
import { canonicalSignalStore } from '@/signals/canonical/canonicalSignalStore';

interface RecommendationBundle {
  session: FocusRecommendationSession;
  recommendations: FocusRecommendation[];
}

interface TodayFocusRecommendationsContextValue {
  isLoaded: boolean;
  guideResponse: TodayFocusGuideResponse | null;
  session: FocusRecommendationSession | null;
  recommendations: FocusRecommendation[];
  refreshRecommendations: () => void;
  dismissRecommendation: (recommendationId: string) => void;
  markRecommendationOpened: (recommendationId: string) => void;
  setRecommendationFeedback: (
    recommendationId: string,
    feedback: 'helpful' | 'not_for_me',
  ) => void;
}

const TodayFocusRecommendationsContext =
  createContext<TodayFocusRecommendationsContextValue | null>(null);

function buildContextVersion(input: {
  savedThreadCount: number;
  evidenceCount: number;
  skyAreaKey: string;
  dismissedKey: string;
  signalTail: string;
}): string {
  return `${input.savedThreadCount}|${input.evidenceCount}|${input.skyAreaKey}|${input.dismissedKey}|${input.signalTail}`;
}

export function TodayFocusRecommendationsProvider({ children }: { children: ReactNode }) {
  const { todayFocus, personalizationProfile } = useOnboarding();
  const { selectedIds: selectedSkyAreaIds } = useSkyAreaPreferences();
  const { state: savedState, isLoaded: savedLoaded } = useSavedThreads();
  const { skywrites } = useOnboarding();
  const { contributions } = useSkywriteThreads();
  const { state: metricsState, isLoaded: metricsLoaded } = useHumanPotentialMetrics();
  const { messages, skyFollowGraph } = useReelyouConnect();
  const { lifecycle, isLoaded: libraryLoaded } = useSkywriteLibrary();

  const [persisted, setPersisted] = useState<FocusRecommendationPersistedState>({
    sessions: [],
    recommendations: [],
    dismissedKeys: [],
    openedKeys: [],
  });
  const [storeLoaded, setStoreLoaded] = useState(false);
  const [generationToken, setGenerationToken] = useState(0);
  const [bundle, setBundle] = useState<RecommendationBundle | null>(null);
  const lastGenerationKeyRef = useRef<string | null>(null);
  const persistedRef = useRef(persisted);
  persistedRef.current = persisted;

  useEffect(() => {
    let mounted = true;
    void loadFocusRecommendationState().then((loaded) => {
      if (!mounted) return;
      setPersisted(loaded);
      setStoreLoaded(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const deletedSkywriteIds = useMemo(() => {
    const ids: string[] = [];
    for (const sw of skywrites) {
      if (lifecycle?.isContentDeleted(sw.id)) ids.push(sw.id);
    }
    return ids.join(',');
  }, [lifecycle, skywrites]);

  const focusSession = useMemo(() => {
    const relatedSkyAreaIds = inferSkyAreaIdsForFocus(
      todayFocus.value ?? '',
      selectedSkyAreaIds,
    );
    return buildTodayFocusSession({
      userId: currentUser.id,
      record: todayFocus,
      relatedSkyAreaIds,
    });
  }, [
    selectedSkyAreaIds.join(','),
    todayFocus.dateKey,
    todayFocus.source,
    todayFocus.value,
  ]);

  const focusFingerprint = focusSession ? fingerprintForFocusText(focusSession.text) : '';

  const contextVersion = useMemo(
    () =>
      buildContextVersion({
        savedThreadCount: savedState.savedThreads.length,
        evidenceCount: metricsState.evidence.length,
        skyAreaKey: selectedSkyAreaIds.join(','),
        dismissedKey: persisted.dismissedKeys.join(','),
        signalTail: String(canonicalSignalStore.getState().events.length),
      }),
    [
      metricsState.evidence.length,
      persisted.dismissedKeys.join(','),
      savedState.savedThreads.length,
      selectedSkyAreaIds.join(','),
    ],
  );

  const generationKey = focusSession
    ? `${focusSession.id}|${focusFingerprint}|${generationToken}|${contextVersion}`
    : 'none';

  useEffect(() => {
    registerTodayFocusChangeListener(() => {
      setGenerationToken((value) => value + 1);
    });
    return () => registerTodayFocusChangeListener(null);
  }, []);

  useEffect(() => {
    if (!storeLoaded || !savedLoaded || !metricsLoaded || !libraryLoaded) return;
    if (!focusSession) {
      setBundle(null);
      return;
    }
    if (lastGenerationKeyRef.current === generationKey) {
      return;
    }

    const storeSnapshot = persistedRef.current;
    const stable = findStableSession(
      storeSnapshot,
      focusSession.id,
      focusFingerprint,
      generationToken,
    );
    if (stable) {
      const recommendations = storeSnapshot.recommendations.filter((rec) =>
        stable.recommendationIds.includes(rec.id),
      );
      setBundle({ session: stable, recommendations });
      lastGenerationKeyRef.current = generationKey;
      return;
    }

    const signalProvenanceIds = canonicalSignalStore
      .getState()
      .events.filter((event) => event.userId === currentUser.id)
      .slice(-6)
      .map((event) => event.id);

    const context = buildFocusContext({
      session: focusSession,
      profile: personalizationProfile,
      savedThreads: savedState.savedThreads.filter((thread) => thread.status === 'active'),
      evidence: metricsState.evidence,
      followGraph: skyFollowGraph,
      blockedUserIds: messages.blockedUserIds,
      selectedSkyAreaIds,
      signalProvenanceIds,
    });

    const deletedIds = deletedSkywriteIds.length > 0 ? deletedSkywriteIds.split(',') : [];

    let recommendations: FocusRecommendation[] = [];
    try {
      recommendations = buildFocusRecommendations({
        session: focusSession,
        context,
        eligibility: {
          viewerUserId: currentUser.id,
          blockedUserIds: messages.blockedUserIds,
          followGraph: skyFollowGraph,
          deletedSkywriteIds: deletedIds,
        },
        savedThreads: savedState.savedThreads,
        skywrites,
        evidence: metricsState.evidence,
        contributions,
        dismissedRecommendationKeys: storeSnapshot.dismissedKeys,
        previouslyOpenedKeys: storeSnapshot.openedKeys,
        northStarText: personalizationProfile.northStar.originalVision,
        focusReflectionText: todayFocus.reflection,
        emergingConstellationAvailable: isEmergingConstellationDemoEnabled(),
      });
    } catch {
      recommendations = [];
    }

    const session: FocusRecommendationSession = {
      id: `frs-${focusSession.id}-${focusFingerprint.slice(0, 16)}`,
      focusId: focusSession.id,
      userId: currentUser.id,
      generatedAt: Date.now(),
      recommendationIds: recommendations.map((rec) => rec.id),
      contextSnapshotId: context.contextId,
      status: generationToken > 0 ? 'refreshed' : 'active',
      focusTextFingerprint: focusFingerprint,
      generationToken,
      contextVersion,
    };

    const nextPersisted = upsertRecommendationSession(storeSnapshot, session, recommendations);
    if (!persistedStateEquals(storeSnapshot, nextPersisted)) {
      setPersisted(nextPersisted);
      void saveFocusRecommendationState(nextPersisted);
    }

    setBundle({ session, recommendations });
    lastGenerationKeyRef.current = generationKey;
  }, [
    contributions,
    contextVersion,
    deletedSkywriteIds,
    focusFingerprint,
    focusSession,
    generationKey,
    generationToken,
    libraryLoaded,
    messages.blockedUserIds,
    metricsLoaded,
    metricsState.evidence,
    personalizationProfile,
    savedLoaded,
    savedState.savedThreads,
    selectedSkyAreaIds,
    skyFollowGraph,
    skywrites,
    storeLoaded,
    todayFocus.reflection,
  ]);

  const guideResponse = useMemo(() => {
    if (!focusSession || !bundle) return null;
    return buildTodayFocusGuideResponse({
      session: focusSession,
      recommendations: bundle.recommendations,
      aiAssisted: true,
    });
  }, [bundle, focusSession]);

  const dismissRecommendation = useCallback(
    (recommendationId: string) => {
      const rec = persisted.recommendations.find((entry) => entry.id === recommendationId);
      if (!rec) return;
      const next = markRecommendationDismissed(persisted, rec);
      setPersisted(next);
      void saveFocusRecommendationState(next);
      setGenerationToken((value) => value + 1);
    },
    [persisted],
  );

  const markOpened = useCallback(
    (recommendationId: string) => {
      const rec = persisted.recommendations.find((entry) => entry.id === recommendationId);
      if (!rec) return;
      const next = markRecommendationOpened(persisted, rec);
      if (!persistedStateEquals(persisted, next)) {
        setPersisted(next);
        void saveFocusRecommendationState(next);
      }
    },
    [persisted],
  );

  const setRecommendationFeedback = useCallback(
    (recommendationId: string, feedback: 'helpful' | 'not_for_me') => {
      setPersisted((current) => {
        const next = {
          ...current,
          recommendations: current.recommendations.map((entry) =>
            entry.id === recommendationId ? { ...entry, feedback } : entry,
          ),
        };
        if (feedback === 'not_for_me') {
          const rec = next.recommendations.find((entry) => entry.id === recommendationId);
          if (rec) {
            const key = recommendationKey(rec);
            if (!next.dismissedKeys.includes(key)) {
              next.dismissedKeys = [...next.dismissedKeys, key];
            }
          }
        }
        void saveFocusRecommendationState(next);
        return next;
      });
      if (feedback === 'not_for_me') {
        setGenerationToken((value) => value + 1);
      }
    },
    [],
  );

  const refreshRecommendations = useCallback(() => {
    lastGenerationKeyRef.current = null;
    setGenerationToken((value) => value + 1);
  }, []);

  const isLoaded = storeLoaded && savedLoaded && metricsLoaded && libraryLoaded;

  const value = useMemo<TodayFocusRecommendationsContextValue>(
    () => ({
      isLoaded,
      guideResponse,
      session: bundle?.session ?? null,
      recommendations: bundle?.recommendations ?? [],
      refreshRecommendations,
      dismissRecommendation,
      markRecommendationOpened: markOpened,
      setRecommendationFeedback,
    }),
    [
      bundle,
      dismissRecommendation,
      guideResponse,
      isLoaded,
      markOpened,
      refreshRecommendations,
      setRecommendationFeedback,
    ],
  );

  return (
    <TodayFocusRecommendationsContext.Provider value={value}>
      {children}
    </TodayFocusRecommendationsContext.Provider>
  );
}

export function useTodayFocusRecommendations(): TodayFocusRecommendationsContextValue {
  const ctx = useContext(TodayFocusRecommendationsContext);
  if (!ctx) {
    throw new Error('useTodayFocusRecommendations requires TodayFocusRecommendationsProvider');
  }
  return ctx;
}
