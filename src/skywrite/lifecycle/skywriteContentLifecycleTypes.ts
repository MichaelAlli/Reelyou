import type { Privacy } from '@/types';

/** Minimum provenance kept after content deletion — no media/body. */
export interface SkywriteDeletionTombstone {
  skywriteId: string;
  ownerAuthorId: string;
  deletedAt: number;
  skyAreaId?: string;
  visibilitySnapshot?: Privacy;
  threadId?: string;
}

export interface SkywriteContentLifecycleView {
  isContentDeleted: (skywriteId: string) => boolean;
  tombstoneFor: (skywriteId: string) => SkywriteDeletionTombstone | undefined;
  isArchived: (skywriteId: string) => boolean;
}
