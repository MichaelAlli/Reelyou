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
   * null = automatic highlights.
   * An array, including an empty one, is the owner's manual list.
   * Ineligible ids are dropped. Nothing is added to fill the list.
   */
  manualIds: readonly string[] | null;
  unavailableIds?: ReadonlySet<string>;
  nowMs?: number;
}
