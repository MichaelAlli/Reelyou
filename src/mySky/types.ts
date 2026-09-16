import type { SkywriteMediaMode } from '@/skywrite/types';

/** Sky item categories — backend-replaceable star/moment types. */
export type MySkyItemType = 'skywrite' | 'moment' | 'connection' | 'contribution';

export interface MySkyItem {
  id: string;
  type: MySkyItemType;
  title?: string;
  timestamp?: string;
  visibility?: string;
  constellationId?: string | null;
  /** Source Skywrite id when this star represents a Skywrite moment. */
  sourceId?: string;
  mediaMode?: SkywriteMediaMode;
}

/** Personal pattern grouping within one user's journey — not a community. */
export interface MySkyConstellation {
  id: string;
  label: string;
  /** Neutral pattern language — no diagnostic claims. */
  note: string;
  itemIds: string[];
}

/** Structured My Sky slice — local-first, AI-context ready. */
export interface MySkyState {
  northStar: { originalVision: string };
  skyItems: MySkyItem[];
  constellations: MySkyConstellation[];
  connections: string[];
  contributions: string[];
}

/** Display-ready star for the immersive canvas. */
export interface MySkyStarDisplay extends MySkyItem {
  x: number;
  y: number;
  color: string;
  destination: 'skywrite' | 'public-sky' | null;
  destinationParam: string | null;
}

export interface MySkyView extends MySkyState {
  stars: MySkyStarDisplay[];
}

export const EMPTY_MY_SKY: MySkyState = {
  northStar: { originalVision: '' },
  skyItems: [],
  constellations: [],
  connections: [],
  contributions: [],
};
