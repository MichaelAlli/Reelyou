import AsyncStorage from '@react-native-async-storage/async-storage';

import { currentUser } from '@/data/mockData';
import {
  dedupeEdges,
  listFollowing,
  migrateLegacyFollowedIds,
  addSkyFollowEdge,
  removeSkyFollowEdge,
  seedBetaInboundFollowers,
} from '@/social/skyFollow/skyFollowLogic';
import {
  EMPTY_SKY_FOLLOW_GRAPH,
  type SkyFollowEdge,
  type SkyFollowGraph,
} from '@/social/skyFollow/skyFollowTypes';

const LEGACY_KEY = '@reellyou/sky-follows';
const GRAPH_KEY = '@reellyou/sky-follow-graph';

function parseEdge(raw: unknown): SkyFollowEdge | null {
  if (!raw || typeof raw !== 'object') return null;
  const entry = raw as Record<string, unknown>;
  if (typeof entry.followerUserId !== 'string' || typeof entry.followedUserId !== 'string') {
    return null;
  }
  return {
    followerUserId: entry.followerUserId,
    followedUserId: entry.followedUserId,
    createdAt: typeof entry.createdAt === 'number' ? entry.createdAt : Date.now(),
    status: 'active',
  };
}

function parseGraph(raw: unknown): SkyFollowGraph {
  if (!raw || typeof raw !== 'object') return { ...EMPTY_SKY_FOLLOW_GRAPH, edges: [] };
  const entry = raw as Record<string, unknown>;
  const edgesRaw = entry.edges;
  const edges = Array.isArray(edgesRaw)
    ? dedupeEdges(edgesRaw.map(parseEdge).filter((e): e is SkyFollowEdge => e != null))
    : [];
  return { version: 'beta-v1', edges };
}

async function loadLegacyFollowedIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(LEGACY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === 'string' && id.length > 0);
  } catch {
    return [];
  }
}

export async function loadSkyFollowGraph(): Promise<SkyFollowGraph> {
  try {
    const raw = await AsyncStorage.getItem(GRAPH_KEY);
    if (raw) {
      const graph = parseGraph(JSON.parse(raw));
      if (graph.edges.length > 0) return graph;
    }
  } catch {
    // fall through to migration
  }

  const legacy = await loadLegacyFollowedIds();
  let graph = migrateLegacyFollowedIds(EMPTY_SKY_FOLLOW_GRAPH, legacy);
  graph = seedBetaInboundFollowers(graph);
  await saveSkyFollowGraph(graph);
  if (legacy.length > 0) {
    await AsyncStorage.removeItem(LEGACY_KEY);
  }
  return graph;
}

export async function saveSkyFollowGraph(graph: SkyFollowGraph): Promise<void> {
  await AsyncStorage.setItem(GRAPH_KEY, JSON.stringify(graph));
}

export async function loadFollowedSkyUserIds(): Promise<string[]> {
  const graph = await loadSkyFollowGraph();
  return listFollowing(graph, currentUser.id);
}

export async function saveFollowedSkyUserIds(ids: string[]): Promise<void> {
  const graph = await loadSkyFollowGraph();
  const ownerId = currentUser.id;
  const current = new Set(listFollowing(graph, ownerId));
  const desired = new Set(ids);
  let next = graph;
  for (const id of current) {
    if (!desired.has(id)) next = removeSkyFollowEdge(next, ownerId, id);
  }
  for (const id of desired) {
    if (!current.has(id)) next = addSkyFollowEdge(next, ownerId, id);
  }
  await saveSkyFollowGraph(next);
}
