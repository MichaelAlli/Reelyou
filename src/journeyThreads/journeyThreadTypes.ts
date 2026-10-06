/** Internal future journey themes — neutral naming (not “Silver Linings” in schema). */

export type JourneyThreadOrigin = 'manual' | 'ai_suggested' | 'saved_thread_migration';

export type JourneyThreadStatus = 'active' | 'archived' | 'hidden';

export interface JourneyThreadRecord {
  id: string;
  ownerUserId: string;
  title: string;
  summary?: string;
  origin: JourneyThreadOrigin;
  createdAt: number;
  updatedAt: number;
  status: JourneyThreadStatus;
  /** Many Skywrites may belong to one thread. */
  skywriteIds: string[];
  representativeSkywriteId?: string;
  userEditedTitle?: boolean;
  confidence?: number;
  themeMetadata?: Record<string, string>;
}

/** Many-to-many — one Skywrite may appear in multiple threads. */
export interface JourneyThreadMembership {
  threadId: string;
  skywriteId: string;
  addedAt: number;
  origin: JourneyThreadOrigin;
}

export interface JourneyThreadsState {
  threads: JourneyThreadRecord[];
  memberships: JourneyThreadMembership[];
  updatedAt: number;
}

export const EMPTY_JOURNEY_THREADS_STATE: JourneyThreadsState = {
  threads: [],
  memberships: [],
  updatedAt: 0,
};
