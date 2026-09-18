import { buildSkyNodeId } from '@/mySky/skyArrival';
import type { MySkySources } from '@/mySky/mySkyState';
import type { SkyNode, SkyPattern, SkyRelationship } from '@/mySky/skyNodeTypes';

const MAX_PATTERNS = 4;
const IDENTITY_TYPE = 'identity';

function isEligibleNode(node: SkyNode): boolean {
  return node.type !== IDENTITY_TYPE;
}

function patternNodeIds(nodes: SkyNode[], ids: string[]): string[] {
  const eligible = new Set(nodes.filter(isEligibleNode).map((node) => node.id));
  return ids.filter((id) => eligible.has(id));
}

/** Derive meaningful constellation patterns from explicit structured relationships. */
export function deriveConstellationPatterns(
  nodes: SkyNode[],
  sources: MySkySources,
): SkyPattern[] {
  const now = new Date().toISOString();
  const patterns: SkyPattern[] = [];
  const usedNodeIds = new Set<string>();

  const skywriteNodes = nodes.filter((node) => node.type === 'skywrite' && isEligibleNode(node));
  const eligibleNodes = nodes.filter(isEligibleNode);

  const register = (draft: Omit<SkyPattern, 'createdAt' | 'updatedAt'>) => {
    const nodeIds = patternNodeIds(nodes, draft.nodeIds);
    if (nodeIds.length < 2) return;
    if (nodeIds.some((id) => usedNodeIds.has(id)) && patterns.length >= 2) {
      // Allow overlap only for the first two strongest patterns.
      const overlap = nodeIds.filter((id) => usedNodeIds.has(id));
      if (overlap.length > 1) return;
    }
    patterns.push({ ...draft, nodeIds, createdAt: now, updatedAt: now });
    nodeIds.forEach((id) => usedNodeIds.add(id));
  };

  // Shared mood across Skywrites — explicit user metadata.
  const moodGroups = new Map<string, string[]>();
  for (const node of skywriteNodes) {
    const mood = node.metadata?.mood;
    if (typeof mood !== 'string' || !mood) continue;
    const ids = moodGroups.get(mood) ?? [];
    ids.push(node.id);
    moodGroups.set(mood, ids);
  }
  for (const [mood, nodeIds] of moodGroups) {
    if (nodeIds.length < 2) continue;
    register({
      id: `pattern-mood-${mood}`,
      nodeIds,
      label: `Returning to ${mood}`,
      note: 'These moments share a similar feeling — a gentle thread is forming.',
      source: 'explicit',
      status: nodeIds.length >= 3 ? 'emerging' : 'possible',
    });
  }

  // Repeated explicit hashtags across Skywrites.
  const tagGroups = new Map<string, string[]>();
  for (const post of sources.skywrites) {
    for (const tag of post.userHashtags) {
      const ids = tagGroups.get(tag) ?? [];
      ids.push(buildSkyNodeId(post.id));
      tagGroups.set(tag, ids);
    }
  }
  for (const [tag, nodeIds] of tagGroups) {
    const filtered = patternNodeIds(nodes, nodeIds);
    if (filtered.length < 2) continue;
    register({
      id: `pattern-theme-${tag}`,
      nodeIds: filtered,
      label: `#${tag}`,
      note: 'You’ve returned to this theme more than once in your sky.',
      source: 'explicit',
      status: filtered.length >= 3 ? 'established' : 'emerging',
    });
  }

  // Shared “showing up” reflection type across Skywrites.
  const showingUpGroups = new Map<string, string[]>();
  for (const node of skywriteNodes) {
    const showingUp = node.metadata?.showingUp;
    if (typeof showingUp !== 'string' || !showingUp) continue;
    const ids = showingUpGroups.get(showingUp) ?? [];
    ids.push(node.id);
    showingUpGroups.set(showingUp, ids);
  }
  for (const [showingUp, nodeIds] of showingUpGroups) {
    if (nodeIds.length < 2) continue;
    register({
      id: `pattern-showing-${showingUp}`,
      nodeIds,
      label: 'A recurring way of showing up',
      note: 'These reflections echo the same kind of presence in your journey.',
      source: 'explicit',
      status: 'emerging',
    });
  }

  // Growth direction linked to recent Skywrites — explicit goals + authored stars.
  const growthNodes = eligibleNodes.filter((node) => node.type === 'growth');
  if (growthNodes.length > 0 && skywriteNodes.length >= 2) {
    const growthId = growthNodes[0].id;
    const recentSkywrites = skywriteNodes.slice(0, 3).map((node) => node.id);
    register({
      id: 'pattern-growth-journey',
      nodeIds: [growthId, ...recentSkywrites.slice(0, 2)],
      label: 'Growing toward something',
      note: 'Your growth and recent Skywrites are moving in the same direction.',
      source: 'explicit',
      status: 'emerging',
    });
  }

  // Guidance aligned with recent activity — explicit guidance + stars/reflections.
  const guidanceNodes = eligibleNodes.filter((node) => node.type === 'guidance');
  const reflectionNodes = eligibleNodes.filter((node) => node.type === 'reflection');
  if (guidanceNodes.length > 0 && (skywriteNodes.length > 0 || reflectionNodes.length > 0)) {
    const linked = [
      guidanceNodes[0].id,
      ...(skywriteNodes[0] ? [skywriteNodes[0].id] : []),
      ...(reflectionNodes[0] ? [reflectionNodes[0].id] : []),
    ].slice(0, 3);
    register({
      id: 'pattern-guidance-activity',
      nodeIds: linked,
      label: 'Guidance in motion',
      note: 'Your guiding light connects with what you’ve been living and reflecting on.',
      source: 'explicit',
      status: 'possible',
    });
  }

  // Shared community involvement — explicit joins + community/connection nodes.
  if (sources.joinedCommunities.length >= 2) {
    const communityNodeIds = eligibleNodes
      .filter((node) => node.layer === 'communities' || node.layer === 'connections')
      .map((node) => node.id);
    if (communityNodeIds.length >= 2) {
      register({
        id: 'pattern-communities',
        nodeIds: communityNodeIds.slice(0, 4),
        label: 'Communities in orbit',
        note: 'Your sky holds more than one place you belong.',
        source: 'explicit',
        status: 'emerging',
      });
    }
  }

  // Contribution / impact thread — explicit impact activities.
  const impactNodes = eligibleNodes.filter((node) => node.type === 'impact');
  if (impactNodes.length >= 2) {
    register({
      id: 'pattern-impact-thread',
      nodeIds: impactNodes.slice(0, 3).map((node) => node.id),
      label: 'Ripples of contribution',
      note: 'These moments of impact echo each other in your sky.',
      source: 'explicit',
      status: 'emerging',
    });
  }

  return patterns.slice(0, MAX_PATTERNS);
}

