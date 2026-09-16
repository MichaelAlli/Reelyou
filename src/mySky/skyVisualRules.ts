import type { SkyNode, SkyNodeType, SkyNodeVisual } from '@/mySky/skyNodeTypes';
import type { MySkyStarDisplay } from '@/mySky/types';

const TYPE_COLOR: Record<SkyNodeType, string> = {
  skywrite: '#FFD57A',
  reflection: '#C4A8FF',
  community: '#5EEAD4',
  relationship: '#E879A8',
  growth: '#8FD4FF',
  impact: '#FFB347',
  guidance: '#FFF4D6',
};

const BASE_SIZE: Record<SkyNodeType, number> = {
  skywrite: 5.8,
  reflection: 5.2,
  community: 5,
  relationship: 5.4,
  growth: 5.2,
  impact: 5.6,
  guidance: 5,
};

/** Compute visual properties from node metadata + sky vitality — single source for renderer. */
export function computeSkyNodeVisual(
  type: SkyNodeType,
  color: string,
  options: {
    vitality?: number;
    emphasisBoost?: number;
    ageDays?: number;
  } = {},
): SkyNodeVisual {
  const vitality = options.vitality ?? 1;
  const emphasisBoost = options.emphasisBoost ?? 0;
  const ageDays = options.ageDays ?? 0;

  const ageGlow = Math.min(0.12, ageDays * 0.008);
  const baseSize = BASE_SIZE[type] ?? 5.2;

  return {
    size: baseSize * (1 + (vitality - 1) * 0.15 + emphasisBoost * 0.1),
    brightness: Math.min(1.45, 0.92 + vitality * 0.08 + emphasisBoost * 0.06),
    glow: Math.min(1.35, 0.75 + vitality * 0.12 + ageGlow),
    opacity: Math.min(1, 0.82 + emphasisBoost * 0.08),
    emphasis: Math.min(1.5, 0.85 + emphasisBoost + ageGlow),
    color,
    colorFamily: TYPE_COLOR[type],
  };
}

export function computeSkyVitality(skywriteNodeCount: number): number {
  return Math.min(1.4, 1 + skywriteNodeCount * 0.05);
}

/** Project a SkyNode into legacy display shape for canvas renderers. */
function mapNodeTypeToItemType(
  type: SkyNode['type'],
): MySkyStarDisplay['type'] {
  if (type === 'skywrite') return 'skywrite';
  if (type === 'relationship') return 'connection';
  if (type === 'impact') return 'contribution';
  return 'moment';
}

export function projectNodeToStarDisplay(node: SkyNode): MySkyStarDisplay {
  return {
    id: node.id,
    type: mapNodeTypeToItemType(node.type),
    title: node.title,
    timestamp: node.createdAt,
    visibility: node.visibility,
    constellationId: node.patternId ?? null,
    sourceId: node.sourceId,
    x: node.position.x,
    y: node.position.y,
    color: node.visual.color,
    destination: node.destination ?? null,
    destinationParam: node.destinationParam ?? null,
    visualSize: node.visual.size,
    visualBrightness: node.visual.brightness,
    visualGlow: node.visual.glow,
  };
}

export function filterVisibleStarNodes(
  nodes: SkyNode[],
  visibleLayers: import('@/mySky/skyLayers').MySkyVisibleLayers,
): SkyNode[] {
  return nodes.filter((node) => {
    if (node.layer === 'stars') return visibleLayers.stars;
    if (node.layer === 'communities') return visibleLayers.communities;
    if (node.layer === 'connections') return visibleLayers.connections;
    if (node.layer === 'growth') return visibleLayers.growth;
    if (node.layer === 'impact') return visibleLayers.impact;
    if (node.layer === 'guidance') return visibleLayers.guidance;
    return visibleLayers.stars;
  });
}
