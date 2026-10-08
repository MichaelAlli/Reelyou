import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useGlobalSearchParams } from 'expo-router';
import { AppState } from 'react-native';

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
import { notifyTodayFocusChanged } from '@/todayFocus/recommendations/todayFocusChangeBridge';
import {
  clearTodayFocusDismiss,
  hydrateTodayFocusDismissState,
  reconcileTodayFocusDismissForDate,
} from '@/todayFocus/todayFocusSession';
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
import { buildArrivalStarsSnapshot } from '@/mySky/buildArrivalStarsSnapshot';
import { resolveCurrentSkyOwnerProfile } from '@/mySky/skyIdentity';
import { resolveMySkySources } from '@/mySky/mySkyState';
import type { MySkyStarDisplay } from '@/mySky/types';
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
import { registerSignOutCleanup } from '@/auth/sessionLifecycle';
import { resolveActiveUserId } from '@/auth/resolveActiveUserId';
import { useReelyouAuth } from '@/auth/ReelyouAuthProvider';
import { isQaPreviewQueryActive } from '@/config/qaPreviewFlags';
import { isReelyouAuthConfigured } from '@/auth/reellyouAuthConfig';
import { loadOnboardingState, saveOnboardingState } from '@/onboarding/onboardingPersistence';
import { formatSkywriteServerSyncError } from '@/social/formatSkywriteServerSyncError';
import { addToYourJourneyOnServer } from '@/social/sharedSkywriteApi';
import {
  fetchServerProfile,
  mergeOnboardingWithServerProfile,
  patchServerProfile,
  syncOnboardingCompleteToServer,
} from '@/profile/serverProfileApi';
import { syncPublishedSkywriteToServer } from '@/social/publishSharedSkywrite';
import {
  applyAddToYourJourney,
  applyPublishRetentionFields,
} from '@/skywrite/library/skywriteLibraryRetention';
import { mergeOwnerSkywritePosts } from '@/skywrite/library/mergeOwnerSkywritePosts';
import { isSharedSocialPersistenceEnabled } from '@/social/sharedSocialApi';
import { setActiveStorageUserId } from '@/storage/scopedAsyncStorage';
import {
  fetchAuthorServerSkywrites,
  fetchSkywriteFromServer,
  mapServerSkywriteToRecord,
} from '@/social/sharedSkywriteApi';
import { cacheRemoteSkywrites } from '@/social/sharedSkywriteCache';
import { subscribeSkywriteLocalRecordSync } from '@/skywrite/library/skywriteLocalRecordSync';
import {
  loadProfileSkyAreaShortcutIds,
  saveProfileSkyAreaShortcutIds,
} from '@/profile/profileSkyAreaShortcutsPersistence';
import {
  PROFILE_BETA_PREVIEW_CATEGORY_IDS,
  type SkyAreaCategoryId,
} from '@/skyAreas/skyAreaCategory';
import {
  EMPTY_SKYWRITES,
  loadSkywrites,
  saveSkywrites,
  type SkywriteDraft,
  type SkywriteRecord,
  type SkywritesState,
} from '@/skywrite';
import {
  ensureSkywriteVideoThumbnail,
  prepareSkywriteDraftForPublish,
} from '@/skywrite/publish/ensureSkywriteVideoThumbnail';
import {
  publishSkywriteDraft,
  type PublishSkywriteProgress,
  type PublishSkywriteResult,
} from '@/skywrite/publish/publishSkywriteDraft';
import { scheduleSkywritePostPublishEffects } from '@/skywrite/postPublish/scheduleSkywritePostPublishEffects';
import { applySkywriteVideoCover } from '@/skywrite/library/applySkywriteVideoCover';
import { onSkywriteCreated } from '@/journeyThreads/journeyThreadFutureHooks';
import { dismissTodayFocusForDateKey } from '@/todayFocus/todayFocusSession';
import { stripSkywriteRenderableContent } from '@/skywrite/lifecycle/skywriteContentLifecycle';
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
  completeOnboarding: () => Promise<boolean>;
  /** Per-user onboarding + library hydration finished for the active account */
  userSessionHydrated: boolean;
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
  setTodayFocus: (value: string, source: TodayFocusSource) => Promise<boolean>;
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
  publishSkywrite: (
    draft: SkywriteDraft,
    onProgress?: (progress: PublishSkywriteProgress) => void,
  ) => Promise<PublishSkywriteResult>;
  replaceSkywrite: (
    skywriteId: string,
    draft: SkywriteDraft,
    onProgress?: (progress: PublishSkywriteProgress) => void,
  ) => Promise<PublishSkywriteResult>;
  updateSkywrite: (
    skywriteId: string,
    patch: Partial<Pick<SkywriteRecord, 'visibility' | 'text' | 'userHashtags' | 'skyAreaId'>>,
  ) => void;
  profileSkyAreaShortcutIds: SkyAreaCategoryId[];
  setProfileSkyAreaShortcutIds: (ids: SkyAreaCategoryId[]) => void;
  /** Remove renderable body/media for a skywrite id — pairs with library tombstone on delete. */
  stripSkywriteContentForDeletion: (skywriteId: string) => void;
  addSkywriteToYourJourney: (skywriteId: string) => Promise<{ ok: boolean }>;
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
  /** Star field including a just-published Skywrite — correct semantic color and highlight. */
  buildArrivalStarsForRecord: (record: SkywriteRecord) => MySkyStarDisplay[];
  applySkywriteVideoCoverAt: (skywriteId: string, seekMs: number) => Promise<{ ok: boolean }>;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { user: authUser, patchSessionUser } = useReelyouAuth();
  const activeUserId = resolveActiveUserId(authUser);
  const qaParams = useGlobalSearchParams<{ qaPreview?: string }>();
  const qaPreviewReadOnly = isQaPreviewQueryActive(
    typeof qaParams.qaPreview === 'string' ? qaParams.qaPreview : undefined,
  );
  const [state, setState] = useState<OnboardingState>(EMPTY_ONBOARDING_STATE);
  const [todayFocus, setTodayFocusState] = useState<TodayFocusRecord>(() =>
    reconcileTodayFocusForToday({ ...EMPTY_TODAY_FOCUS, dateKey: getLocalDateKey() }),
  );
  const [communities, setCommunitiesState] = useState<CommunitiesRecord>(EMPTY_COMMUNITIES);
  const [guidingLightDismiss, setGuidingLightDismissState] =
    useState<GuidingLightDismissRecord>(EMPTY_GUIDING_LIGHT_DISMISS);
  const [skywritesState, setSkywritesState] = useState<SkywritesState>(EMPTY_SKYWRITES);
  const skywritesRef = useRef(skywritesState);
  const publishInFlightRef = useRef(false);
  const [profileSkyAreaShortcutIds, setProfileSkyAreaShortcutIdsState] = useState<
    SkyAreaCategoryId[]
  >(() => [...PROFILE_BETA_PREVIEW_CATEGORY_IDS]);
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
  const [userSessionHydrated, setUserSessionHydrated] = useState(
    () => !isReelyouAuthConfigured(),
  );
  const [sessionLoadInProgress, setSessionLoadInProgress] = useState(false);
  const onboardingSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetSignedOutSessionMemory = useCallback(() => {
    setState(EMPTY_ONBOARDING_STATE);
    setTodayFocusState(reconcileTodayFocusForToday({ ...EMPTY_TODAY_FOCUS, dateKey: getLocalDateKey() }));
    setCommunitiesState(EMPTY_COMMUNITIES);
    setGuidingLightDismissState(EMPTY_GUIDING_LIGHT_DISMISS);
    setSkywritesState(EMPTY_SKYWRITES);
    skywritesRef.current = EMPTY_SKYWRITES;
    setProfileSkyAreaShortcutIdsState([]);
    setSkyEvolution(EMPTY_SKY_EVOLUTION);
    setMySkyVisibilitySettingsState({
      ...DEFAULT_SKY_VISIBILITY_SETTINGS,
      contentOverrides: {},
    });
  }, []);

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
    skywritesRef.current = skywritesState;
  }, [skywritesState]);

  useEffect(() => {
    return registerSignOutCleanup(resetSignedOutSessionMemory);
  }, [resetSignedOutSessionMemory]);

  useLayoutEffect(() => {
    if (isReelyouAuthConfigured() && activeUserId) {
      setSessionLoadInProgress(true);
      setUserSessionHydrated(false);
    }
  }, [activeUserId]);

  useEffect(() => {
    setActiveStorageUserId(activeUserId);
    let live = true;

    if (isReelyouAuthConfigured() && !activeUserId) {
      resetSignedOutSessionMemory();
      setUserSessionHydrated(true);
      setSessionLoadInProgress(false);
      return () => {
        live = false;
      };
    }

    setUserSessionHydrated(false);
    setSessionLoadInProgress(true);
    void (async () => {
      await hydrateTodayFocusDismissState();
      const [
        onboardingRecord,
        focusRecord,
        communitiesRecord,
        guidingLightRecord,
        skywritesRecord,
        shortcutIds,
        evolutionRecord,
        visibilityRecord,
        serverProfile,
      ] = await Promise.all([
        loadOnboardingState(),
        loadTodayFocus(),
        loadCommunities(),
        loadGuidingLightDismiss(),
        loadSkywrites(),
        loadProfileSkyAreaShortcutIds(),
        loadSkyEvolution(),
        loadSkyVisibilitySettings(),
        isSharedSocialPersistenceEnabled() ? fetchServerProfile() : Promise.resolve(null),
      ]);
      if (!live) return;
      const merged = mergeOnboardingWithServerProfile(onboardingRecord, serverProfile);
      setState(merged);
      if (serverProfile && activeUserId === serverProfile.userId) {
        void patchSessionUser({
          fullName: serverProfile.fullName,
          username: serverProfile.username,
          bio: serverProfile.bio,
          avatarMediaKey: serverProfile.avatarMediaKey,
          onboardingComplete: serverProfile.onboardingComplete,
        });
      }
      setTodayFocusState(reconcileTodayFocusForToday(focusRecord));
      setCommunitiesState(communitiesRecord);
      setGuidingLightDismissState(guidingLightRecord);
      setSkywritesState(skywritesRecord);
      skywritesRef.current = skywritesRecord;
      setProfileSkyAreaShortcutIdsState(shortcutIds);
      setSkyEvolution(evolutionRecord);
      setMySkyVisibilitySettingsState(visibilityRecord);
      setSessionLoadInProgress(false);
      setUserSessionHydrated(true);
    })();

    return () => {
      live = false;
    };
  }, [activeUserId, patchSessionUser, resetSignedOutSessionMemory]);

  useEffect(() => {
    if (qaPreviewReadOnly) return;
    if (!activeUserId || !userSessionHydrated || sessionLoadInProgress) return;
    if (onboardingSaveTimer.current) clearTimeout(onboardingSaveTimer.current);
    onboardingSaveTimer.current = setTimeout(() => {
      void saveOnboardingState(state);
    }, 250);
    return () => {
      if (onboardingSaveTimer.current) clearTimeout(onboardingSaveTimer.current);
    };
  }, [activeUserId, qaPreviewReadOnly, sessionLoadInProgress, state, userSessionHydrated]);

  const mergeAuthorSkywritesFromServer = useCallback(async (authorUserId: string) => {
    if (!isSharedSocialPersistenceEnabled()) return;
    const serverRows = await fetchAuthorServerSkywrites(authorUserId);
    const remote = serverRows.map((row) => mapServerSkywriteToRecord(row));
    const { mergeServerSkyreelIntoRegistry } = await import(
      '@/skywrite/play/mergeServerSkyreelRegistry'
    );
    const { loadPlaySkySequenceRegistry, savePlaySkySequenceRegistry } = await import(
      '@/skywrite/play/playSkySequencePersistence'
    );
    const registry = await loadPlaySkySequenceRegistry();
    await savePlaySkySequenceRegistry(mergeServerSkyreelIntoRegistry(registry, serverRows));
    cacheRemoteSkywrites(authorUserId, remote);
    setSkywritesState((current) => {
      const merged: SkywritesState = {
        posts: mergeOwnerSkywritePosts(current.posts, remote),
      };
      skywritesRef.current = merged;
      void saveSkywrites(merged);
      return merged;
    });
  }, []);

  useEffect(() => {
    if (!isSharedSocialPersistenceEnabled() || !authUser?.id) return;
    let live = true;
    void mergeAuthorSkywritesFromServer(authUser.id).finally(() => {
      if (!live) return;
    });
    return () => {
      live = false;
    };
  }, [authUser?.id, mergeAuthorSkywritesFromServer]);

  useEffect(() => {
    return subscribeSkywriteLocalRecordSync((record) => {
      setSkywritesState((current) => {
        const posts = current.posts.map((post) => (post.id === record.id ? record : post));
        if (posts.every((post, i) => post === current.posts[i])) return current;
        const next: SkywritesState = { posts };
        skywritesRef.current = next;
        void saveSkywrites(next);
        return next;
      });
    });
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState !== 'active') return;
      const dateKey = getLocalDateKey();
      reconcileTodayFocusDismissForDate(dateKey);
      setTodayFocusState((current) => reconcileTodayFocusForToday(current));
    });
    return () => subscription.remove();
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

  const sessionSkyOwner = useMemo(
    () =>
      authUser?.id
        ? { id: authUser.id, fullName: authUser.fullName ?? null }
        : null,
    [authUser?.fullName, authUser?.id],
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
        sessionSkyOwner,
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
      sessionSkyOwner,
    ],
  );

  const applySkywriteVideoCoverAt = useCallback(async (skywriteId: string, seekMs: number) => {
    const post = skywritesRef.current.posts.find((entry) => entry.id === skywriteId);
    if (!post) return { ok: false };
    const updated = await applySkywriteVideoCover(post, seekMs);
    if (!updated) return { ok: false };
    setSkywritesState((current) => {
      const posts = current.posts.map((entry) => (entry.id === skywriteId ? updated : entry));
      const next = { posts };
      skywritesRef.current = next;
      void saveSkywrites(next);
      return next;
    });
    return { ok: true };
  }, []);

  const buildArrivalStarsForRecord = useCallback(
    (record: SkywriteRecord): MySkyStarDisplay[] => {
      const sources = resolveMySkySources(
        {
          ...basePersonalizationProfile,
          skywrites: skywritesRef.current.posts,
          guidingLight: guidingLightView.light,
        },
        skyEvolution,
        skyConnectionActivities,
        participatingCommunityIds,
      );
      sources.skyOwner = resolveCurrentSkyOwnerProfile(
        basePersonalizationProfile.northStar.originalVision,
        sessionSkyOwner,
      );
      return buildArrivalStarsSnapshot(sources, record, mySkyVisibleLayers);
    },
    [
      basePersonalizationProfile,
      guidingLightView.light,
      mySkyVisibleLayers,
      participatingCommunityIds,
      skyConnectionActivities,
      skyEvolution,
      sessionSkyOwner,
      skywritesState.posts,
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

  const northStarServerSyncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setNorthStarVision = useCallback((vision: string) => {
    const trimmed = vision.slice(0, MAX_NORTH_STAR_VISION_LENGTH);
    setState((current) => ({
      ...current,
      northStar: { originalVision: trimmed },
    }));
    if (!isSharedSocialPersistenceEnabled()) return;
    if (northStarServerSyncTimer.current) clearTimeout(northStarServerSyncTimer.current);
    northStarServerSyncTimer.current = setTimeout(() => {
      void patchServerProfile({ bio: trimmed.trim() || null });
    }, 600);
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

  const completeOnboarding = useCallback(async () => {
    let nextState: OnboardingState | null = null;
    setState((current) => {
      nextState = { ...current, isOnboardingComplete: true };
      return nextState;
    });
    if (!nextState) return false;
    if (isSharedSocialPersistenceEnabled() && activeUserId) {
      const synced = await syncOnboardingCompleteToServer(true, nextState);
      if (!synced.ok) {
        setState((current) => ({ ...current, isOnboardingComplete: false }));
        return false;
      }
    }
    const saved = await saveOnboardingState(nextState);
    return saved;
  }, [activeUserId]);

  const setTodayFocus = useCallback(async (value: string, source: TodayFocusSource) => {
    const trimmed = value.trim();
    if (!trimmed) return false;
    const dateKey = getLocalDateKey();
    let nextRecord: TodayFocusRecord | null = null;
    setTodayFocusState((current) => {
      const focusChanged = current.value !== trimmed;
      nextRecord = {
        value: trimmed,
        source,
        dateKey,
        selectedAt: new Date().toISOString(),
        reflection: focusChanged ? null : current.reflection,
        reflectionUpdatedAt: focusChanged ? null : current.reflectionUpdatedAt,
      };
      return nextRecord;
    });
    if (!nextRecord) return false;
    const saved = await saveTodayFocus(nextRecord);
    if (!saved) {
      void loadTodayFocus().then((restored) =>
        setTodayFocusState(reconcileTodayFocusForToday(restored)),
      );
      return false;
    }
    dismissTodayFocusForDateKey(dateKey);
    notifyTodayFocusChanged(nextRecord);
    recordSkyEvolution(
      createEvolutionEntry('FOCUS_SELECTED', {
        summary: 'Today’s Focus was chosen.',
      }),
    );
    return true;
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

  const publishSkywrite = useCallback(
    async (
      draft: SkywriteDraft,
      onProgress?: (progress: PublishSkywriteProgress) => void,
    ): Promise<PublishSkywriteResult> => {
      if (publishInFlightRef.current) {
        return {
          ok: false,
          errorMessage: 'Your Skywrite is already posting. Please wait a moment.',
          saveMs: 0,
        };
      }
      const authorUserId = activeUserId;
      if (!authorUserId) {
        return {
          ok: false,
          errorMessage: 'Sign in to publish a Skywrite.',
          saveMs: 0,
        };
      }
      publishInFlightRef.current = true;
      let result: PublishSkywriteResult;
      let lastServerSyncError: string | null = null;
      let publishTiming:
        | { uploadMs: number; serverMs: number; stages?: import('@/skywrite/publish/publishSkywriteDraft').PublishStageTimingMs }
        | undefined;
      try {
        const draftForPublish = await prepareSkywriteDraftForPublish(draft);
        result = await publishSkywriteDraft(
          draftForPublish,
          async (record) => {
            let finalRecord = applyPublishRetentionFields(record, draftForPublish);
            if (isSharedSocialPersistenceEnabled()) {
              const sync = await syncPublishedSkywriteToServer(finalRecord, onProgress);
              if (!sync.ok) {
                lastServerSyncError = sync.error;
                return false;
              }
              finalRecord = applyPublishRetentionFields(sync.record, draft);
              publishTiming = sync.timingMs;
            }
            finalRecord = {
              ...finalRecord,
              authorId: finalRecord.authorId ?? authorUserId,
            };
            const withoutDup = skywritesRef.current.posts.filter((post) => post.id !== finalRecord.id);
            const next: SkywritesState = {
              posts: [finalRecord, ...withoutDup],
            };
            const saved = await saveSkywrites(next);
            if (saved) {
              setSkywritesState(next);
              skywritesRef.current = next;
              recordSkyEvolution(
                createEvolutionEntry('SKYWRITE_CREATED', {
                  nodeId: buildSkyNodeId(finalRecord.id),
                  summary: 'A new Skywrite became a star in your sky.',
                }),
              );
              onSkywriteCreated(finalRecord);
            }
            return saved ? finalRecord : false;
          },
          authorUserId,
          onProgress,
        );
        if (result.ok && publishTiming) {
          result = {
            ...result,
            timing: {
              totalMs: result.saveMs,
              uploadMs: publishTiming.uploadMs,
              serverMs: publishTiming.serverMs,
              stages: publishTiming.stages,
            },
          };
        }
        if (!result.ok && lastServerSyncError) {
          result = {
            ...result,
            errorMessage: formatSkywriteServerSyncError(lastServerSyncError),
          };
        } else if (!result.ok && isSharedSocialPersistenceEnabled()) {
          result = {
            ...result,
            errorMessage:
              'We couldn’t upload or save your Skywrite to the server. Check your connection and try again.',
          };
        }
      } finally {
        publishInFlightRef.current = false;
      }

      if (result.ok) {
        scheduleSkywritePostPublishEffects(result.record);
        if (isSharedSocialPersistenceEnabled() && authUser?.id) {
          const reconcileStarted = Date.now();
          void mergeAuthorSkywritesFromServer(authUser.id)
            .then(() => {
              if (__DEV__) {
                console.info('[skywrite-publish]', {
                  libraryReconcileMs: Date.now() - reconcileStarted,
                });
              }
            })
            .catch(() => undefined);
        }
      }

      if (result.ok && result.record.media.video?.uri) {
        const savedId = result.record.id;
        void ensureSkywriteVideoThumbnail(result.record.media.video).then(async (video) => {
          if (!video?.thumbnailUri) return;
          const { repairSkywriteVideoThumbnailIfNeeded } = await import(
            '@/social/repairSkywriteVideoThumbnail'
          );
          const base = { ...result.record, media: { ...result.record.media, video } };
          const repaired = (await repairSkywriteVideoThumbnailIfNeeded(base)) ?? base;
          setSkywritesState((current) => {
            const posts = current.posts.map((post) =>
              post.id === savedId ? repaired : post,
            );
            const next = { posts };
            skywritesRef.current = next;
            void saveSkywrites(next);
            return next;
          });
        });
      }

      return result;
    },
    [activeUserId, authUser?.id, mergeAuthorSkywritesFromServer, recordSkyEvolution],
  );

  const addSkywriteToYourJourney = useCallback(
    async (skywriteId: string): Promise<{ ok: boolean }> => {
      const existing = skywritesRef.current.posts.find((post) => post.id === skywriteId);
      if (!existing || existing.inYourJourney) return { ok: false };
      let updated = applyAddToYourJourney(existing);
      if (isSharedSocialPersistenceEnabled()) {
        const { mapServerSkywriteToRecord } = await import('@/social/sharedSkywriteApi');
        const row = await addToYourJourneyOnServer(skywriteId);
        if (!row) return { ok: false };
        updated = mapServerSkywriteToRecord(row);
      }
      const next: SkywritesState = {
        posts: skywritesRef.current.posts.map((post) => (post.id === skywriteId ? updated : post)),
      };
      const saved = await saveSkywrites(next);
      if (!saved) return { ok: false };
      setSkywritesState(next);
      skywritesRef.current = next;
      return { ok: true };
    },
    [],
  );

  const replaceSkywrite = useCallback(
    async (
      skywriteId: string,
      draft: SkywriteDraft,
      onProgress?: (progress: PublishSkywriteProgress) => void,
    ): Promise<PublishSkywriteResult> => {
      const existing = skywritesRef.current.posts.find((post) => post.id === skywriteId);
      if (!existing) {
        return {
          ok: false,
          errorMessage: 'We couldn’t find that Skywrite to update.',
          saveMs: 0,
        };
      }
      const authorUserId = activeUserId;
      if (!authorUserId) {
        return {
          ok: false,
          errorMessage: 'Sign in to update this Skywrite.',
          saveMs: 0,
        };
      }
      const draftForPublish = await prepareSkywriteDraftForPublish(draft);
      const result = await publishSkywriteDraft(
        draftForPublish,
        async (record) => {
          let finalRecord = record;
          if (isSharedSocialPersistenceEnabled()) {
            const sync = await syncPublishedSkywriteToServer(record);
            if (!sync.ok) return false;
            finalRecord = sync.record;
          }
          const next: SkywritesState = {
            posts: skywritesRef.current.posts.map((post) =>
              post.id === skywriteId ? finalRecord : post,
            ),
          };
          const saved = await saveSkywrites(next);
          if (saved) {
            setSkywritesState(next);
            skywritesRef.current = next;
          }
          return saved ? finalRecord : false;
        },
        existing.authorId ?? authorUserId,
        onProgress,
        { existingId: skywriteId, createdAt: existing.createdAt },
      );

      if (result.ok && result.record.media.video?.uri) {
        void ensureSkywriteVideoThumbnail(result.record.media.video).then(async (video) => {
          if (!video?.thumbnailUri) return;
          const { repairSkywriteVideoThumbnailIfNeeded } = await import(
            '@/social/repairSkywriteVideoThumbnail'
          );
          const base = { ...result.record, media: { ...result.record.media, video } };
          const repaired = (await repairSkywriteVideoThumbnailIfNeeded(base)) ?? base;
          setSkywritesState((current) => {
            const posts = current.posts.map((post) =>
              post.id === skywriteId ? repaired : post,
            );
            const next = { posts };
            skywritesRef.current = next;
            void saveSkywrites(next);
            return next;
          });
        });
      }

      return result;
    },
    [activeUserId],
  );

  const setProfileSkyAreaShortcutIds = useCallback((ids: SkyAreaCategoryId[]) => {
    setProfileSkyAreaShortcutIdsState(ids);
    void saveProfileSkyAreaShortcutIds(ids);
  }, []);

  const updateSkywrite = useCallback(
    (
      skywriteId: string,
      patch: Partial<Pick<SkywriteRecord, 'visibility' | 'text' | 'userHashtags' | 'skyAreaId'>>,
    ) => {
      setSkywritesState((current) => {
        let changed = false;
        const posts = current.posts.map((post) => {
          if (post.id !== skywriteId) return post;
          changed = true;
          return { ...post, ...patch };
        });
        if (!changed) return current;
        const next: SkywritesState = { posts };
        void saveSkywrites(next);
        return next;
      });
    },
    [],
  );

  const stripSkywriteContentForDeletion = useCallback((skywriteId: string) => {
    setSkywritesState((current) => {
      let changed = false;
      const posts = current.posts.map((post) => {
        if (post.id !== skywriteId) return post;
        changed = true;
        return stripSkywriteRenderableContent(post);
      });
      if (!changed) return current;
      const next: SkywritesState = { posts };
      void saveSkywrites(next);
      return next;
    });
  }, []);

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
      publishSkywrite,
      replaceSkywrite,
      updateSkywrite,
      profileSkyAreaShortcutIds,
      setProfileSkyAreaShortcutIds,
      stripSkywriteContentForDeletion,
      addSkywriteToYourJourney,
      skyArrivalHandoff,
      setSkyArrivalHandoff,
      clearSkyArrivalHandoff,
      mySkyViewport,
      setMySkyViewport,
      mySkyExploreEnabled,
      setMySkyExploreEnabled,
      mySkyVisibilitySettings,
      setMySkyVisibilitySettings,
      buildArrivalStarsForRecord,
      applySkywriteVideoCoverAt,
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
      userSessionHydrated,
    }),
    [
      state,
      userSessionHydrated,
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
      publishSkywrite,
      replaceSkywrite,
      updateSkywrite,
      profileSkyAreaShortcutIds,
      setProfileSkyAreaShortcutIds,
      stripSkywriteContentForDeletion,
      addSkywriteToYourJourney,
      skyArrivalHandoff,
      setSkyArrivalHandoff,
      clearSkyArrivalHandoff,
      mySkyViewport,
      setMySkyViewport,
      mySkyExploreEnabled,
      setMySkyExploreEnabled,
      mySkyVisibilitySettings,
      setMySkyVisibilitySettings,
      buildArrivalStarsForRecord,
      applySkywriteVideoCoverAt,
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

