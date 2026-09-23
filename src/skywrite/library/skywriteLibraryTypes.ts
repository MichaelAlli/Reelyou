import type { SkywriteDeletionTombstone } from '@/skywrite/lifecycle/skywriteContentLifecycleTypes';

export interface SkywriteLibraryState {
  /** Owner-archived Skywrite ids — archive is rest, not delete. */
  archivedAtBySkywriteId: Record<string, number>;
  /** Soft-delete tombstones — content hidden, minimal provenance preserved. */
  deletionTombstonesBySkywriteId: Record<string, SkywriteDeletionTombstone>;
  updatedAt: number;
}

export const EMPTY_SKYWRITE_LIBRARY_STATE: SkywriteLibraryState = {
  archivedAtBySkywriteId: {},
  deletionTombstonesBySkywriteId: {},
  updatedAt: 0,
};
