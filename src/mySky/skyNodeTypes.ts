import type { MySkyVisibleLayers } from '@/mySky/skyLayers';

/** Provenance — explicit user data outranks inferred patterns. */
export type SkyProvenanceSource = 'explicit' | 'inferred' | 'system';

export interface SkyProvenance {
  source: SkyProvenanceSource;
  /** Internal note — never shown as confidence/diagnosis in UI. */
  reason?: string;
}

export type SkyNodeType =
  | 'skywrite'
  | 'reflection'
  | 'community'
  | 'relationship'
  | 'growth'
  | 'impact'
  | 'guidance';

/** Which conceptual layer this node belongs to for future toggles. */
export type SkyNodeLayer =
  | 'stars'
  | 'constellations'
  | 'communities'
  | 'connections'
  | 'growth'
  | 'impact'
  | 'guidance';

export interface SkyNodePosition {
  x: number;
  y: number;
}

/** Data-driven visual emphasis — consumed by skyVisualRules, not scattered in components. */
export interface SkyNodeVisual {
  size: number;
  brightness: number;
  glow: number;
  opacity: number;
  emphasis: number;
  color: string;
  colorFamily?: string;
}

export interface SkyNode {
  id: string;
  type: SkyNodeType;
  layer: SkyNodeLayer;
  sourceId?: string;
  createdAt: string;
  position: SkyNodePosition;
  visual: SkyNodeVisual;
  userDefined?: boolean;
  provenance: SkyProvenance;
  destination?: 'skywrite' | 'public-sky' | null;
  destinationParam?: string | null;
  title?: string;
  visibility?: string;
  patternId?: string | null;
}

export type SkyPatternStatus = 'possible' | 'emerging' | 'established';

/** Pattern grouping — explicit or inferred; user remains authoritative. */
export interface SkyPattern {
  id: string;
  nodeIds: string[];
  label?: string;
  note?: string;
  source: 'explicit' | 'inferred';
  status: SkyPatternStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SkyRelationship {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  patternId?: string;
  source: 'explicit' | 'inferred';
}

export interface MySkyViewState {
  visibleLayers: MySkyVisibleLayers;
  /** Future: active pattern reveal for gentle line animation. */
  revealPatternId: string | null;
}

/** Future event types — structured growth without a full engine yet. */
export const SKY_GROWTH_EVENT_TYPES = [
  'SKYWRITE_CREATED',
  'SKYWRITE_UPDATED',
  'COMMUNITY_JOINED',
  'COMMUNITY_LEFT',
  'FOCUS_SELECTED',
  'FOCUS_CLEARED',
  'REFLECTION_ADDED',
  'CONNECTION_FORMED',
  'PATTERN_ACCEPTED',
  'PATTERN_DISMISSED',
] as const;

export type SkyGrowthEventType = (typeof SKY_GROWTH_EVENT_TYPES)[number];

export interface SkyGrowthEvent {
  type: SkyGrowthEventType;
  nodeId?: string;
  patternId?: string;
  occurredAt: string;
}
