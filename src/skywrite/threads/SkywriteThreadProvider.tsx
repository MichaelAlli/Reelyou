import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { ContributionRecord } from '@/contributions/contributionTypes';
import { currentUser } from '@/data/mockData';
import {
  addSkywriteResponse,
  authorSaveResponse,
  authorUnsaveResponse,
  markBeaconIgnored,
  responsesForSkywrite,
} from '@/skywrite/threads/skywriteThreadLogic';
import {
  loadContributionRecords,
  loadSkywriteThreadState,
  saveContributionRecords,
  saveSkywriteThreadState,
} from '@/skywrite/threads/skywriteThreadPersistence';
import type { SkywriteResponseRecord, SkywriteThreadState } from '@/skywrite/threads/skywriteThreadTypes';
import { EMPTY_SKYWRITE_THREAD_STATE } from '@/skywrite/threads/skywriteThreadTypes';
import { useSkywriteBeacon } from '@/skywrite/beacon/SkywriteBeaconProvider';

interface SkywriteThreadContextValue {
  isLoaded: boolean;
  threadState: SkywriteThreadState;
  contributions: ContributionRecord[];
  activeContributions: ContributionRecord[];
  getResponses: (skywriteId: string) => SkywriteResponseRecord[];
  addResponse: (skywriteId: string, body: string) => SkywriteResponseRecord | null;
  ignoreBeacon: (skywriteId: string) => void;
  saveResponseAsAuthor: (params: {
    skywriteId: string;
    responseId: string;
    authorId: string;
    skyAreaId: string;
  }) => void;
  unsaveResponseAsAuthor: (skywriteId: string, responseId: string) => void;
  hasBeaconEngagement: (skywriteId: string) => boolean;
}

const SkywriteThreadContext = createContext<SkywriteThreadContextValue | null>(null);

function SkywriteThreadProviderInner({ children }: { children: ReactNode }) {
  const { ignoreBeaconForViewer, respondBeaconForViewer } = useSkywriteBeacon();
  const [threadState, setThreadState] = useState<SkywriteThreadState>(EMPTY_SKYWRITE_THREAD_STATE);
  const [contributions, setContributions] = useState<ContributionRecord[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    void Promise.all([loadSkywriteThreadState(), loadContributionRecords()]).then(
      ([threads, contrib]) => {
        if (!mounted) return;
        setThreadState(threads);
        setContributions(contrib);
        setIsLoaded(true);
      },
    );
    return () => {
      mounted = false;
    };
  }, []);

  const persistThreads = useCallback((next: SkywriteThreadState) => {
    setThreadState(next);
    void saveSkywriteThreadState(next);
  }, []);

  const persistContributions = useCallback((next: ContributionRecord[]) => {
    setContributions(next);
    void saveContributionRecords(next);
  }, []);

  const getResponses = useCallback(
    (skywriteId: string) => responsesForSkywrite(threadState, skywriteId),
    [threadState],
  );

  const addResponse = useCallback(
    (skywriteId: string, body: string) => {
      const trimmed = body.trim();
      if (!trimmed) return null;
      const result = addSkywriteResponse(threadState, {
        skywriteId,
        responderId: currentUser.id,
        body: trimmed,
      });
      persistThreads(result.state);
      respondBeaconForViewer(skywriteId);
      return result.response;
    },
    [persistThreads, respondBeaconForViewer, threadState],
  );

  const ignoreBeacon = useCallback(
    (skywriteId: string) => {
      persistThreads(markBeaconIgnored(threadState, skywriteId));
      ignoreBeaconForViewer(skywriteId);
    },
    [ignoreBeaconForViewer, persistThreads, threadState],
  );

  const saveResponseAsAuthor = useCallback(
    (params: {
      skywriteId: string;
      responseId: string;
      authorId: string;
      skyAreaId: string;
    }) => {
      const result = authorSaveResponse(
        threadState,
        params.skywriteId,
        params.responseId,
        params.skyAreaId,
        params.authorId,
        contributions,
      );
      persistThreads(result.state);
      persistContributions(result.contributions);
    },
    [contributions, persistContributions, persistThreads, threadState],
  );

  const unsaveResponseAsAuthor = useCallback(
    (skywriteId: string, responseId: string) => {
      const result = authorUnsaveResponse(threadState, skywriteId, responseId, contributions);
      persistThreads(result.state);
      persistContributions(result.contributions);
    },
    [contributions, persistContributions, persistThreads, threadState],
  );

  const hasBeaconEngagement = useCallback(
    (skywriteId: string) => Boolean(threadState.beaconEngagementBySkywriteId[skywriteId]),
    [threadState.beaconEngagementBySkywriteId],
  );

  const activeContributions = useMemo(
    () => contributions.filter((entry) => entry.state === 'active'),
    [contributions],
  );

  const value = useMemo<SkywriteThreadContextValue>(
    () => ({
      isLoaded,
      threadState,
      contributions,
      activeContributions,
      getResponses,
      addResponse,
      ignoreBeacon,
      saveResponseAsAuthor,
      unsaveResponseAsAuthor,
      hasBeaconEngagement,
    }),
    [
      activeContributions,
      addResponse,
      contributions,
      getResponses,
      hasBeaconEngagement,
      ignoreBeacon,
      isLoaded,
      saveResponseAsAuthor,
      threadState,
      unsaveResponseAsAuthor,
    ],
  );

  return (
    <SkywriteThreadContext.Provider value={value}>{children}</SkywriteThreadContext.Provider>
  );
}

export function SkywriteThreadProvider({ children }: { children: ReactNode }) {
  return <SkywriteThreadProviderInner>{children}</SkywriteThreadProviderInner>;
}

export function useSkywriteThreads(): SkywriteThreadContextValue {
  const ctx = useContext(SkywriteThreadContext);
  if (!ctx) {
    throw new Error('useSkywriteThreads must be used within SkywriteThreadProvider');
  }
  return ctx;
}
