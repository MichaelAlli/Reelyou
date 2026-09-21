import type { MySkyGraph, MySkySources } from '@/mySky/mySkyState';
import type { MySkyStarDisplay, MySkyView } from '@/mySky/types';
import type { SkyNode, SkyPattern } from '@/mySky/skyNodeTypes';

/** Canonical shared living Sky — one graph, multiple experience selectors. */
export interface SharedSkyState {
  sources: MySkySources;
  graph: MySkyGraph;
  /** Full My Sky projection — same IDs/stars as immersive view. */
  expandedView: MySkyView;
  patterns: SkyPattern[];
  builtAt: string;
}

export type FocusedSkyPinObjectType =
  | 'star'
  | 'constellation'
  | 'community'
  | 'skywrite'
  | 'connection'
  | 'opportunity'
  | 'theme';

export interface FocusedSkyPin {
  objectId: string;
  objectType: FocusedSkyPinObjectType;
  pinnedAt: string;
  /** Lower = higher in focused list. */
  userOrder: number;
}

export type EmergingGroupLifecycle =
  | 'hidden'
  | 'weak'
  | 'emerging'
  | 'visible'
  | 'joined'
  | 'dismissed';

/** Organic group possibility — references canonical pattern/community IDs only. */
export interface EmergingGroup {
  id: string;
  constellationId: string | null;
  patternId: string | null;
  communityId: string | null;
  memberNodeIds: string[];
  themeIds: string[];
  /** Internal band — never shown as score in UI. */
  strengthBand: 'low' | 'medium' | 'high';
  primaryReasonCodes: string[];
  lifecycle: EmergingGroupLifecycle;
  joined: boolean;
  dismissed: boolean;
  createdAt: string;
  updatedAt: string;
  lastSurfacedAt: string | null;
  /** Plain-language “Why this?” — safe copy only. */
  whyThis: string;
  title: string;
}

export type FocusedSkySectionKind =
  | 'snapshot'
  | 'pinned'
  | 'joined'
  | 'emerging'
  | 'recent'
  | 'participation'
  | 'opportunity'
  | 'peace';

export interface FocusedSkySection {
  id: string;
  kind: FocusedSkySectionKind;
  title: string;
  nodeIds: string[];
  groupIds: string[];
}

/** Derived focused experience — finite vertical snapshot over shared graph. */
export interface FocusedSkyView {
  shared: SharedSkyState;
  sections: FocusedSkySection[];
  /** Stars rendered in focused canvas — subset of expandedView.stars, same positions/IDs. */
  canvasStars: MySkyStarDisplay[];
  prioritizedNodeIds: string[];
  pins: FocusedSkyPin[];
  emergingGroups: EmergingGroup[];
  joinedGroups: EmergingGroup[];
  peaceState: boolean;
  maxVerticalSections: number;
}

export interface FocusedSkySession {
  scrollOffsetY: number;
  lastFocusedAt: string | null;
}

export interface SharedSkyParticipationSignal {
  nodeId: string;
  kind: 'authored' | 'joined' | 'reopened' | 'contributed' | 'visited';
  weight: 'strong' | 'moderate';
  lastAt: string;
}

/** Permitted meaning families — contextual, not diagnostic labels. */
export type PermittedMeaningSignal =
  | 'hope'
  | 'struggle'
  | 'growth'
  | 'purpose'
  | 'values'
  | 'becoming'
  | 'belonging'
  | 'contribution'
  | 'creativity'
  | 'relationships'
  | 'transition';

export interface StarpathSkyReference {
  skyNodeId: string;
  opportunityId?: string;
  starpathBranchId?: string;
  reasonCode?: string;
}
