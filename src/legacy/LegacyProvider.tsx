import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { isLegacyDemoEnabled } from '@/constants/devFlags';
import { currentUser, orbitUsers } from '@/data/mockData';
import { useHumanPotentialMetrics } from '@/humanPotential/HumanPotentialMetricsProvider';
import { buildLegacyMoments } from '@/legacy/buildLegacyMoments';
import { buildReelSequence } from '@/legacy/buildReelSequence';
import {
  EMPTY_LEGACY_USER_STATE,
  type LegacyMoment,
  type LegacyMomentPrivacy,
  type LegacyUserState,
} from '@/legacy/legacyMomentTypes';
import { loadLegacyUserState, saveLegacyUserState } from '@/legacy/legacyPersistence';
import type { ReelSequence } from '@/legacy/reelYouTypes';
import { useReelyouConnect } from '@/connect/ReelyouConnectProvider';
import { useOnboarding } from '@/onboarding';
import { useSavedThreads } from '@/skywrite/savedThreads/SavedThreadsProvider';
import { useSkywriteLibrary } from '@/skywrite/library/SkywriteLibraryProvider';
import { useSkywriteThreads } from '@/skywrite/threads/SkywriteThreadProvider';

interface LegacyContextValue {
  isLoaded: boolean;
  moments: LegacyMoment[];
  hiddenMoments: LegacyMoment[];
  reelSequence: ReelSequence;
  hideMoment: (legacyMomentId: string) => void;
  restoreMoment: (legacyMomentId: string) => void;
  editMomentCopy: (legacyMomentId: string, title: string, shortSummary?: string) => void;
  setMomentPrivacy: (legacyMomentId: string, privacy: LegacyMomentPrivacy) => void;
  markReelReviewed: () => void;
  hideMomentFromReel: (legacyMomentId: string) => void;
  momentById: (legacyMomentId: string) => LegacyMoment | undefined;
}

const LegacyContext = createContext<LegacyContextValue | null>(null);

