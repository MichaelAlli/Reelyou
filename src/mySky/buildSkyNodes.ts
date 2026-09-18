import {
  MY_SKY_CONSTELLATION_FIXTURES,
  MY_SKY_ITEM_FIXTURES,
} from '@/mySky/fixtures';
import { buildSkyNodeId } from '@/mySky/skyArrival';
import type { MySkySources } from '@/mySky/mySkyState';
import {
  applyVisualPrioritization,
  computeSkyGrowthProfile,
  deriveActivityPatterns,
  refreshNodeVisual,
  type SkyGrowthProfile,
} from '@/mySky/skyEvolution';
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
import type { SkyConnectionActivity } from '@/mySky/skyConnectionSources';
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

  return refreshNodeVisual(
    {
      id,
      type: 'skywrite',
      sourceType: 'skywrite',
      sourceId: post.id,
      layer: 'stars',
      createdAt: post.createdAt,
      position: { x: layout.x, y: layout.y },
      visual: {
        size: 5.8,
        brightness: 1,
        glow: 0.8,
        opacity: 1,
        emphasis: 1,
        color: layout.color,
      },
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
    },
    vitality,
  );
}

function buildFocusReflectionNode(sources: MySkySources, vitality: number): SkyNode | null {
  const reflection = sources.todayFocusReflection?.trim();
  if (!reflection) return null;

  const dateKey = sources.todayFocusDateKey ?? 'today';
  const id = `focus-reflection-${dateKey}`;
  const layout = resolveStableNodePosition(id);
  const focusTitle = sources.todayFocusValue?.trim();
  const title = focusTitle ? focusTitle.slice(0, 48) : reflection.slice(0, 48);

  const base: SkyNode = {
    id,
    type: 'reflection',
    sourceType: 'reflection',
    layer: 'stars',
    createdAt: sources.todayFocusReflectionAt ?? new Date().toISOString(),
    position: { x: layout.x, y: layout.y },
    visual: { size: 5.2, brightness: 1, glow: 0.8, opacity: 1, emphasis: 1, color: layout.color },
    userGenerated: true,
    inferred: false,
    userDefined: true,
    provenance: { source: 'explicit', reason: 'today_focus_reflection' },
    destination: null,
    destinationParam: null,
    title,
    visibility: 'private',
    patternId: null,
    metadata: { focusReflection: true },
  };

  return refreshNodeVisual(base, vitality, 0.06);
}

function buildCommunityNode(
  community: JoinedCommunity,
  vitality: number,
  hasParticipation: boolean,
): SkyNode {
  const id = `community-${community.id}`;
  const layout = resolveStableNodePosition(id);

  const base: SkyNode = {
    id,
    type: 'community',
    sourceType: 'community',
    sourceId: community.id,
    layer: 'communities',
    createdAt: community.joinedAt,
    position: { x: layout.x, y: layout.y },
    visual: { size: 5, brightness: 1, glow: 0.8, opacity: 1, emphasis: 1, color: layout.color },
    userGenerated: true,
    inferred: false,
    userDefined: true,
    provenance: { source: 'explicit', reason: 'user_community_join' },
    destination: 'community',
    destinationParam: community.id,
    title: community.name,
    patternId: null,
    metadata: hasParticipation ? { communityParticipation: true } : undefined,
  };

  return refreshNodeVisual(base, vitality, hasParticipation ? 0.08 : 0.05);
}

function buildConnectionNode(activity: SkyConnectionActivity, vitality: number): SkyNode {
  const layout = resolveStableNodePosition(activity.id);

  const base: SkyNode = {
    id: activity.id,
    type: 'relationship',
    sourceType: 'relationship',
    sourceId: activity.actorId,
    layer: 'connections',
    createdAt: activity.createdAt,
    position: { x: layout.x, y: layout.y },
    visual: { size: 5.4, brightness: 1, glow: 0.8, opacity: 1, emphasis: 1, color: layout.color },
    userGenerated: true,
    inferred: false,
    userDefined: true,
    provenance: { source: 'explicit', reason: 'explicit_connection_activity' },
    destination: activity.destination,
    destinationParam: activity.destinationParam,
    title: activity.title,
    patternId: null,
  };

  return refreshNodeVisual(base, vitality, 0.04);
}

