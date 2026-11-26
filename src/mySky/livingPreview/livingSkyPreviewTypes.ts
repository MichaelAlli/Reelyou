import type { SkywriteRecord } from '@/skywrite/types';

/** One living preview is tied to an existing skywrite star. It is not a new star. */
export type LivingSkyPreviewPresentation = 'photo' | 'video' | 'video-fallback' | 'text';

export interface LivingSkyPreviewStarRef {
  id: string;
  type: string;
  sourceId?: string;
  x: number;
  y: number;
  color: string;
  title?: string;
}

export interface LivingSkyPreviewAccess {
  viewerId: string;
  viewerFollowsAuthor: boolean;
  authorFollowsViewer: boolean;
  viewerBlockedAuthor: boolean;
  authorBlockedViewer?: boolean;
}

export interface LivingSkyPreviewMoment {
  postId: string;
  starId: string;
  starX: number;
  starY: number;
  starColor: string;
  presentation: LivingSkyPreviewPresentation;
  imageUri: string | null;
  text: string;
  label: string;
}

export interface LivingSkyPreviewSelection {
  mode: 'automatic' | 'manual';
  moments: LivingSkyPreviewMoment[];
}

export interface LivingSkyPreviewSelectionInput {
  stars: readonly LivingSkyPreviewStarRef[];
  posts: readonly SkywriteRecord[];
  skyOwnerId: string;
  /** True only when the signed-in viewer owns this sky. */
  viewerIsOwner: boolean;
  access: LivingSkyPreviewAccess;
  /**
   * null = automatic.
   * A list is the owner's explicit order (already capped). Ineligible ids are dropped.
   */
  manualIds: readonly string[] | null;
  unavailableIds?: ReadonlySet<string>;
  nowMs?: number;
}
