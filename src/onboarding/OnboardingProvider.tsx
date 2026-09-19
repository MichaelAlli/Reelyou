import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  EMPTY_ONBOARDING_STATE,
  toLegacyProfileData,
  type OnboardingState,
  type OnboardingStepId,
  type OnboardingStepStatus,
} from '@/onboarding/onboardingState';
import {
  buildAiCompanionContext,
  buildHumanPotentialProfile,
  buildTodayFocusSuggestions,
  EMPTY_COMMUNITIES,
  EMPTY_TODAY_FOCUS,
  getLocalDateKey,
  loadCommunities,
  loadTodayFocus,
  mergePersonalizationProfile,
  reconcileTodayFocusForToday,
  saveCommunities,
  saveTodayFocus,
  type AiCompanionContext,
  type CommunitiesRecord,
  type CommunityId,
  type HumanPotentialProfile,
  type TodayFocusRecord,
  type TodayFocusSource,
  type UserPersonalizationProfile,
} from '@/onboarding/personalization';
import { MAX_NORTH_STAR_VISION_LENGTH } from '@/onboarding/northStar';
import {
  buildGuidingLightView,
  EMPTY_GUIDING_LIGHT_DISMISS,
  loadGuidingLightDismiss,
  saveGuidingLightDismiss,
  type GuidingLightDismissRecord,
  type GuidingLightHomeView,
} from '@/guidingLight';
import {
  buildMySkyView,
  DEFAULT_MY_SKY_VISIBLE_LAYERS,
  resolveParticipatingCommunityIds,
  resolveSkyConnectionActivities,
  type MySkyLayerId,
  type MySkyView,
  type MySkyVisibleLayers,
} from '@/mySky';
import {
  DEFAULT_MY_SKY_VIEWPORT,
  type MySkyViewportSnapshot,
} from '@/mySky/mySkyViewportSession';
import {
  DEFAULT_SKY_VISIBILITY_SETTINGS,
  type SkyVisibilitySettings,
} from '@/mySky/skyVisibilitySettings';
import {
  loadSkyVisibilitySettings,
  saveSkyVisibilitySettings,
} from '@/mySky/skyVisibilityPersistence';
import { buildSkyNodeId, type SkyArrivalHandoff } from '@/mySky/skyArrival';
import {
  createEvolutionEntry,
  EMPTY_SKY_EVOLUTION,
  type SkyEvolutionRecord,
} from '@/mySky/skyEvolution';
import {
  appendEvolutionEntryLocal,
  loadSkyEvolution,
  saveSkyEvolution,
} from '@/mySky/skyEvolutionPersistence';
import {
  buildSkywriteRecord,
  EMPTY_SKYWRITES,
  loadSkywrites,
  saveSkywrites,
  type SkywriteDraft,
  type SkywriteRecord,
  type SkywritesState,
} from '@/skywrite';
import {
  buildAroundYourSkyHomeFeed,
  toAroundYourSkyState,
  type AroundYourSkyHomeFeed,
} from '@/social/aroundYourSky';
import {
  MAX_ONBOARDING_CHALLENGES,
  MAX_ONBOARDING_GOALS,
  MAX_ONBOARDING_INTERESTS,
  type OnboardingChallengeId,
  type OnboardingGoalId,
  type OnboardingInterestId,
  type OnboardingProfileData,
} from '@/onboarding/types';