export function LegacyProvider({ children }: { children: ReactNode }) {
  const { state: metricsState, isLoaded: metricsLoaded } = useHumanPotentialMetrics();
  const { contributions } = useSkywriteThreads();
  const { state: savedState, isLoaded: savedLoaded } = useSavedThreads();
  const { skywrites } = useOnboarding();
  const { lifecycle, isLoaded: libraryLoaded } = useSkywriteLibrary();
  const { messages } = useReelyouConnect();
  const [userState, setUserState] = useState<LegacyUserState>(EMPTY_LEGACY_USER_STATE);
  const [userLoaded, setUserLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    void loadLegacyUserState().then((loaded) => {
      if (!mounted) return;
      setUserState(loaded);
      setUserLoaded(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const persistUser = useCallback((next: LegacyUserState) => {
    setUserState(next);
    void saveLegacyUserState(next);
  }, []);

  const userDirectory = useMemo(() => {
    const map: Record<string, string> = { [currentUser.id]: currentUser.name };
    for (const user of orbitUsers) {
      map[user.id] = user.name;
    }
    if (isLegacyDemoEnabled()) {
      map['orbit-1'] = 'Alex Kim';
      map['sky-3'] = 'Priya Sharma';
    }
    return map;
  }, []);

  const synthesized = useMemo(
    () =>
      buildLegacyMoments({
        ownerUserId: currentUser.id,
        metrics: metricsState,
        contributions,
        reflections: savedState.reflections,
        lifecycle,
        skywrites,
        blockedUserIds: messages.blockedUserIds,
        userState,
        userDirectory,
      }),
    [
      contributions,
      lifecycle,
      messages.blockedUserIds,
      metricsState,
      savedState.reflections,
      skywrites,
      userState,
      userDirectory,
    ],
  );

  const visibleMoments = useMemo(
    () => synthesized.filter((moment) => !moment.userHidden),
    [synthesized],
  );

  const hiddenMoments = useMemo(
    () => synthesized.filter((moment) => moment.userHidden),
    [synthesized],
  );

  const reelSequence = useMemo(() => {
    const reelHidden = new Set(userState.reelReview.hiddenMomentIds);
    const reelMoments = visibleMoments.filter((moment) => !reelHidden.has(moment.legacyMomentId));
    const stableNow =
      reelMoments.length > 0 ? reelMoments[reelMoments.length - 1]!.occurredAt : 0;
    return buildReelSequence({
      ownerUserId: currentUser.id,
      moments: reelMoments,
      userReviewed: userState.reelReview.userReviewed,
      now: stableNow,
    });
  }, [userState.reelReview.hiddenMomentIds, userState.reelReview.userReviewed, visibleMoments]);

  const hideMoment = useCallback(
    (legacyMomentId: string) => {
      const now = Date.now();
      persistUser({
        ...userState,
        momentOverrides: {
          ...userState.momentOverrides,
          [legacyMomentId]: {
            ...userState.momentOverrides[legacyMomentId],
            userHidden: true,
            updatedAt: now,
          },
        },
        updatedAt: now,
      });
    },
    [persistUser, userState],
  );

  const restoreMoment = useCallback(
    (legacyMomentId: string) => {
      const now = Date.now();
      persistUser({
        ...userState,
        momentOverrides: {
          ...userState.momentOverrides,
          [legacyMomentId]: {
            ...userState.momentOverrides[legacyMomentId],
            userHidden: false,
            updatedAt: now,
          },
        },
        updatedAt: now,
      });
    },
    [persistUser, userState],
  );

  const editMomentCopy = useCallback(
    (legacyMomentId: string, title: string, shortSummary?: string) => {
      const now = Date.now();
      persistUser({
        ...userState,
        momentOverrides: {
          ...userState.momentOverrides,
          [legacyMomentId]: {
            ...userState.momentOverrides[legacyMomentId],
            title: title.trim(),
            shortSummary: shortSummary?.trim(),
            userEdited: true,
            updatedAt: now,
          },
        },
        updatedAt: now,
      });
    },
    [persistUser, userState],
  );

  const setMomentPrivacy = useCallback(
    (legacyMomentId: string, privacy: LegacyMomentPrivacy) => {
      const now = Date.now();
      persistUser({
        ...userState,
        momentOverrides: {
          ...userState.momentOverrides,
          [legacyMomentId]: {
            ...userState.momentOverrides[legacyMomentId],
            privacy,
            updatedAt: now,
          },
        },
        updatedAt: now,
      });
    },
    [persistUser, userState],
  );

  const markReelReviewed = useCallback(() => {
    const now = Date.now();
    persistUser({
      ...userState,
      reelReview: { ...userState.reelReview, userReviewed: true, updatedAt: now },
      updatedAt: now,
    });
  }, [persistUser, userState]);

  const hideMomentFromReel = useCallback(
    (legacyMomentId: string) => {
      const now = Date.now();
      const hidden = new Set(userState.reelReview.hiddenMomentIds);
      hidden.add(legacyMomentId);
      persistUser({
        ...userState,
        reelReview: {
          ...userState.reelReview,
          hiddenMomentIds: [...hidden],
          updatedAt: now,
        },
        updatedAt: now,
      });
    },
    [persistUser, userState],
  );

  const momentById = useCallback(
    (legacyMomentId: string) => synthesized.find((entry) => entry.legacyMomentId === legacyMomentId),
    [synthesized],
  );

  const isLoaded =
    metricsLoaded && savedLoaded && libraryLoaded && userLoaded;

  const value = useMemo<LegacyContextValue>(
    () => ({
      isLoaded,
      moments: visibleMoments,
      hiddenMoments,
      reelSequence,
      hideMoment,
      restoreMoment,
      editMomentCopy,
      setMomentPrivacy,
      markReelReviewed,
      hideMomentFromReel,
      momentById,
    }),
    [
      editMomentCopy,
      hiddenMoments,
      hideMoment,
      hideMomentFromReel,
      isLoaded,
      markReelReviewed,
      momentById,
      reelSequence,
      restoreMoment,
      setMomentPrivacy,
      visibleMoments,
    ],
  );

  return <LegacyContext.Provider value={value}>{children}</LegacyContext.Provider>;
}

export function useLegacy(): LegacyContextValue {
  const ctx = useContext(LegacyContext);
  if (!ctx) {
    throw new Error('useLegacy must be used within LegacyProvider');
  }
  return ctx;
}
