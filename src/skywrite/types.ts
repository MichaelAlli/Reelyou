import type { SkywriteShowingUpId } from '@/constants/skywriteCopy';
export type SkywriteIntentId = 'reflection' | 'question' | 'perspective' | 'learned';
import type { SkywriteTextStyleId } from '@/constants/skywriteTextStyles';
import type { SkyAreaCategoryId } from '@/skyAreas/skyAreaCategory';
import type { Mood, Privacy } from '@/types';

export type SkywriteMediaMode =
  | 'text'
  | 'text_voiceover'
  | 'photo'
  | 'voice'
  | 'photo_voiceover'
  | 'video'
  | 'video_voiceover';

export type SkywriteVideoOriginalAudioState = 'on' | 'lower' | 'off';

export interface SkywritePhotoMedia {
  uri: string;
  /** Server object-storage asset — durable across devices when auth + API are configured. */
  remoteAssetId?: string;
  width?: number;
  height?: number;
}

export interface SkywriteVideoMedia {
  uri: string;
  remoteAssetId?: string;
  width?: number;
  height?: number;
  durationMs?: number;
  /** Square list preview — generated at publish when possible. */
  thumbnailUri?: string;
  /** fit = full frame visible; fill = cover stage with pannable overflow. */
  stageFit?: 'fit' | 'fill';
  /** Normalized pan from center (-1..1) when stageFit is fill. */
  framingOffsetX?: number;
  framingOffsetY?: number;
}

export interface SkywriteAudioMedia {
  uri: string;
  remoteAssetId?: string;
  durationMs?: number;
}

export interface SkywriteMedia {
  photo: SkywritePhotoMedia | null;
  video: SkywriteVideoMedia | null;
  audio: SkywriteAudioMedia | null;
  /** Beta: how original video audio mixes with a recorded voiceover. */
  originalVideoAudio?: SkywriteVideoOriginalAudioState;
  /** 0–1 original video track level (independent of voiceover). */
  originalVideoVolume?: number;
  /** 0–1 voiceover level (independent of original video). */
  voiceoverVolume?: number;
}

/** User-authored Skywrite — explicit hashtags stored separately from inferred themes. */
export interface SkywriteRecord {
  id: string;
  /** Owner of the Skywrite — required for beacon routing and thread authorship. */
  authorId?: string;
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
  /** Explicit primary Sky Area id (default category or custom-*). User-selected only. */
  skyAreaId?: string;
  /** When the lived experience occurred — optional; defaults to createdAt for timeline. */
  experiencedAt?: string;
  /** Lightweight intent for beacon routing — explicit choice wins over showingUp inference. */
  intent?: SkywriteIntentId;
  createdAt: string;
  /** UTC ms — original successful publication (immutable). */
  publishedAtMs?: number;
  /** UTC ms — owner Recent visibility ends (30d from publication; not reset by SkyReel repost). */
  recentVisibleUntilMs?: number;
  /** Owner chose Your Journey — kept until user deletes. */
  inYourJourney?: boolean;
  /** UTC ms — when added to Your Journey (publish or later). */
  journeyAddedAtMs?: number | null;
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
  skyAreaId?: string;
  intent?: SkywriteIntentId;
  /** Pre-publish: preserve in Your Journey (unchecked by default). */
  addToYourJourney?: boolean;
}

export interface SkywritesState {
  posts: SkywriteRecord[];
}

export const EMPTY_SKYWRITE_MEDIA: SkywriteMedia = {
  photo: null,
  video: null,
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