interface OnboardingContextValue {
  /** Unified onboarding state — single source of truth for all screens */
  state: OnboardingState;
  /** Normalized User Personalization Profile (derived, backend-ready) */
  personalizationProfile: UserPersonalizationProfile;
  /** AI Context Builder output — future AI Companion reads ONLY from personalizationProfile */
  aiContext: AiCompanionContext;
  /** Human Potential Profile — Starpath-ready aggregate including NorthStar.originalVision */
  humanPotentialProfile: HumanPotentialProfile;
  /** @deprecated Use state.interests — kept for Screen 1 compatibility */
  profile: OnboardingProfileData;
  /** @deprecated Use state.goals */
  goals: OnboardingGoalId[];
  /** Screen 3 challenges */
  challenges: OnboardingChallengeId[];
  /** Screen 4 North Star — verbatim vision text */
  northStar: OnboardingState['northStar'];
  setInterests: (interests: OnboardingInterestId[]) => void;
  toggleInterest: (interestId: OnboardingInterestId) => void;
  isInterestSelected: (interestId: OnboardingInterestId) => boolean;
  canSelectMoreInterests: boolean;
  setGoals: (goals: OnboardingGoalId[]) => void;
  toggleGoal: (goalId: OnboardingGoalId) => void;
  isGoalSelected: (goalId: OnboardingGoalId) => boolean;
  canSelectMoreGoals: boolean;
  setChallenges: (challenges: OnboardingChallengeId[]) => void;
  toggleChallenge: (challengeId: OnboardingChallengeId) => void;
  isChallengeSelected: (challengeId: OnboardingChallengeId) => boolean;
  canSelectMoreChallenges: boolean;
  setNorthStarVision: (vision: string) => void;
  markStep: (step: OnboardingStepId, status: OnboardingStepStatus) => void;
  setAiPersonalizationEnabled: (enabled: boolean) => void;
  /** Restart onboarding — clears all answers and step progress */
  resetOnboarding: () => void;
  /** @deprecated Alias for resetOnboarding */
  resetProfile: () => void;
  /** Clear personalization data while preserving AI toggle preference */
  clearPersonalizationData: () => void;
  /** Mark onboarding flow complete (Process Screen) — preserves all collected data */
  completeOnboarding: () => void;
  /** Active daily intention record (local-first, AI-ready) */
  todayFocus: TodayFocusRecord;
  /** Calm suggestions derived from onboarding profile — user can override */
  todayFocusSuggestions: string[];
  /** Selected intention for Home — null until user chooses one today */
  todayFocusDisplayPrompt: string | null;
  /** Whether the user has chosen a focus for today */
  hasTodayFocus: boolean;
  /** Whether a reflection is saved for the current focus today */
  hasTodayFocusReflection: boolean;
  setTodayFocus: (value: string, source: TodayFocusSource) => void;
  setTodayFocusReflection: (reflection: string) => void;
  clearTodayFocus: () => void;
  /** Local-first community membership — explicit join/leave only */
  communities: CommunitiesRecord;
  isCommunityJoined: (communityId: CommunityId) => boolean;
  joinCommunity: (communityId: CommunityId, name: string) => void;
  leaveCommunity: (communityId: CommunityId) => void;
  /** Finite Home social activity — derived from relevance, not engagement scoring */
  aroundYourSkyFeed: AroundYourSkyHomeFeed;
  /** Full My Sky view — North Star, stars, personal constellations */
  mySkyView: MySkyView;
  /** Session-persisted My Sky layer visibility — defaults to calm star-only. */
  mySkyVisibleLayers: MySkyVisibleLayers;
  toggleMySkyLayer: (layer: MySkyLayerId) => void;
  setMySkyLayerVisible: (layer: MySkyLayerId, visible: boolean) => void;
  resetMySkyLayers: () => void;
  /** Temporary constellation line reveal — animates in then fades out. */
  triggerConstellationReveal: (patternId?: string | null) => void;
  constellationRevealCount: number;
  constellationRevealActive: boolean;
  constellationRevealPatternId: string | null;
  completeConstellationReveal: () => void;
  /** Home StarPath Guiding Light — one calm possibility or peace state */
  guidingLightView: GuidingLightHomeView;
  /** Dismiss the active Guiding Light — user choice is authoritative */
  dismissGuidingLight: () => void;
  /** User-authored Skywrites — local-first, explicit hashtags parsed from text */
  skywrites: SkywriteRecord[];
  createSkywrite: (draft: SkywriteDraft) => SkywriteRecord;
  /** Transient handoff for Skywrite → My Sky animation and arrival. */
  skyArrivalHandoff: SkyArrivalHandoff | null;
  setSkyArrivalHandoff: (handoff: SkyArrivalHandoff) => void;
  clearSkyArrivalHandoff: () => void;
  /** Session pan/zoom for My Sky — preserved across UI toggles. */
  mySkyViewport: MySkyViewportSnapshot;
  setMySkyViewport: (snapshot: MySkyViewportSnapshot) => void;
  /** Optional wider-universe public skies in My Sky exploration. */
  mySkyExploreEnabled: boolean;
  setMySkyExploreEnabled: (enabled: boolean) => void;
  /** Owner visibility preferences — local-first, immediately reflected in Public Sky. */
  mySkyVisibilitySettings: SkyVisibilitySettings;
  setMySkyVisibilitySettings: (settings: SkyVisibilitySettings) => void;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OnboardingState>(EMPTY_ONBOARDING_STATE);
  const [todayFocus, setTodayFocusState] = useState<TodayFocusRecord>(() =>
    reconcileTodayFocusForToday({ ...EMPTY_TODAY_FOCUS, dateKey: getLocalDateKey() }),
  );
  const [communities, setCommunitiesState] = useState<CommunitiesRecord>(EMPTY_COMMUNITIES);
  const [guidingLightDismiss, setGuidingLightDismissState] =
    useState<GuidingLightDismissRecord>(EMPTY_GUIDING_LIGHT_DISMISS);
  const [skywritesState, setSkywritesState] = useState<SkywritesState>(EMPTY_SKYWRITES);
  const [skyArrivalHandoff, setSkyArrivalHandoffState] = useState<SkyArrivalHandoff | null>(null);
  const [mySkyVisibleLayers, setMySkyVisibleLayers] = useState<MySkyVisibleLayers>(
    () => ({ ...DEFAULT_MY_SKY_VISIBLE_LAYERS }),
  );
  const [constellationRevealCount, setConstellationRevealCount] = useState(0);
  const [constellationRevealActive, setConstellationRevealActive] = useState(false);
  const [constellationRevealPatternId, setConstellationRevealPatternId] = useState<string | null>(
    null,
  );
  const [mySkyViewport, setMySkyViewportState] = useState<MySkyViewportSnapshot>(() => ({
    ...DEFAULT_MY_SKY_VIEWPORT,
  }));
  const [mySkyExploreEnabled, setMySkyExploreEnabledState] = useState(false);
  const [mySkyVisibilitySettings, setMySkyVisibilitySettingsState] =
    useState<SkyVisibilitySettings>(() => ({
      ...DEFAULT_SKY_VISIBILITY_SETTINGS,
      contentOverrides: {},
    }));
  const [skyEvolution, setSkyEvolution] = useState<SkyEvolutionRecord>(EMPTY_SKY_EVOLUTION);

