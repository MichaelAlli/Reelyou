import type {
  LayoutPoint,
  OrganicTrailSpec,
  PortraitNodeSpec,
  StarPathBranchSpec,
  SymbolNodeSpec,
} from '@/starpath/starpathReferenceLayout';
import {
  REF_NORTH_STAR_LABEL,
  REF_NEXT_STEP_WAYPOINT,
  REF_PORTRAIT_NODES,
  REF_SYMBOL_NODES,
  REF_TRAVELER,
  buildOrganicTrailsForMetrics,
  getReferenceBranchSpecs,
} from '@/starpath/starpathReferenceLayout';
import type { StarPathLayoutMetrics } from '@/starpath/starpathLayoutMetrics';

/** How prominently a node is drawn — drives density without removing data. */
export type StarPathNodePresence = 'focus' | 'nearby' | 'distant' | 'summarized';

export type StarPathGrowthSignalKind =
  | 'reflection'
  | 'skywrite'
  | 'connection'
  | 'community'
  | 'goal'
  | 'growth'
  | 'contribution'
  | 'next_step';

/** Structured activity input for future organic expansion (no scores exposed to UI). */
export interface StarPathGrowthSignal {
  id: string;
  kind: StarPathGrowthSignalKind;
  /** Optional branch to extend; new branches may be created at junctions later. */
  branchId?: string;
  /** When set, a new node may appear along the branch in reference space. */
  suggestedRefPoint?: LayoutPoint;
  symbolIcon?: string;
  portraitSeed?: number;
  emergedAt: number;
}

export type { StarPathBranchSpec };

export interface StarPathWorldGraph {
  version: number;
  portraitNodes: PortraitNodeSpec[];
  symbolNodes: SymbolNodeSpec[];
  branches: StarPathBranchSpec[];
  traveler: LayoutPoint;
  northStarLabel: LayoutPoint;
  nextStepWaypoint: LayoutPoint;
  /** Node IDs surfaced recently — used for subtle reveal treatment. */
  recentlyEmergedIds: string[];
}

export function createInitialStarPathWorldGraph(): StarPathWorldGraph {
  return {
    version: 1,
    portraitNodes: [...REF_PORTRAIT_NODES],
    symbolNodes: [...REF_SYMBOL_NODES],
    branches: getReferenceBranchSpecs(),
    traveler: { ...REF_TRAVELER },
    northStarLabel: { ...REF_NORTH_STAR_LABEL },
    nextStepWaypoint: { ...REF_NEXT_STEP_WAYPOINT },
    recentlyEmergedIds: [],
  };
}

export function buildTrailsFromWorldGraph(
  graph: StarPathWorldGraph,
  metrics: StarPathLayoutMetrics,
): OrganicTrailSpec[] {
  return buildOrganicTrailsForMetrics(metrics, graph.branches);
}

export function extendBranchWithWaypoint(
  graph: StarPathWorldGraph,
  branchId: string,
  waypoint: LayoutPoint,
): StarPathWorldGraph {
  return {
    ...graph,
    version: graph.version + 1,
    branches: graph.branches.map((b) =>
      b.id === branchId ? { ...b, waypoints: [...b.waypoints, waypoint] } : b,
    ),
  };
}

export function insertSymbolNode(
  graph: StarPathWorldGraph,
  node: SymbolNodeSpec,
): StarPathWorldGraph {
  if (graph.symbolNodes.some((n) => n.id === node.id)) return graph;
  return {
    ...graph,
    version: graph.version + 1,
    symbolNodes: [...graph.symbolNodes, node],
    recentlyEmergedIds: [...graph.recentlyEmergedIds, node.id],
  };
}

export function insertPortraitNode(
  graph: StarPathWorldGraph,
  node: PortraitNodeSpec,
): StarPathWorldGraph {
  if (graph.portraitNodes.some((n) => n.id === node.id)) return graph;
  return {
    ...graph,
    version: graph.version + 1,
    portraitNodes: [...graph.portraitNodes, node],
    recentlyEmergedIds: [...graph.recentlyEmergedIds, node.id],
  };
}
