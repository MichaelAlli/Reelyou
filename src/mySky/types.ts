import type { SkywriteTextStyleId } from '@/constants/skywriteTextStyles';
import type { SkyEvolutionRecord, SkyGrowthProfile } from '@/mySky/skyEvolution';
import type { MySkyVisibleLayers } from '@/mySky/skyLayers';
import type {
  MySkyViewState,
  SkyNode,
  SkyPattern,
  SkyRelationship,
} from '@/mySky/skyNodeTypes';
import type { SkywriteMediaMode } from '@/skywrite/types';

/** @deprecated Prefer SkyNode — retained for list/card UI compatibility. */
export type MySkyItemType = 'skywrite' | 'moment' | 'connection' | 'contribution';

/** @deprecated Prefer SkyNode — retained for section lists on My Sky tab. */
export interface MySkyItem {
  id: string;
  type: MySkyItemType;
  title?: string;
  timestamp?: string;
  visibility?: string;
  constellationId?: string | null;
  sourceId?: string;
  mediaMode?: SkywriteMediaMode;
  textStyle?: SkywriteTextStyleId;
}

/** @deprecated Prefer SkyPattern — retained for pattern cards on My Sky tab. */
export interface MySkyConstellation {
  id: string;
  label: string;
  note: string;
  itemIds: string[];
}

/** Structured My Sky slice — local-first, backend-replaceable. */
export interface MySkyState {
  northStar: { originalVision: string };
  skyItems: MySkyItem[];
  constellations: MySkyConstellation[];
  connections: string[];
  contributions: string[];
}

/** Display-ready star — projected from SkyNode for canvas renderers. */
export interface MySkyStarDisplay extends MySkyItem {
  x: number;
  y: number;
  color: string;
  destination: 'skywrite' | 'public-sky' | null;
  destinationParam: string | null;
  /** Data-driven visual emphasis from SkyNode.visual */
  visualSize?: number;
  visualBrightness?: number;
  visualGlow?: number;
  isNewlyAdded?: boolean;
}

/** Full My Sky projection — data + render-ready display + view controls. */
export interface MySkyView extends MySkyState {
  /** Normalized sky graph — source of truth for positions and identity. */
  nodes: SkyNode[];
  relationships: SkyRelationship[];
  patterns: SkyPattern[];
  viewState: MySkyViewState;
  lastUpdatedAt: string;
  vitality: number;
  /** Derived growth signals — data-driven, not shown as gamification UI. */
  growthProfile: SkyGrowthProfile;
  /** Local evolution history — backend-handoff ready. */
  evolution: SkyEvolutionRecord;
  /** Derived display stars for canvas — do not mutate independently. */
  stars: MySkyStarDisplay[];
}

export const EMPTY_MY_SKY: MySkyState = {
  northStar: { originalVision: '' },
  skyItems: [],
  constellations: [],
  connections: [],
  contributions: [],
};

export type { MySkyVisibleLayers, MySkyViewState, SkyNode, SkyPattern, SkyRelationship };
