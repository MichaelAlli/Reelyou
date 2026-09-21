import type { StarPathLayoutMetrics } from '@/starpath/starpathLayoutMetrics';
import { refPointToWorldPx } from '@/starpath/starpathLayoutMetrics';
import type { StarPathWorldGraph } from '@/starpath/starpathWorldModel';
import { isPointInViewport } from '@/spatialFocus/spatialFocusGeometry';
import type { SpatialFocusCandidate } from '@/spatialFocus/types';

export interface StarPathPlacedFocusNode {
  nodeId: string;
  refX: number;
  refY: number;
}

export interface StarPathDynamicFocusNode {
  id: string;
  refX: number;
  refY: number;
}

export function buildStarPathFocusCandidates(input: {
  graph: StarPathWorldGraph;
  placedNodes: StarPathPlacedFocusNode[];
  dynamicNodes?: StarPathDynamicFocusNode[];
  metrics: StarPathLayoutMetrics;
  scrollY: number;
  layoutWidth: number;
  layoutHeight: number;
  isNodeEligible?: (nodeId: string) => boolean;
}): SpatialFocusCandidate[] {
  const {
    graph,
    placedNodes,
    dynamicNodes = [],
    metrics,
    scrollY,
    layoutWidth,
    layoutHeight,
    isNodeEligible = () => true,
  } = input;

  const candidates: SpatialFocusCandidate[] = [];
  const seen = new Set<string>();

  const pushNode = (nodeId: string, refX: number, refY: number, relevance = 0) => {
    if (seen.has(nodeId) || !isNodeEligible(nodeId)) return;
    const world = refPointToWorldPx({ x: refX, y: refY }, metrics);
    const centerX = world.x;
    const centerY = world.y - scrollY;
    if (!isPointInViewport(centerX, centerY, layoutWidth, layoutHeight, 48)) return;
    seen.add(nodeId);
    candidates.push({ id: nodeId, centerX, centerY, relevance });
  };

  for (const node of graph.symbolNodes) {
    pushNode(node.id, node.x, node.y, 1);
  }
  for (const node of graph.portraitNodes) {
    pushNode(node.id, node.x, node.y, 2);
  }
  for (const placed of placedNodes) {
    pushNode(placed.nodeId, placed.refX, placed.refY, 1);
  }
  for (const node of dynamicNodes) {
    pushNode(node.id, node.refX, node.refY, 1);
  }

  return candidates;
}
