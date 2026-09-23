import type { HumanPotentialEvidenceRecord } from '@/humanPotential/humanPotentialEvidenceTypes';
import type { Privacy } from '@/types';

export type SavedThreadStatus = 'active' | 'archived';

export type GrowthMicroChoice = 'yes' | 'a_little' | 'not_really' | 'skip';

export type GrowthMomentKind =
  | 'stayed_with_me'
  | 'used_this'
  | 'see_differently'
  | 'less_alone'
  | 'hope'
  | 'perspective'
  | 'freeform';

export type GrowthEmotionalTag = 'less_alone' | 'hope' | 'supported' | 'direction';

export interface SavedThreadRecord {
  savedThreadId: string;
  ownerUserId: string;
  skywriteId: string;
  threadId: string;
  skyAreaId: string | null;
  originalAuthorId: string;
  visibilitySnapshot: Privacy;
  savedAt: number;
  lastVisitedAt: number;
  visitCount: number;
  archivedAt: number | null;
  status: SavedThreadStatus;
  createdAt: number;
  updatedAt: number;
}

export interface ThreadReflectionRecord {
  reflectionId: string;
  savedThreadId: string;
  authorUserId: string;
  body: string;
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
  /** Owner-only private layer — never public. */
  visibility: 'private';
  momentKind: GrowthMomentKind;
  microChoice?: GrowthMicroChoice;
  audioUri?: string | null;
  audioDurationMs?: number | null;
  emotionalTags?: GrowthEmotionalTag[];
  sourceResponseId?: string;
  sourceContributionId?: string;
}

export interface SavedThreadsState {
  savedThreads: SavedThreadRecord[];
  reflections: ThreadReflectionRecord[];
  evidence: HumanPotentialEvidenceRecord[];
  updatedAt: number;
}

export const EMPTY_SAVED_THREADS_STATE: SavedThreadsState = {
  savedThreads: [],
  reflections: [],
  evidence: [],
  updatedAt: 0,
};

export function savedThreadIdFor(ownerUserId: string, skywriteId: string): string {
  return `st-${ownerUserId}-${skywriteId}`;
}

export function reflectionIdFor(savedThreadId: string, createdAt: number): string {
  return `refl-${savedThreadId}-${createdAt}`;
}
