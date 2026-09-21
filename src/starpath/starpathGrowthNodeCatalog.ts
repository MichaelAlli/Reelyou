import type { StarPathNodeCatalogEntry } from '@/starpath/starpathNodeCatalog';
import type { JourneyNode } from '@/starpath/starpathDynamicWorldTypes';
import { getGrowthTemplate } from '@/starpath/starpathGrowthPossibilities';

export function buildGrowthNodeCatalogEntry(node: JourneyNode): StarPathNodeCatalogEntry {
  const template = getGrowthTemplate(node.templateId);
  return {
    id: node.id,
    kind: node.type === 'portrait' ? 'portrait' : 'symbol',
    branchId: node.branchId,
    title: 'New possibility',
    subtitle: template ? `Along your ${node.branchId} path` : 'Along your path',
    whyItMatters: 'Something connected to what you explored may be worth a quiet look.',
    relatedNodeIds: [node.anchorNodeId],
    actions: { explore: true, interested: true, dismiss: true, save: true },
  };
}

export function resolveStarPathNodeEntry(nodeId: string, dynamicNodes: JourneyNode[]): StarPathNodeCatalogEntry | undefined {
  const dynamic = dynamicNodes.find((n) => n.id === nodeId);
  if (dynamic) return buildGrowthNodeCatalogEntry(dynamic);
  return undefined;
}
