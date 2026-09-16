import {
  MY_SKY_CONSTELLATION_FIXTURES,
  MY_SKY_ITEM_FIXTURES,
} from '@/mySky/fixtures';
import { buildSkyNodeId } from '@/mySky/skyArrival';
import { resolveSkyNodePosition } from '@/mySky/skyLayout';
import type {
  SkyNode,
  SkyNodeLayer,
  SkyNodeType,
  SkyPattern,
  SkyRelationship,
} from '@/mySky/skyNodeTypes';
import { computeSkyNodeVisual, computeSkyVitality } from '@/mySky/skyVisualRules';
import type { SkywriteRecord } from '@/skywrite/types';
import type { UserPersonalizationProfile } from '@/onboarding/personalization/types';

function skywriteTitle(text: string, mediaMode: string): string {
  const trimmed = text.trim();
  if (trimmed) return trimmed.slice(0, 48);
  if (mediaMode === 'photo_voiceover') return 'Photo with voiceover';
  if (mediaMode === 'photo') return 'Photo moment';
  if (mediaMode === 'voice') return 'Voice moment';
  return 'Skywrite';
}

function mapFixtureType(type: string): SkyNodeType {
  if (type === 'skywrite') return 'skywrite';
  if (type === 'connection') return 'relationship';
  if (type === 'contribution') return 'impact';
  return 'reflection';
}

function mapFixtureLayer(type: string): SkyNodeLayer {
  if (type === 'connection') return 'connections';
  if (type === 'contribution') return 'impact';
  return 'stars';
}

function buildSkywriteNode(post: SkywriteRecord, slotIndex: number, vitality: number): SkyNode {
  const id = buildSkyNodeId(post.id);
  const layout = resolveSkyNodePosition(id, slotIndex);

  return {
    id,
    type: 'skywrite',
    layer: 'stars',
    sourceId: post.id,
    createdAt: post.createdAt,
    position: { x: layout.x, y: layout.y },
    visual: computeSkyNodeVisual('skywrite', layout.color, { vitality }),
    userDefined: true,
    provenance: { source: 'explicit', reason: 'user_skywrite' },
    destination: 'skywrite',
    destinationParam: null,
    title: skywriteTitle(post.text, post.mediaMode),
    visibility: post.visibility,
    patternId: null,
  };
}

function buildFixtureNode(
  item: (typeof MY_SKY_ITEM_FIXTURES)[number],
  vitality: number,
): SkyNode {
  const layout = resolveSkyNodePosition(item.id, 0);
  const nodeType = mapFixtureType(item.type);

  return {
    id: item.id,
    type: nodeType,
    layer: mapFixtureLayer(item.type),
    createdAt: item.timestamp ?? new Date().toISOString(),
    position: { x: layout.x, y: layout.y },
    visual: computeSkyNodeVisual(nodeType, layout.color, { vitality }),
    userDefined: true,
    provenance: { source: 'explicit', reason: 'fixture_seed' },
    destination:
      item.id === 'star-3' ? 'public-sky' : item.type === 'skywrite' ? 'skywrite' : null,
    destinationParam: item.id === 'star-3' ? 'orbit-3' : null,
    title: item.title,
    visibility: item.visibility,
    patternId: item.constellationId ?? null,
  };
}

export interface BuiltSkyGraph {
  nodes: SkyNode[];
  patterns: SkyPattern[];
  relationships: SkyRelationship[];
  vitality: number;
}

/** Build normalized sky graph from profile — stable ids, explicit provenance. */
export function buildSkyNodes(profile: UserPersonalizationProfile): BuiltSkyGraph {
  const skywriteNodes = profile.skywrites.map((post, index) =>
    buildSkywriteNode(post, index, 1),
  );
  const vitality = computeSkyVitality(skywriteNodes.length);

  const skywriteIds = new Set(skywriteNodes.map((n) => n.id));
  const fixtureNodes = MY_SKY_ITEM_FIXTURES.filter((item) => !skywriteIds.has(item.id)).map(
    (item) => buildFixtureNode(item, vitality),
  );

  const nodes = [...skywriteNodes, ...fixtureNodes].map((node) => ({
    ...node,
    visual: computeSkyNodeVisual(node.type, node.visual.color, { vitality }),
  }));

  const now = new Date().toISOString();
  const patterns: SkyPattern[] = MY_SKY_CONSTELLATION_FIXTURES.map((pattern) => ({
    id: pattern.id,
    nodeIds: pattern.itemIds.filter((id) => nodes.some((n) => n.id === id)),
    label: pattern.label,
    note: pattern.note,
    source: 'explicit' as const,
    status: 'emerging' as const,
    createdAt: now,
    updatedAt: now,
  }));

  const relationships: SkyRelationship[] = [];
  for (const pattern of patterns) {
    for (let i = 0; i < pattern.nodeIds.length - 1; i += 1) {
      relationships.push({
        id: `${pattern.id}-edge-${i}`,
        fromNodeId: pattern.nodeIds[i],
        toNodeId: pattern.nodeIds[i + 1],
        patternId: pattern.id,
        source: pattern.source,
      });
    }
  }

  nodes.forEach((node) => {
    const pattern = patterns.find((p) => p.nodeIds.includes(node.id));
    if (pattern) node.patternId = pattern.id;
  });

  return { nodes, patterns, relationships, vitality };
}