  const setMySkyViewport = useCallback((snapshot: MySkyViewportSnapshot) => {
    setMySkyViewportState(snapshot);
  }, []);

  const setMySkyExploreEnabled = useCallback((enabled: boolean) => {
    setMySkyExploreEnabledState(enabled);
  }, []);

  const setMySkyVisibilitySettings = useCallback((settings: SkyVisibilitySettings) => {
    setMySkyVisibilitySettingsState(settings);
    void saveSkyVisibilitySettings(settings);
  }, []);

  useEffect(() => {
    let live = true;
    loadTodayFocus().then((record) => {
      if (live) {
        setTodayFocusState(record);
      }
    });
    loadCommunities().then((record) => {
      if (live) {
        setCommunitiesState(record);
      }
    });
    loadGuidingLightDismiss().then((record) => {
      if (live) {
        setGuidingLightDismissState(record);
      }
    });
    loadSkywrites().then((record) => {
      if (live) {
        setSkywritesState(record);
      }
    });
    loadSkyEvolution().then((record) => {
      if (live) {
        setSkyEvolution(record);
      }
    });
    loadSkyVisibilitySettings().then((record) => {
      if (live) {
        setMySkyVisibilitySettingsState(record);
      }
    });
    return () => {
      live = false;
    };
  }, []);

  const recordSkyEvolution = useCallback(
    (entry: ReturnType<typeof createEvolutionEntry>) => {
      setSkyEvolution((current) => {
        const next = appendEvolutionEntryLocal(current, entry);
        void saveSkyEvolution(next);
        return next;
      });
    },
    [],
  );