/** Hub-style edges for clearer constellation shapes — memo-friendly output. */
export function buildConstellationRelationships(patterns: SkyPattern[]): SkyRelationship[] {
  const relationships: SkyRelationship[] = [];

  for (const pattern of patterns) {
    if (pattern.nodeIds.length < 2) continue;

    if (pattern.nodeIds.length === 2) {
      relationships.push({
        id: `${pattern.id}-edge-0`,
        fromNodeId: pattern.nodeIds[0],
        toNodeId: pattern.nodeIds[1],
        patternId: pattern.id,
        source: pattern.source,
      });
      continue;
    }

    const hubId = pattern.nodeIds[0];
    for (let i = 1; i < pattern.nodeIds.length; i += 1) {
      relationships.push({
        id: `${pattern.id}-edge-${i}`,
        fromNodeId: hubId,
        toNodeId: pattern.nodeIds[i],
        patternId: pattern.id,
        source: pattern.source,
      });
    }
  }

  return relationships;
}

export function filterRelationshipsForReveal(
  relationships: SkyRelationship[],
  revealPatternId: string | null,
): SkyRelationship[] {
  if (!revealPatternId) return relationships;
  return relationships.filter((edge) => edge.patternId === revealPatternId);
}

export function emphasizedNodesForPattern(
  patterns: SkyPattern[],
  revealPatternId: string | null,
): Set<string> {
  if (!revealPatternId) {
    const all = new Set<string>();
    patterns.forEach((pattern) => pattern.nodeIds.forEach((id) => all.add(id)));
    return all;
  }
  const pattern = patterns.find((entry) => entry.id === revealPatternId);
  return new Set(pattern?.nodeIds ?? []);
}

export function findPatternById(
  patterns: SkyPattern[],
  patternId: string | null | undefined,
): SkyPattern | null {
  if (!patternId) return null;
  return patterns.find((pattern) => pattern.id === patternId) ?? null;
}

export function findPatternForNodeId(
  patterns: SkyPattern[],
  nodeId: string,
): SkyPattern | null {
  return patterns.find((pattern) => pattern.nodeIds.includes(nodeId)) ?? null;
}
