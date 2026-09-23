import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { currentUser } from '@/data/mockData';
import { isContributionBeaconDemoEnabled } from '@/constants/devFlags';
import { useOnboarding } from '@/onboarding';
import { useSkyAreaPreferences } from '@/skyAreas/SkyAreaPreferencesProvider';
import {
  mergeContributionBeaconDemoState,
  withContributionBeaconDemoPrefs,
} from '@/skywrite/beacon/contributionBeaconDemoFixtures';
import { beaconNow } from '@/skywrite/beacon/beaconTime';
import {
  loadBeaconSystemState,
  saveBeaconSystemState,
} from '@/skywrite/beacon/beaconLifecyclePersistence';
import {
  EMPTY_BEACON_SYSTEM_STATE,
  type BeaconSystemState,
} from '@/skywrite/beacon/beaconLifecycleTypes';
import {
  buildViewerBeaconQueue,
  reactivateAuthorBeacon,
  setAuthorBeaconResolved,
  syncBeaconSystem,
  updateMatchStatus,
} from '@/skywrite/beacon/beaconMatchEngine';

interface SkywriteBeaconContextValue {
  isLoaded: boolean;
  beaconState: BeaconSystemState;
  syncBeacons: (now?: number) => BeaconSystemState;
  ignoreBeaconForViewer: (skywriteId: string) => void;
  respondBeaconForViewer: (skywriteId: string) => void;
  resolveAuthorBeacon: (skywriteId: string) => void;
  reactivateAuthorBeacon: (skywriteId: string) => void;
  getLifecycle: (skywriteId: string) => BeaconSystemState['lifecycles'][string] | undefined;
  buildQueueForViewer: (
    viewerId: string,
    blockedUserIds: readonly string[],
    now?: number,
  ) => ReturnType<typeof buildViewerBeaconQueue>;
}

const SkywriteBeaconContext = createContext<SkywriteBeaconContextValue | null>(null);

export function SkywriteBeaconProvider({ children }: { children: ReactNode }) {
  const { skywrites } = useOnboarding();
  const { record: skyAreaPrefs } = useSkyAreaPreferences();
  const [beaconState, setBeaconState] = useState<BeaconSystemState>(EMPTY_BEACON_SYSTEM_STATE);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    void loadBeaconSystemState().then((loaded) => {
      if (!mounted) return;
      let next = loaded;
      if (isContributionBeaconDemoEnabled()) {
        next = mergeContributionBeaconDemoState(loaded, beaconNow());
        void saveBeaconSystemState(next);
      }
      setBeaconState(next);
      setIsLoaded(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const persist = useCallback((next: BeaconSystemState) => {
    setBeaconState(next);
    void saveBeaconSystemState(next);
  }, []);

  const effectivePrefs = useMemo(
    () =>
      isContributionBeaconDemoEnabled()
        ? withContributionBeaconDemoPrefs(skyAreaPrefs)
        : skyAreaPrefs,
    [skyAreaPrefs],
  );

  const syncBeacons = useCallback(
    (now?: number) => {
      const ts = now ?? beaconNow();
      let next = syncBeaconSystem({
        state: beaconState,
        localPosts: skywrites,
        prefs: effectivePrefs,
        blockedUserIds: [],
        now: ts,
      });
      if (isContributionBeaconDemoEnabled()) {
        next = mergeContributionBeaconDemoState(next, ts);
      }
      persist(next);
      return next;
    },
    [beaconState, effectivePrefs, persist, skywrites],
  );

  useEffect(() => {
    if (!isLoaded) return;
    syncBeacons(beaconNow());
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync when inputs change
  }, [isLoaded, skywrites, effectivePrefs]);

  const ignoreBeaconForViewer = useCallback(
    (skywriteId: string) => {
      const now = beaconNow();
      const next = updateMatchStatus(beaconState, skywriteId, currentUser.id, 'ignored', now);
      persist(next);
    },
    [beaconState, persist],
  );

  const respondBeaconForViewer = useCallback(
    (skywriteId: string) => {
      const now = beaconNow();
      const next = updateMatchStatus(beaconState, skywriteId, currentUser.id, 'responded', now);
      persist(next);
    },
    [beaconState, persist],
  );

  const resolveAuthorBeacon = useCallback(
    (skywriteId: string) => {
      persist(setAuthorBeaconResolved(beaconState, skywriteId, true, beaconNow()));
    },
    [beaconState, persist],
  );

  const reactivateAuthorBeaconFn = useCallback(
    (skywriteId: string) => {
      const now = beaconNow();
      const next = reactivateAuthorBeacon(beaconState, skywriteId, now);
      let synced = syncBeaconSystem({
        state: next,
        localPosts: skywrites,
        prefs: effectivePrefs,
        blockedUserIds: [],
        now,
      });
      if (isContributionBeaconDemoEnabled()) {
        synced = mergeContributionBeaconDemoState(synced, now);
      }
      persist(synced);
    },
    [beaconState, effectivePrefs, persist, skywrites],
  );

  const buildQueueForViewer = useCallback(
    (viewerId: string, blockedUserIds: readonly string[], now?: number) => {
      const ts = now ?? beaconNow();
      let synced = syncBeaconSystem({
        state: beaconState,
        localPosts: skywrites,
        prefs: effectivePrefs,
        blockedUserIds,
        now: ts,
      });
      if (isContributionBeaconDemoEnabled()) {
        synced = mergeContributionBeaconDemoState(synced, ts);
      }
      return buildViewerBeaconQueue({
        state: synced,
        localPosts: skywrites,
        viewerId,
        prefs: effectivePrefs,
        blockedUserIds,
        now: ts,
      });
    },
    [beaconState, effectivePrefs, skywrites],
  );

  const value = useMemo<SkywriteBeaconContextValue>(
    () => ({
      isLoaded,
      beaconState,
      syncBeacons,
      ignoreBeaconForViewer,
      respondBeaconForViewer,
      resolveAuthorBeacon,
      reactivateAuthorBeacon: reactivateAuthorBeaconFn,
      getLifecycle: (skywriteId: string) => beaconState.lifecycles[skywriteId],
      buildQueueForViewer,
    }),
    [
      beaconState,
      buildQueueForViewer,
      ignoreBeaconForViewer,
      isLoaded,
      reactivateAuthorBeaconFn,
      resolveAuthorBeacon,
      respondBeaconForViewer,
      syncBeacons,
    ],
  );

  return (
    <SkywriteBeaconContext.Provider value={value}>{children}</SkywriteBeaconContext.Provider>
  );
}

export function useSkywriteBeacon(): SkywriteBeaconContextValue {
  const ctx = useContext(SkywriteBeaconContext);
  if (!ctx) {
    throw new Error('useSkywriteBeacon must be used within SkywriteBeaconProvider');
  }
  return ctx;
}
