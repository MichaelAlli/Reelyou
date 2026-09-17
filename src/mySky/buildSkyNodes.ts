import {
  MY_SKY_CONSTELLATION_FIXTURES,
  MY_SKY_ITEM_FIXTURES,
} from '@/mySky/fixtures';
import { buildSkyNodeId } from '@/mySky/skyArrival';
import type { MySkySources } from '@/mySky/mySkyState';
import { resolveStableNodePosition } from '@/mySky/skyLayout';
import type {
  SkyNode,
  SkyNodeLayer,
  SkyNodeMetadata,
  SkyNodeType,
  SkyPattern,
  SkyRelationship,
  SkySourceType,
} from '@/mySky/skyNodeTypes';
import { computeSkyNodeVisual, computeSkyVitality } from '@/mySky/skyVisualRules';
import type { JoinedCommunity } from '@/onboarding/personalization/communities/types';
import type { SkywriteRecord } from '@/skywrite/types';

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

function mapFixtureSourceType(type: string): SkySourceType {
  if (type === 'skywrite') return 'skywrite';
  if (type === 'connection') return 'relationship';
  if (type === 'contribution') return 'impact';
  return 'reflection';
}

function buildSkywriteMetadata(post: SkywriteRecord): SkyNodeMetadata {
  return {
    mediaMode: post.mediaMode,
    textStyle: post.textStyle,
    mood: post.mood ?? undefined,
    showingUp: post.showingUp ?? undefined,
    allowAIContext: post.allowAIContext,
  };
}

function buildSkywriteNode(post: SkywriteRecord, vitality: number): SkyNode {
  const id = buildSkyNodeId(post.id);
  const layout = resolveStableNodePosition(id);

  return {
    id,
    type: 'skywrite',
    sourceType: 'skywrite',
    sourceId: post.id,
    layer: 'stars',
    createdAt: post.createdAt,
    position: { x: layout.x, y: layout.y },
    visual: computeSkyNodeVisual('skywrite', layout.color, { vitality }),
    userGenerated: true,
    inferred: false,
    userDefined: true,
    provenance: { source: 'explicit', reason: 'user_skywrite' },
    destination: 'skywrite',
    destinationParam: null,
    title: skywriteTitle(post.text, post.mediaMode),
    visibility: post.visibility,
    patternId: null,
    metadata: buildSkywriteMetadata(post),
  };
}

function buildCommunityNode(community: JoinedCommunity, vitality: number): SkyNode {
  const id = `community-${community.id}`;
  const layout = resolveStableNodePosition(id);

  return {
    id,
    type: 'community',
    sourceType: 'community',
    sourceId: community.id,
    layer: 'communities',
    createdAt: community.joinedAt,
    position: { x: layout.x, y: layout.y },
    visual: computeSkyNodeVisual('community', layout.color, { vitality, emphasisBoost: 0.05 }),
    userGenerated: true,
    inferred: false,
    userDefined: true,
    provenance: { source: 'explicit', reason: 'user_community_join' },
    destination: null,
    destinationParam: null,
    title: community.name,
    patternId: null,
  };
}

function buildConnectionNode(community: JoinedCommunity, vitality: number): SkyNode {
  const id = `connection-${community.id}`;
  const layout = resolveStableNodePosition(id);

  return {
    id,
    type: 'relationship',
    sourceType: 'relationship',
    sourceId: community.id,
    layer: 'connections',
    createdAt: community.joinedAt,
    position: { x: layout.x, y: layout.y },
    visual: computeSkyNodeVisual('relationship', layout.color, { vitality }),
    userGenerated: true,
    inferred: false,
    userDefined: true,
    provenance: { source: 'explicit', reason: 'user_community_join' },
    destination: null,
    destinationParam: null,
    title: community.name,
    patternId: null,
  };
}

function buildGrowthNode(goal: string, index: number, vitality: number): SkyNode {
  const id = `growth-${index}-${goal.slice(0, 12).replace(/\s+/g, '-').toLowerCase()}`;
  const layout = resolveStableNodePosition(id);

  return {
    id,
    type: 'growth',
    sourceType: 'growth',
    layer: 'growth',
    createdAt: new Date().toISOString(),
    position: { x: layout.x, y: layout.y },
    visual: computeSkyNodeVisual('growth', layout.color, { vitality }),
    userGenerated: true,
    inferred: false,
    userDefined: true,
    provenance: { source: 'explicit', reason: 'user_goal' },
    destination: null,
    destinationParam: null,
    title: goal,
    patternId: null,
  };
}

