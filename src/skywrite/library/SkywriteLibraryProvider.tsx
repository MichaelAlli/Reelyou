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
  buildSkywriteLifecycleView,
  createDeletionTombstone,
} from '@/skywrite/lifecycle/skywriteContentLifecycle';
import type {
  SkywriteContentLifecycleView,
  SkywriteDeletionTombstone,
} from '@/skywrite/lifecycle/skywriteContentLifecycleTypes';
import {
  loadSkywriteLibraryState,
  saveSkywriteLibraryState,
} from '@/skywrite/library/skywriteLibraryPersistence';
import {
  EMPTY_SKYWRITE_LIBRARY_STATE,
  type SkywriteLibraryState,
} from '@/skywrite/library/skywriteLibraryTypes';
import type { SkywriteRecord } from '@/skywrite/types';

interface SkywriteLibraryContextValue {
  isLoaded: boolean;
  library: SkywriteLibraryState;
  lifecycle: SkywriteContentLifecycleView;
  archiveSkywrite: (skywriteId: string) => void;
  restoreSkywrite: (skywriteId: string) => void;
  isArchived: (skywriteId: string) => boolean;
  isContentDeleted: (skywriteId: string) => boolean;
  tombstoneFor: (skywriteId: string) => SkywriteDeletionTombstone | undefined;
  deleteSkywriteContent: (post: SkywriteRecord & { authorId: string }) => void;
}

const SkywriteLibraryContext = createContext<SkywriteLibraryContextValue | null>(null);

export function SkywriteLibraryProvider({ children }: { children: ReactNode }) {
  const [library, setLibrary] = useState<SkywriteLibraryState>(EMPTY_SKYWRITE_LIBRARY_STATE);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    void loadSkywriteLibraryState().then((loaded) => {
      if (!mounted) return;
      setLibrary(loaded);
      setIsLoaded(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const persist = useCallback((next: SkywriteLibraryState) => {
    setLibrary(next);
    void saveSkywriteLibraryState(next);
  }, []);

  const archiveSkywrite = useCallback(
    (skywriteId: string) => {
      const now = Date.now();
      persist({
        ...library,
        archivedAtBySkywriteId: { ...library.archivedAtBySkywriteId, [skywriteId]: now },
        updatedAt: now,
      });
    },
    [library, persist],
  );

  const restoreSkywrite = useCallback(
    (skywriteId: string) => {
      const nextArchived = { ...library.archivedAtBySkywriteId };
      delete nextArchived[skywriteId];
      persist({
        ...library,
        archivedAtBySkywriteId: nextArchived,
        updatedAt: Date.now(),
      });
    },
    [library, persist],
  );

  const isArchived = useCallback(
    (skywriteId: string) => typeof library.archivedAtBySkywriteId[skywriteId] === 'number',
    [library.archivedAtBySkywriteId],
  );

  const lifecycle = useMemo(() => buildSkywriteLifecycleView(library), [library]);

  const isContentDeleted = useCallback(
    (skywriteId: string) => lifecycle.isContentDeleted(skywriteId),
    [lifecycle],
  );

  const tombstoneFor = useCallback(
    (skywriteId: string) => lifecycle.tombstoneFor(skywriteId),
    [lifecycle],
  );

  const deleteSkywriteContent = useCallback(
    (post: SkywriteRecord & { authorId: string }) => {
      if (lifecycle.isContentDeleted(post.id)) return;
      const now = Date.now();
      const tombstone = createDeletionTombstone(post, now);
      persist({
        ...library,
        deletionTombstonesBySkywriteId: {
          ...library.deletionTombstonesBySkywriteId,
          [post.id]: tombstone,
        },
        updatedAt: now,
      });
    },
    [library, lifecycle, persist],
  );

  const value = useMemo<SkywriteLibraryContextValue>(
    () => ({
      isLoaded,
      library,
      lifecycle,
      archiveSkywrite,
      restoreSkywrite,
      isArchived,
      isContentDeleted,
      tombstoneFor,
      deleteSkywriteContent,
    }),
    [
      archiveSkywrite,
      deleteSkywriteContent,
      isArchived,
      isContentDeleted,
      isLoaded,
      library,
      lifecycle,
      restoreSkywrite,
      tombstoneFor,
    ],
  );

  return (
    <SkywriteLibraryContext.Provider value={value}>{children}</SkywriteLibraryContext.Provider>
  );
}

export function useSkywriteLibrary(): SkywriteLibraryContextValue {
  const ctx = useContext(SkywriteLibraryContext);
  if (!ctx) {
    throw new Error('useSkywriteLibrary must be used within SkywriteLibraryProvider');
  }
  return ctx;
}