function buildGrowthNode(goal: string, index: number, vitality: number): SkyNode {
  const id = `growth-${index}-${goal.slice(0, 12).replace(/\s+/g, '-').toLowerCase()}`;
  const layout = resolveStableNodePosition(id);

  const base: SkyNode = {
    id,
    type: 'growth',
    sourceType: 'growth',
    layer: 'growth',
    createdAt: new Date().toISOString(),
    position: { x: layout.x, y: layout.y },
    visual: { size: 5.2, brightness: 1, glow: 0.8, opacity: 1, emphasis: 1, color: layout.color },
    userGenerated: true,
    inferred: false,
    userDefined: true,
    provenance: { source: 'explicit', reason: 'user_goal' },
    destination: null,
    destinationParam: null,
    title: goal,
    patternId: null,
  };

  return refreshNodeVisual(base, vitality);
}

function buildGuidanceNode(label: string, vitality: number): SkyNode {
  const id = 'guidance-active';
  const layout = resolveStableNodePosition(id);

  const base: SkyNode = {
    id,
    type: 'guidance',
    sourceType: 'guidance',
    layer: 'guidance',
    createdAt: new Date().toISOString(),
    position: { x: layout.x, y: layout.y },
    visual: { size: 5, brightness: 1, glow: 0.8, opacity: 1, emphasis: 1, color: layout.color },
    userGenerated: false,
    inferred: false,
    userDefined: true,
    provenance: { source: 'explicit', reason: 'guiding_light' },
    destination: null,
    destinationParam: null,
    title: label.slice(0, 48),
    patternId: null,
  };

  return refreshNodeVisual(base, vitality, 0.08);
}

function buildFixtureNode(
  item: (typeof MY_SKY_ITEM_FIXTURES)[number],
  vitality: number,
): SkyNode {
  const layout = resolveStableNodePosition(item.id);
  const nodeType = mapFixtureType(item.type);

  const base: SkyNode = {
    id: item.id,
    type: nodeType,
    sourceType: mapFixtureSourceType(item.type),
    layer: mapFixtureLayer(item.type),
    createdAt: item.timestamp ?? new Date().toISOString(),
    position: { x: layout.x, y: layout.y },
    visual: { size: 5.2, brightness: 1, glow: 0.8, opacity: 1, emphasis: 1, color: layout.color },
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

  return refreshNodeVisual(base, vitality);
}

function attachPatternIds(nodes: SkyNode[], patterns: SkyPattern[]): void {
  nodes.forEach((node) => {
    const pattern = patterns.find((entry) => entry.nodeIds.includes(node.id));
    if (pattern) node.patternId = pattern.id;
  });
}

function buildPatternRelationships(patterns: SkyPattern[]): SkyRelationship[] {
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
  return relationships;
}

export interface BuiltSkyGraph {
  nodes: SkyNode[];
  patterns: SkyPattern[];
  relationships: SkyRelationship[];
  vitality: number;
  growthProfile: SkyGrowthProfile;
}

/** Build normalized sky graph from centralized sources — stable ids, explicit provenance. */
export function buildSkyNodes(sources: MySkySources): BuiltSkyGraph {
  const growthProfile = computeSkyGrowthProfile(sources);
  const { vitality } = growthProfile;

  const skywriteNodes = sources.skywrites.map((post) => buildSkywriteNode(post, vitality));
  const focusReflectionNode = buildFocusReflectionNode(sources, vitality);

  const useFixtures = sources.skywrites.length === 0;
  const fixtureNodes = useFixtures
    ? MY_SKY_ITEM_FIXTURES.map((item) => buildFixtureNode(item, vitality))
    : [];

  const participationSet = new Set(sources.participatingCommunityIds);
  const communityNodes = sources.joinedCommunities.map((c) =>
    buildCommunityNode(c, vitality, participationSet.has(c.id)),
  );
  const connectionNodes = sources.connectionActivities.map((activity) =>
    buildConnectionNode(activity, vitality),
  );
  const growthNodes = sources.growthGoals
    .slice(0, 4)
    .map((goal, index) => buildGrowthNode(goal, index, vitality));
  const guidanceNodes =
    sources.guidanceActive && sources.guidanceLabel
      ? [buildGuidanceNode(sources.guidanceLabel, vitality)]
      : [];

  let nodes: SkyNode[] = [
    ...skywriteNodes,
    ...(focusReflectionNode ? [focusReflectionNode] : []),
    ...fixtureNodes,
    ...communityNodes,
    ...connectionNodes,
    ...growthNodes,
    ...guidanceNodes,
  ];

  nodes = applyVisualPrioritization(nodes, growthProfile);

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
    : deriveActivityPatterns(nodes, sources);

  attachPatternIds(nodes, patterns);
  const relationships = buildPatternRelationships(patterns);

  return { nodes, patterns, relationships, vitality, growthProfile };
}
