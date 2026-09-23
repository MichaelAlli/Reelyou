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
import type { SkywriteRecord } from '@/skywrite/types';
import {
  addThreadReflection,
  archiveSavedThread,
  deleteThreadReflection,
  findSavedThread,
  markSavedThreadVisited,
  restoreSavedThread,
  saveSkywriteThread,
  unsaveThread,
  updateThreadReflection,
} from '@/skywrite/savedThreads/savedThreadLogic';
import {
  loadSavedThreadsState,
  saveSavedThreadsState,
} from '@/skywrite/savedThreads/savedThreadPersistence';
import type { HumanPotentialEvidenceRecord } from '@/humanPotential/humanPotentialEvidenceTypes';
import type {
  SavedThreadRecord,
  SavedThreadsState,
  ThreadReflectionRecord,
} from '@/skywrite/savedThreads/savedThreadTypes';
import { SavedThreadsCopy } from '@/constants/savedThreadsCopy';
import { EMPTY_SAVED_THREADS_STATE } from '@/skywrite/savedThreads/savedThreadTypes';

interface SavedThreadsContextValue {
  isLoaded: boolean;
  state: SavedThreadsState;
  getSavedForSkywrite: (skywriteId: string) => SavedThreadRecord | undefined;
  isThreadSaved: (skywriteId: string) => boolean;
  saveThread: (skywrite: SkywriteRecord & { authorId: string }) => SavedThreadRecord;
  unsaveThreadById: (savedThreadId: string, purgeReflections?: boolean) => void;
  archiveThread: (savedThreadId: string) => void;
  restoreThread: (savedThreadId: string) => void;
  markVisited: (savedThreadId: string) => void;
  addReflection: (params: {
    savedThreadId: string;
    body: string;
    momentKind?: ThreadReflectionRecord['momentKind'];
    microChoice?: ThreadReflectionRecord['microChoice'];
    audioUri?: string | null;
    audioDurationMs?: number | null;
    emotionalTags?: ThreadReflectionRecord['emotionalTags'];
    sourceResponseId?: string;
    sourceContributionId?: string;
  }) => ThreadReflectionRecord | null;
  editReflection: (reflectionId: string, body: string) => void;
  removeReflection: (reflectionId: string) => void;
  reflectionsFor: (savedThreadId: string) => ThreadReflectionRecord[];
  replaceEvidence: (records: HumanPotentialEvidenceRecord[]) => void;
}

const SavedThreadsContext = createContext<SavedThreadsContextValue | null>(null);

export function SavedThreadsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SavedThreadsState>(EMPTY_SAVED_THREADS_STATE);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    void loadSavedThreadsState().then((loaded) => {
      if (!mounted) return;
      setState(loaded);
      setIsLoaded(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const persist = useCallback((next: SavedThreadsState) => {
    setState(next);
    void saveSavedThreadsState(next);
  }, []);

  const getSavedForSkywrite = useCallback(
    (skywriteId: string) => findSavedThread(state, currentUser.id, skywriteId),
    [state],
  );

  const isThreadSaved = useCallback(
    (skywriteId: string) => {
      const entry = findSavedThread(state, currentUser.id, skywriteId);
      return Boolean(entry && entry.status === 'active');
    },
    [state],
  );

  const saveThread = useCallback(
    (skywrite: SkywriteRecord & { authorId: string }) => {
      const result = saveSkywriteThread({
        state,
        ownerUserId: currentUser.id,
        skywrite,
      });
      persist(result.state);
      return result.saved;
    },
    [persist, state],
  );

  const unsaveThreadById = useCallback(
    (savedThreadId: string, purgeReflections = false) => {
      persist(unsaveThread(state, savedThreadId, { purgeReflections }));
    },
    [persist, state],
  );

  const archiveThread = useCallback(
    (savedThreadId: string) => {
      persist(archiveSavedThread(state, savedThreadId));
    },
    [persist, state],
  );

  const restoreThread = useCallback(
    (savedThreadId: string) => {
      persist(restoreSavedThread(state, savedThreadId));
    },
    [persist, state],
  );

  const markVisited = useCallback(
    (savedThreadId: string) => {
      persist(markSavedThreadVisited(state, savedThreadId));
    },
    [persist, state],
  );

  const addReflection = useCallback(
    (params: {
      savedThreadId: string;
      body: string;
      momentKind?: ThreadReflectionRecord['momentKind'];
      microChoice?: ThreadReflectionRecord['microChoice'];
      audioUri?: string | null;
      audioDurationMs?: number | null;
      emotionalTags?: ThreadReflectionRecord['emotionalTags'];
      sourceResponseId?: string;
      sourceContributionId?: string;
    }) => {
      const trimmed = params.body.trim();
      if (!trimmed && !params.audioUri) return null;
      const result = addThreadReflection({
        state,
        savedThreadId: params.savedThreadId,
        authorUserId: currentUser.id,
        body: trimmed || SavedThreadsCopy.voiceMomentLabel,
        momentKind: params.momentKind,
        microChoice: params.microChoice,
        audioUri: params.audioUri,
        audioDurationMs: params.audioDurationMs,
        emotionalTags: params.emotionalTags,
        sourceResponseId: params.sourceResponseId,
        sourceContributionId: params.sourceContributionId,
      });
      persist(result.state);
      return result.reflection;
    },
    [persist, state],
  );

  const replaceEvidence = useCallback(
    (records: HumanPotentialEvidenceRecord[]) => {
      persist({ ...state, evidence: records, updatedAt: Date.now() });
    },
    [persist, state],
  );

  const editReflection = useCallback(
    (reflectionId: string, body: string) => {
      persist(updateThreadReflection(state, reflectionId, body));
    },
    [persist, state],
  );

  const removeReflection = useCallback(
    (reflectionId: string) => {
      persist(deleteThreadReflection(state, reflectionId));
    },
    [persist, state],
  );

  const reflectionsFor = useCallback(
    (savedThreadId: string) =>
      state.reflections
        .filter((entry) => entry.savedThreadId === savedThreadId && entry.deletedAt == null)
        .sort((a, b) => a.createdAt - b.createdAt),
    [state.reflections],
  );

  const value = useMemo<SavedThreadsContextValue>(
    () => ({
      isLoaded,
      state,
      getSavedForSkywrite,
      isThreadSaved,
      saveThread,
      unsaveThreadById,
      archiveThread,
      restoreThread,
      markVisited,
      addReflection,
      editReflection,
      removeReflection,
      reflectionsFor,
      replaceEvidence,
    }),
    [
      addReflection,
      archiveThread,
      editReflection,
      getSavedForSkywrite,
      isLoaded,
      isThreadSaved,
      markVisited,
      reflectionsFor,
      removeReflection,
      replaceEvidence,
      restoreThread,
      saveThread,
      state,
      unsaveThreadById,
    ],
  );

  return (
    <SavedThreadsContext.Provider value={value}>{children}</SavedThreadsContext.Provider>
  );
}

export function useSavedThreads(): SavedThreadsContextValue {
  const ctx = useContext(SavedThreadsContext);
  if (!ctx) {
    throw new Error('useSavedThreads must be used within SavedThreadsProvider');
  }
  return ctx;
}
