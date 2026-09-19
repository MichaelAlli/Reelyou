import type { MySkyVisibleLayers } from '@/mySky/skyLayers';

/** Provenance — explicit user data outranks inferred patterns. */
export type SkyProvenanceSource = 'explicit' | 'inferred' | 'system';

/** Origin entity for a node — distinct from display category (`SkyNodeType`). */
export type SkySourceType =
  | 'skywrite'
  | 'reflection'
  | 'community'
  | 'relationship'
  | 'growth'
  | 'impact'
  | 'guidance'
  | 'preference'
  | 'system';

/** Internal-only metadata — never surfaced as AI/diagnosis copy in UI. */
export interface SkyNodeMetadata {
  mediaMode?: string;
  textStyle?: string;
  mood?: string;
  showingUp?: string;
  allowAIContext?: boolean;
  fixtureSeed?: boolean;
  [key: string]: string | boolean | number | undefined;
}

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
  | 'guidance'
  | 'identity';

/** Which conceptual layer this node belongs to for future toggles. */
export type SkyNodeLayer =
  | 'stars'
  | 'constellations'
  | 'communities'
  | 'connections'
  | 'growth'
  | 'impact'
  | 'guidance'
  | 'identity';

export interface SkyNodePosition {
  x: number;
  y: number;
}

/** Data-driven visual emphasis — consumed by skyVisualRules, not scattered in components. */
export interface SkyNodeVisual {
  size: number;
  brightness: number;
  /** Glow intensity — alias conceptually as glowIntensity in API contracts. */
  glow: number;
  opacity: number;
  emphasis: number;
  color: string;
  colorFamily?: string;
}

export interface SkyNode {
  id: string;
  type: SkyNodeType;
  /** Origin entity — e.g. skywrite post id lives in sourceId when sourceType is skywrite. */
  sourceType: SkySourceType;
  sourceId?: string;
  layer: SkyNodeLayer;
  createdAt: string;
  position: SkyNodePosition;
  visual: SkyNodeVisual;
  /** True when authored directly by the user (Skywrite, explicit join, etc.). */
  userGenerated: boolean;
  /** True when derived from future inference — explicit user data always wins. */
  inferred: boolean;
  userDefined?: boolean;
  provenance: SkyProvenance;
  destination?: 'skywrite' | 'public-sky' | 'community' | 'starpath' | 'impact' | null;
  destinationParam?: string | null;
  title?: string;
  visibility?: string;
  patternId?: string | null;
  /** Internal metadata only — not shown in UI. */
  metadata?: SkyNodeMetadata;
}

export function nodeGlowIntensity(node: SkyNode): number {
  return node.visual.glow;
}

export function isExplicitSkyNode(node: SkyNode): boolean {
  return node.provenance.source === 'explicit' && !node.inferred;
}

export function isInferredSkyNode(node: SkyNode): boolean {
  return node.inferred || node.provenance.source === 'inferred';
}

export type SkyPatternStatus = 'possible' | 'emerging' | 'established';

/** Pattern grouping — explicit or inferred; user remains authoritative. */
export interface SkyPattern {
  id: string;
  nodeIds: string[];
  label?: string;
  note?: string;
  /** Optional constellation-level visibility — inherited from owner settings. */
  visibility?: string;
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
