export type SkywriteVisibility = 'private' | 'orbit' | 'sky_friends' | 'public';

export interface StoredSkywriteVideoMeta {
  width?: number;
  height?: number;
  durationMs?: number;
  stageFit?: 'fit' | 'fill';
  framingOffsetX?: number;
  framingOffsetY?: number;
}

export interface StoredSkywriteMediaRefs {
  photoAssetId?: string | null;
  videoAssetId?: string | null;
  audioAssetId?: string | null;
  thumbnailAssetId?: string | null;
  videoMeta?: StoredSkywriteVideoMeta | null;
  originalVideoAudio?: 'on' | 'lower' | 'off';
  originalVideoVolume?: number;
  voiceoverVolume?: number;
}

export interface StoredSkywrite {
  id: string;
  authorUserId: string;
  text: string;
  createdAt: number;
  visibility: SkywriteVisibility;
  mediaMode: string;
  textStyle?: string;
  userHashtags?: string[];
  mood?: string | null;
  showingUp?: string | null;
  skyAreaId?: string;
  intent?: string;
  animateToSky?: boolean;
  allowAIContext?: boolean;
  experiencedAt?: string;
  media: StoredSkywriteMediaRefs;
  deletedAt: number | null;
  /** When set with deletedAt, active systems purge media after this timestamp. */
  deletionPurgeAfter?: number | null;
  /** UTC ms — visible in Skyreel until this time. */
  skyreelActiveUntilMs?: number | null;
  /** Last owner repost into Skyreel (UTC ms). */
  skyreelRepostedAtMs?: number | null;
  publishedAtMs?: number | null;
  recentVisibleUntilMs?: number | null;
  inYourJourney?: boolean | null;
  journeyAddedAtMs?: number | null;
}

export interface CreateSkywriteInput {
  id?: string;
  text?: string;
  visibility?: SkywriteVisibility;
  mediaMode?: string;
  textStyle?: string;
  userHashtags?: string[];
  mood?: string | null;
  showingUp?: string | null;
  skyAreaId?: string;
  intent?: string;
  animateToSky?: boolean;
  allowAIContext?: boolean;
  experiencedAt?: string;
  createdAt?: string;
  media?: StoredSkywriteMediaRefs;
  /** Asset ids uploaded in this publish request — must be owned by author and ready. */
  mediaAssetIds?: string[];
  inYourJourney?: boolean;
}