function buildGuidanceNode(label: string, vitality: number): SkyNode {
  const id = 'guidance-active';
  const layout = resolveStableNodePosition(id);

  return {
    id,
    type: 'guidance',
    sourceType: 'guidance',
    layer: 'guidance',
    createdAt: new Date().toISOString(),
    position: { x: layout.x, y: layout.y },
    visual: computeSkyNodeVisual('guidance', layout.color, { vitality, emphasisBoost: 0.08 }),
    userGenerated: false,
    inferred: false,
    userDefined: true,
    provenance: { source: 'explicit', reason: 'guiding_light' },
    destination: null,
    destinationParam: null,
    title: label.slice(0, 48),
    patternId: null,
  };
}

function buildFixtureNode(
  item: (typeof MY_SKY_ITEM_FIXTURES)[number],
  vitality: number,
): SkyNode {
  const layout = resolveStableNodePosition(item.id);
  const nodeType = mapFixtureType(item.type);

  return {
    id: item.id,
    type: nodeType,
    sourceType: mapFixtureSourceType(item.type),
    layer: mapFixtureLayer(item.type),
    createdAt: item.timestamp ?? new Date().toISOString(),
    position: { x: layout.x, y: layout.y },
    visual: computeSkyNodeVisual(nodeType, layout.color, { vitality }),
    userGenerated: false,
    inferred: false,
    userDefined: true,
    provenance: { source: 'system', reason: 'fixture_seed' },
    destination:
      item.id === 'star-3' ? 'public-sky' : item.type === 'skywrite' ? 'skywrite' : null,
    destinationParam: item.id === 'star-3' ? 'orbit-3' : null,
    title: item.title,
    visibility: item.visibility,
    patternId: item.constellationId ?? null,
    metadata: { fixtureSeed: true },
  };
}

export interface BuiltSkyGraph {
  nodes: SkyNode[];
  patterns: SkyPattern[];
  relationships: SkyRelationship[];
  vitality: number;
}

/** Build normalized sky graph from centralized sources — stable ids, explicit provenance. */
export function buildSkyNodes(sources: MySkySources): BuiltSkyGraph {
  const skywriteNodes = sources.skywrites.map((post) => buildSkywriteNode(post, 1));
  const vitality = computeSkyVitality(skywriteNodes.length);

  const useFixtures = sources.skywrites.length === 0;
  const fixtureNodes = useFixtures
    ? MY_SKY_ITEM_FIXTURES.map((item) => buildFixtureNode(item, vitality))
    : [];

  const communityNodes = sources.joinedCommunities.map((c) => buildCommunityNode(c, vitality));
  const connectionNodes = sources.joinedCommunities.map((c) => buildConnectionNode(c, vitality));
  const growthNodes = sources.growthGoals
    .slice(0, 4)
    .map((goal, index) => buildGrowthNode(goal, index, vitality));
  const guidanceNodes =
    sources.guidanceActive && sources.guidanceLabel
      ? [buildGuidanceNode(sources.guidanceLabel, vitality)]
      : [];

  const nodes = [
    ...skywriteNodes,
    ...fixtureNodes,
    ...communityNodes,
    ...connectionNodes,
    ...growthNodes,
    ...guidanceNodes,
  ].map((node) => ({
    ...node,
    visual: computeSkyNodeVisual(node.type, node.visual.color, { vitality }),
  }));

  const now = new Date().toISOString();
  const patterns: SkyPattern[] = useFixtures
    ? MY_SKY_CONSTELLATION_FIXTURES.map((pattern) => ({
        id: pattern.id,
        nodeIds: pattern.itemIds.filter((id) => nodes.some((n) => n.id === id)),
        label: pattern.label,
        note: pattern.note,
        source: 'explicit' as const,
        status: 'emerging' as const,
        createdAt: now,
        updatedAt: now,
      }))
    : [];

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
