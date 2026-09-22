import type { SkywriteShowingUpId } from '@/constants/skywriteCopy';
import type { SkywriteTextStyleId } from '@/constants/skywriteTextStyles';
import type { SkyAreaCategoryId } from '@/skyAreas/skyAreaCategory';
import type { Mood, Privacy } from '@/types';

export type SkywriteMediaMode = 'text' | 'photo' | 'voice' | 'photo_voiceover';

export interface SkywritePhotoMedia {
  uri: string;
  width?: number;
  height?: number;
}

export interface SkywriteAudioMedia {
  uri: string;
  durationMs?: number;
}

export interface SkywriteMedia {
  photo: SkywritePhotoMedia | null;
  audio: SkywriteAudioMedia | null;
}

/** User-authored Skywrite — explicit hashtags stored separately from inferred themes. */
export interface SkywriteRecord {
  id: string;
  text: string;
  textStyle: SkywriteTextStyleId;
  media: SkywriteMedia;
  mediaMode: SkywriteMediaMode;
  visibility: Privacy;
  mood: Mood | null;
  /** Optional reflection type selected during posting. */
  showingUp: SkywriteShowingUpId | null;
  /** Explicit user-authored hashtags parsed from text — lowercase, deduped. */
  userHashtags: string[];
  /** Whether the user requested the post-share star animation handoff. */
  animateToSky: boolean;
  /** Per-Skywrite consent for AI personalization signals. */
  allowAIContext: boolean;
  /** Canonical Where You Live / beacon / profile category id. */
  skyAreaId?: SkyAreaCategoryId;
  createdAt: string;
}

export interface SkywriteDraft {
  text: string;
  textStyle?: SkywriteTextStyleId;
  media: SkywriteMedia;
  visibility: Privacy;
  mood: Mood | null;
  showingUp?: SkywriteShowingUpId | null;
  userHashtags: string[];
  animateToSky?: boolean;
  allowAIContext?: boolean;
  skyAreaId?: SkyAreaCategoryId;
}

export interface SkywritesState {
  posts: SkywriteRecord[];
}

export const EMPTY_SKYWRITE_MEDIA: SkywriteMedia = {
  photo: null,
  audio: null,
};

export const EMPTY_SKYWRITES: SkywritesState = {
  posts: [],
};

/** Handoff payload for a future Skywrite → My Sky animation phase. */
export interface SkywriteCreateHandoff {
  skywriteCreated: true;
  createdSkywriteId: string;
  animateToSky: boolean;
  mediaMode: SkywriteMediaMode;
}
