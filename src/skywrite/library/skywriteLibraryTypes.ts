export interface SkywriteLibraryState {
  /** Owner-archived Skywrite ids — archive is rest, not delete. */
  archivedAtBySkywriteId: Record<string, number>;
  updatedAt: number;
}

export const EMPTY_SKYWRITE_LIBRARY_STATE: SkywriteLibraryState = {
  archivedAtBySkywriteId: {},
  updatedAt: 0,
};
