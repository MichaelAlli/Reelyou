import type { RelevanceBand } from '@/starpath/starpathSiftingTypes';

export const STARPATH_DYNAMIC_WORLD_VERSION = 1;

export type EmergenceLifecycleState =
  | 'hidden'
  | 'eligible'
  | 'emerging'
  | 'active'
  | 'settled'
  | 'receding'
  | 'summarized';

export type JourneyNodeType = 'portrait' | 'symbol' | 'milestone';

export type JourneyGrowthStatus = 'pending' | 'visible' | 'archived';

export interface JourneyNode {
  id: string;
  branchId: string;
  categoryId: string;
  /** Normalized reference-space x (0–1 horizontal; y may extend below 1 for growth band). */
  refX: number;
  refY: number;
  type: JourneyNodeType;
  emergenceState: EmergenceLifecycleState;
  relevanceBand?: RelevanceBand;
  sourceId: string;
  templateId: string;
  anchorNodeId: string;
  ringColor: string;
  icon?: string;
  portraitSeed?: number;
  createdAt: number;
  revealedAt?: number;
  status: JourneyGrowthStatus;
}

export interface JourneyBranchExtension {
  id: string;
  parentBranchId: string;
  categoryId: string;
  startNodeId: string;
  endNodeIds: string[];
  /** Reference-space waypoints for SVG (does not mutate locked branches). */
  waypoints: { x: number; y: number }[];
  color: string;
  glowColor: string;
  side: 'left' | 'right';
  status: JourneyGrowthStatus;
  createdAt: number;
}

export type MilestoneSummaryType = 'branch_activity' | 'exploration_cluster';

export interface JourneyMilestone {
  id: string;
  branchId: string;
  refX: number;
  refY: number;
  sourceNodeIds: string[];
  summaryType: MilestoneSummaryType;
  status: JourneyGrowthStatus;
  createdAt: number;
}

export interface StarPathOffscreenGrowthHint {
  direction: 'above' | 'below';
  nodeId: string;
  branchId: string;
}

export interface StarPathDynamicWorldState {
  version: number;
  engineVersion: string;
  nodes: JourneyNode[];
  branchExtensions: JourneyBranchExtension[];
  milestones: JourneyMilestone[];
  /** Extra scrollable height (px at reference viewport height 852). */
  worldExpansionPx: number;
  lastMajorEmergenceAt: number;
  lastCalculatedAt: number;
}

export const EMPTY_DYNAMIC_WORLD: StarPathDynamicWorldState = {
  version: STARPATH_DYNAMIC_WORLD_VERSION,
  engineVersion: 'beta-v1',
  nodes: [],
  branchExtensions: [],
  milestones: [],
  worldExpansionPx: 0,
  lastMajorEmergenceAt: 0,
  lastCalculatedAt: 0,
};