  const aroundYourSkyFeed = useMemo(
    () => buildAroundYourSkyHomeFeed(communities),
    [communities],
  );

  const aroundYourSkyState = useMemo(
    () => toAroundYourSkyState(aroundYourSkyFeed),
    [aroundYourSkyFeed],
  );

  const skyConnectionActivities = useMemo(
    () => resolveSkyConnectionActivities(aroundYourSkyFeed),
    [aroundYourSkyFeed],
  );

  const participatingCommunityIds = useMemo(
    () => resolveParticipatingCommunityIds(aroundYourSkyFeed),
    [aroundYourSkyFeed],
  );

  const basePersonalizationProfile = useMemo(
    () => mergePersonalizationProfile(state, todayFocus, communities, aroundYourSkyState),
    [state, todayFocus, communities, aroundYourSkyState],
  );

  const guidingLightView = useMemo(
    () => buildGuidingLightView(basePersonalizationProfile, guidingLightDismiss),
    [basePersonalizationProfile, guidingLightDismiss],
  );

  const mySkyView = useMemo(
    () =>
      buildMySkyView(
        {
          ...basePersonalizationProfile,
          skywrites: skywritesState.posts,
          guidingLight: guidingLightView.light,
        },
        mySkyVisibleLayers,
        skyEvolution,
        skyConnectionActivities,
        participatingCommunityIds,
        mySkyVisibilitySettings,
      ),
    [
      basePersonalizationProfile,
      skywritesState.posts,
      guidingLightView.light,
      mySkyVisibleLayers,
      skyEvolution,
      skyConnectionActivities,
      participatingCommunityIds,
      mySkyVisibilitySettings,
    ],
  );

  const personalizationProfile = useMemo(
    () => ({
      ...basePersonalizationProfile,
      mySky: {
        northStar: mySkyView.northStar,
        skyItems: mySkyView.skyItems,
        constellations: mySkyView.constellations,
        connections: mySkyView.connections,
        contributions: mySkyView.contributions,
      },
      guidingLight: guidingLightView.light,
      skywrites: skywritesState.posts,
    }),
    [basePersonalizationProfile, mySkyView, guidingLightView, skywritesState.posts],
  );
  const humanPotentialProfile = useMemo(() => buildHumanPotentialProfile(state), [state]);
  const aiContext = useMemo(
    () => buildAiCompanionContext(personalizationProfile),
    [personalizationProfile],
  );

  const todayFocusSuggestions = useMemo(
    () => buildTodayFocusSuggestions(personalizationProfile),
    [personalizationProfile],
  );

  const hasTodayFocus = Boolean(todayFocus.value && todayFocus.source);
  const hasTodayFocusReflection = Boolean(todayFocus.reflection?.trim());

  const profile = useMemo(() => toLegacyProfileData(state), [state.interests]);
  const goals = state.goals;
  const challenges = state.challenges;
  const northStar = state.northStar;

  const setInterests = useCallback((interests: OnboardingInterestId[]) => {
    setState((current) => ({
      ...current,
      interests: interests.slice(0, MAX_ONBOARDING_INTERESTS),
    }));
  }, []);

  const toggleInterest = useCallback((interestId: OnboardingInterestId) => {
    setState((current) => {
      const selected = current.interests.includes(interestId);
      if (selected) {
        return { ...current, interests: current.interests.filter((id) => id !== interestId) };
      }
      if (current.interests.length >= MAX_ONBOARDING_INTERESTS) {
        return current;
      }
      return { ...current, interests: [...current.interests, interestId] };
    });
  }, []);

  const isInterestSelected = useCallback(
    (interestId: OnboardingInterestId) => state.interests.includes(interestId),
    [state.interests],
  );

  const canSelectMoreInterests = state.interests.length < MAX_ONBOARDING_INTERESTS;

  const setGoals = useCallback((nextGoals: OnboardingGoalId[]) => {
    setState((current) => ({
      ...current,
      goals: nextGoals.slice(0, MAX_ONBOARDING_GOALS),
    }));
  }, []);

