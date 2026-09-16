import type { Mood, Privacy } from '@/types';

/** User-authored Skywrite — explicit hashtags stored separately from inferred themes. */
export interface SkywriteRecord {
  id: string;
  text: string;
  media: null;
  visibility: Privacy;
  mood: Mood | null;
  /** Explicit user-authored hashtags parsed from text — lowercase, deduped. */
  userHashtags: string[];
  createdAt: string;
}

export interface SkywriteDraft {
  text: string;
  visibility: Privacy;
  mood: Mood | null;
  userHashtags: string[];
}

export interface SkywritesState {
  posts: SkywriteRecord[];
}

export const EMPTY_SKYWRITES: SkywritesState = {
  posts: [],
};
