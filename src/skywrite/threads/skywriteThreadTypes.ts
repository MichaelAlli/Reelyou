import type { Privacy } from '@/types';

export type SkywriteBeaconEngagement = 'ignored' | 'responded';

export interface SkywriteResponseRecord {
  responseId: string;
  skywriteId: string;
  threadId: string;
  responderId: string;
  body: string;
  createdAt: number;
  visibility: Privacy;
  savedByAuthor: boolean;
  savedAt: number | null;
}

export interface SkywriteThreadState {
  responses: SkywriteResponseRecord[];
  beaconEngagementBySkywriteId: Record<string, SkywriteBeaconEngagement>;
  updatedAt: number;
}

export const EMPTY_SKYWRITE_THREAD_STATE: SkywriteThreadState = {
  responses: [],
  beaconEngagementBySkywriteId: {},
  updatedAt: 0,
};

export function threadIdForSkywrite(skywriteId: string): string {
  return `thread-${skywriteId}`;
}