  const toggleGoal = useCallback((goalId: OnboardingGoalId) => {
    setState((current) => {
      const selected = current.goals.includes(goalId);
      if (selected) {
        return { ...current, goals: current.goals.filter((id) => id !== goalId) };
      }
      if (current.goals.length >= MAX_ONBOARDING_GOALS) {
        return current;
      }
      return { ...current, goals: [...current.goals, goalId] };
    });
  }, []);

  const isGoalSelected = useCallback(
    (goalId: OnboardingGoalId) => state.goals.includes(goalId),
    [state.goals],
  );

  const canSelectMoreGoals = state.goals.length < MAX_ONBOARDING_GOALS;

  const setChallenges = useCallback((nextChallenges: OnboardingChallengeId[]) => {
    setState((current) => ({
      ...current,
      challenges: nextChallenges.slice(0, MAX_ONBOARDING_CHALLENGES),
    }));
  }, []);

  const toggleChallenge = useCallback((challengeId: OnboardingChallengeId) => {
    setState((current) => {
      const selected = current.challenges.includes(challengeId);
      if (selected) {
        return {
          ...current,
          challenges: current.challenges.filter((id) => id !== challengeId),
        };
      }
      if (current.challenges.length >= MAX_ONBOARDING_CHALLENGES) {
        return current;
      }
      return { ...current, challenges: [...current.challenges, challengeId] };
    });
  }, []);

  const isChallengeSelected = useCallback(
    (challengeId: OnboardingChallengeId) => state.challenges.includes(challengeId),
    [state.challenges],
  );

  const canSelectMoreChallenges = state.challenges.length < MAX_ONBOARDING_CHALLENGES;

  const setNorthStarVision = useCallback((vision: string) => {
    setState((current) => ({
      ...current,
      northStar: { originalVision: vision.slice(0, MAX_NORTH_STAR_VISION_LENGTH) },
    }));
  }, []);

  const markStep = useCallback((step: OnboardingStepId, status: OnboardingStepStatus) => {
    setState((current) => ({
      ...current,
      steps: { ...current.steps, [step]: status },
    }));
  }, []);

  const setAiPersonalizationEnabled = useCallback((enabled: boolean) => {
    setState((current) => ({ ...current, aiPersonalizationEnabled: enabled }));
  }, []);

  const resetOnboarding = useCallback(() => {
    setState(EMPTY_ONBOARDING_STATE);
  }, []);

  const clearPersonalizationData = useCallback(() => {
    setState((current) => ({
      ...EMPTY_ONBOARDING_STATE,
      aiPersonalizationEnabled: current.aiPersonalizationEnabled,
    }));
  }, []);

  const completeOnboarding = useCallback(() => {
    setState((current) => ({
      ...current,
      isOnboardingComplete: true,
    }));
  }, []);

  const setTodayFocus = useCallback((value: string, source: TodayFocusSource) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setTodayFocusState((current) => {
      const focusChanged = current.value !== trimmed;
      const next: TodayFocusRecord = {
        value: trimmed,
        source,
        dateKey: getLocalDateKey(),
        selectedAt: new Date().toISOString(),
        reflection: focusChanged ? null : current.reflection,
        reflectionUpdatedAt: focusChanged ? null : current.reflectionUpdatedAt,
      };
      void saveTodayFocus(next);
      recordSkyEvolution(
        createEvolutionEntry('FOCUS_SELECTED', {
          summary: 'Today’s Focus was chosen.',
        }),
      );
      return next;
    });
  }, [recordSkyEvolution]);

  const setTodayFocusReflection = useCallback((reflection: string) => {
    const trimmed = reflection.trim();
    if (!trimmed) return;
    setTodayFocusState((current) => {
      const next: TodayFocusRecord = {
        ...current,
        dateKey: current.dateKey ?? getLocalDateKey(),
        reflection: trimmed,
        reflectionUpdatedAt: new Date().toISOString(),
      };
      void saveTodayFocus(next);
      const dateKey = next.dateKey ?? getLocalDateKey();
      recordSkyEvolution(
        createEvolutionEntry('REFLECTION_ADDED', {
          nodeId: `focus-reflection-${dateKey}`,
          summary: 'A Today’s Focus reflection joined your sky.',
        }),
      );
      return next;
    });
  }, [recordSkyEvolution]);

  const clearTodayFocus = useCallback(() => {
    const next = reconcileTodayFocusForToday({
      ...EMPTY_TODAY_FOCUS,
      dateKey: getLocalDateKey(),
    });
    setTodayFocusState(next);
    void saveTodayFocus(next);
  }, []);

  const todayFocusDisplayPrompt = useMemo(() => {
    if (todayFocus.value) return todayFocus.value;
    return null;
  }, [todayFocus.value]);

  const isCommunityJoined = useCallback(
    (communityId: CommunityId) => communities.joined.some((entry) => entry.id === communityId),
    [communities.joined],
  );

  const joinCommunity = useCallback((communityId: CommunityId, name: string) => {
    setCommunitiesState((current) => {
      if (current.joined.some((entry) => entry.id === communityId)) {
        return current;
      }
      const next: CommunitiesRecord = {
        joined: [
          ...current.joined,
          { id: communityId, name: name.trim(), joinedAt: new Date().toISOString() },
        ],
        explicitInterests: current.explicitInterests.includes(communityId)
          ? current.explicitInterests
          : [...current.explicitInterests, communityId],
      };
      void saveCommunities(next);
      recordSkyEvolution(
        createEvolutionEntry('COMMUNITY_JOINED', {
          nodeId: `community-${communityId}`,
          summary: 'A community joined your sky.',
        }),
      );
      return next;
    });
  }, [recordSkyEvolution]);

  const leaveCommunity = useCallback((communityId: CommunityId) => {
    setCommunitiesState((current) => {
      const next: CommunitiesRecord = {
        joined: current.joined.filter((entry) => entry.id !== communityId),
        explicitInterests: current.explicitInterests.filter((id) => id !== communityId),
      };
      void saveCommunities(next);
      recordSkyEvolution(
        createEvolutionEntry('COMMUNITY_LEFT', {
          summary: 'A community left your sky.',
        }),
      );
      return next;
    });
  }, [recordSkyEvolution]);

  const dismissGuidingLight = useCallback(() => {
    const activeId = guidingLightView.light?.id;
    if (!activeId) return;
    const next: GuidingLightDismissRecord = {
      dismissedLightId: activeId,
      dismissedAt: new Date().toISOString(),
    };
    setGuidingLightDismissState(next);
    void saveGuidingLightDismiss(next);
  }, [guidingLightView.light?.id]);

  const createSkywrite = useCallback((draft: SkywriteDraft): SkywriteRecord => {
    const record = buildSkywriteRecord(
      draft,
      `skywrite-${Date.now()}`,
      new Date().toISOString(),
    );
    setSkywritesState((current) => {
      const next: SkywritesState = { posts: [record, ...current.posts] };
      void saveSkywrites(next);
      return next;
    });
    recordSkyEvolution(
      createEvolutionEntry('SKYWRITE_CREATED', {
        nodeId: buildSkyNodeId(record.id),
        summary: 'A new Skywrite became a star in your sky.',
      }),
    );
    return record;
  }, [recordSkyEvolution]);

  const setSkyArrivalHandoff = useCallback((handoff: SkyArrivalHandoff) => {
    setSkyArrivalHandoffState(handoff);
  }, []);

  const clearSkyArrivalHandoff = useCallback(() => {
    setSkyArrivalHandoffState(null);
  }, []);

  const toggleMySkyLayer = useCallback((layer: MySkyLayerId) => {
    setMySkyVisibleLayers((current) => ({
      ...current,
      [layer]: !current[layer],
    }));
  }, []);

  const setMySkyLayerVisible = useCallback((layer: MySkyLayerId, visible: boolean) => {
    setMySkyVisibleLayers((current) => ({
      ...current,
      [layer]: visible,
    }));
  }, []);

  const resetMySkyLayers = useCallback(() => {
    setMySkyVisibleLayers({ ...DEFAULT_MY_SKY_VISIBLE_LAYERS });
  }, []);

  const triggerConstellationReveal = useCallback((patternId: string | null = null) => {
    setConstellationRevealPatternId(patternId);
    setConstellationRevealCount((count) => count + 1);
    setConstellationRevealActive(true);
  }, []);

  const completeConstellationReveal = useCallback(() => {
    setConstellationRevealActive(false);
    setConstellationRevealPatternId(null);
  }, []);

  const value = useMemo(
    () => ({
      state,
      personalizationProfile,
      humanPotentialProfile,
      aiContext,
      todayFocus,
      todayFocusSuggestions,
      todayFocusDisplayPrompt,
      hasTodayFocus,
      hasTodayFocusReflection,
      setTodayFocus,
      setTodayFocusReflection,
      clearTodayFocus,
      communities,
      isCommunityJoined,
      joinCommunity,
      leaveCommunity,
      aroundYourSkyFeed,
      mySkyView,
      mySkyVisibleLayers,
      toggleMySkyLayer,
      setMySkyLayerVisible,
      resetMySkyLayers,
      triggerConstellationReveal,
      constellationRevealCount,
      constellationRevealActive,
      constellationRevealPatternId,
      completeConstellationReveal,
      guidingLightView,
      dismissGuidingLight,
      skywrites: skywritesState.posts,
      createSkywrite,
      skyArrivalHandoff,
      setSkyArrivalHandoff,
      clearSkyArrivalHandoff,
      mySkyViewport,
      setMySkyViewport,
      mySkyExploreEnabled,
      setMySkyExploreEnabled,
      mySkyVisibilitySettings,
      setMySkyVisibilitySettings,
      profile,
      goals,
      challenges,
      northStar,
      setInterests,
      toggleInterest,
      isInterestSelected,
      canSelectMoreInterests,
      setGoals,
      toggleGoal,
      isGoalSelected,
      canSelectMoreGoals,
      setChallenges,
      toggleChallenge,
      isChallengeSelected,
      canSelectMoreChallenges,
      setNorthStarVision,
      markStep,
      setAiPersonalizationEnabled,
      resetOnboarding,
      resetProfile: resetOnboarding,
      clearPersonalizationData,
      completeOnboarding,
    }),
    [
      state,
      personalizationProfile,
      humanPotentialProfile,
      aiContext,
      todayFocus,
      todayFocusSuggestions,
      todayFocusDisplayPrompt,
      hasTodayFocus,
      hasTodayFocusReflection,
      setTodayFocus,
      setTodayFocusReflection,
      clearTodayFocus,
      communities,
      isCommunityJoined,
      joinCommunity,
      leaveCommunity,
      aroundYourSkyFeed,
      mySkyView,
      mySkyVisibleLayers,
      toggleMySkyLayer,
      setMySkyLayerVisible,
      resetMySkyLayers,
      triggerConstellationReveal,
      constellationRevealCount,
      constellationRevealActive,
      constellationRevealPatternId,
      completeConstellationReveal,
      guidingLightView,
      dismissGuidingLight,
      skywritesState.posts,
      createSkywrite,
      skyArrivalHandoff,
      setSkyArrivalHandoff,
      clearSkyArrivalHandoff,
      mySkyViewport,
      setMySkyViewport,
      mySkyExploreEnabled,
      setMySkyExploreEnabled,
      mySkyVisibilitySettings,
      setMySkyVisibilitySettings,
      profile,
      goals,
      challenges,
      northStar,
      setInterests,
      toggleInterest,
      isInterestSelected,
      canSelectMoreInterests,
      setGoals,
      toggleGoal,
      isGoalSelected,
      canSelectMoreGoals,
      setChallenges,
      toggleChallenge,
      isChallengeSelected,
      canSelectMoreChallenges,
      setNorthStarVision,
      markStep,
      setAiPersonalizationEnabled,
      resetOnboarding,
      clearPersonalizationData,
      completeOnboarding,
    ],
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
}
