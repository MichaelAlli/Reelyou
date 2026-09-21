import type { MySkyStarDisplay } from '@/mySky/types';
import type { SkyNode } from '@/mySky/skyNodeTypes';

import { deriveEmergingGroups } from '@/sharedSky/emergingGroups';
import {
  deriveParticipationSignals,
  participationWeightForNode,
} from '@/sharedSky/participationSignals';
import type {
  FocusedSkyPin,
  FocusedSkySection,
  FocusedSkyView,
  SharedSkyState,
} from '@/sharedSky/sharedSkyTypes';

const MAX_CANVAS_STARS = 24;
const MAX_RECENT = 8;
const MAX_SECTIONS = 7;

function starForNode(stars: MySkyStarDisplay[], nodeId: string): MySkyStarDisplay | null {
  return stars.find((star) => star.id === nodeId) ?? null;
}

function rankNode(
  node: SkyNode,
  pins: FocusedSkyPin[],
  participation: ReturnType<typeof deriveParticipationSignals>,
  recentIds: Set<string>,
): number {
  const pinBoost = pins.some((pin) => pin.objectId === node.id) ? 1000 : 0;
  const participationBoost = participationWeightForNode(participation, node.id) * 40;
  const recencyBoost = recentIds.has(node.id) ? 25 : 0;
  const typeBoost =
    node.type === 'skywrite'
      ? 20
      : node.type === 'community'
        ? 18
        : node.type === 'relationship'
          ? 12
          : 6;
  const emphasis = node.visual.emphasis ?? 1;
  return pinBoost + participationBoost + recencyBoost + typeBoost + emphasis * 4;
}

/** Focused Skywrite experience — finite prioritized snapshot over shared graph. */
export function selectFocusedSkyView(
  shared: SharedSkyState,
  pins: FocusedSkyPin[] = [],
): FocusedSkyView {
  const { expandedView, sources, graph } = shared;
  const participation = deriveParticipationSignals(sources, graph.nodes);
  const emergingGroups = deriveEmergingGroups(expandedView.patterns, sources);
  const joinedGroups = emergingGroups.filter((group) => group.joined);
  const visibleEmerging = emergingGroups.filter(
    (group) => !group.joined && !group.dismissed && group.lifecycle !== 'hidden',
  );

  const recentSkywriteIds = [...sources.skywrites]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, MAX_RECENT)
    .map((post) => post.id);

  const recentNodeIds = new Set(
    graph.nodes
      .filter((node) => node.sourceId && recentSkywriteIds.includes(node.sourceId))
      .map((node) => node.id),
  );

  const meaningfulNodes = graph.nodes.filter(
    (node) => node.type !== 'identity' && !node.inferred,
  );

  const ranked = [...meaningfulNodes].sort(
    (a, b) => rankNode(b, pins, participation, recentNodeIds) - rankNode(a, pins, participation, recentNodeIds),
  );

  const pinnedNodeIds = pins
    .filter((pin) => pin.objectType === 'star' || pin.objectType === 'skywrite')
    .map((pin) => pin.objectId);

  const prioritizedNodeIds: string[] = [];
  const pushUnique = (id: string) => {
    if (!prioritizedNodeIds.includes(id)) prioritizedNodeIds.push(id);
  };

  for (const pinId of pinnedNodeIds) pushUnique(pinId);
  for (const node of ranked) pushUnique(node.id);

  const canvasStars = prioritizedNodeIds
    .map((id) => starForNode(expandedView.stars, id))
    .filter((star): star is MySkyStarDisplay => Boolean(star))
    .slice(0, MAX_CANVAS_STARS);

  const sections: FocusedSkySection[] = [
    {
      id: 'snapshot',
      kind: 'snapshot',
      title: 'Your sky right now',
      nodeIds: canvasStars.map((star) => star.id),
      groupIds: [],
    },
  ];

  if (pins.length > 0) {
    sections.push({
      id: 'pinned',
      kind: 'pinned',
      title: 'Pinned for you',
      nodeIds: pinnedNodeIds,
      groupIds: pins.filter((pin) => pin.objectType === 'constellation').map((pin) => pin.objectId),
    });
  }

  if (joinedGroups.length > 0) {
    sections.push({
      id: 'joined',
      kind: 'joined',
      title: 'Places you belong',
      nodeIds: [],
      groupIds: joinedGroups.map((group) => group.id),
    });
  }

  if (visibleEmerging.length > 0) {
    sections.push({
      id: 'emerging',
      kind: 'emerging',
      title: 'Emerging possibilities',
      nodeIds: visibleEmerging.flatMap((group) => group.memberNodeIds).slice(0, 12),
      groupIds: visibleEmerging.map((group) => group.id),
    });
  }

  const recentStars = [...recentNodeIds]
    .map((id) => starForNode(expandedView.stars, id))
    .filter((star): star is MySkyStarDisplay => Boolean(star));

  if (recentStars.length > 0) {
    sections.push({
      id: 'recent',
      kind: 'recent',
      title: 'Recent reflections',
      nodeIds: recentStars.map((star) => star.id),
      groupIds: [],
    });
  }

  const opportunityNodes = graph.nodes.filter(
    (node) => node.destination === 'starpath' || node.type === 'guidance',
  );
  if (opportunityNodes.length > 0) {
    sections.push({
      id: 'opportunity',
      kind: 'opportunity',
      title: 'Possibilities nearby',
      nodeIds: opportunityNodes.map((node) => node.id).slice(0, 6),
      groupIds: [],
    });
  }

  const peaceState =
    canvasStars.length <= 2 && joinedGroups.length === 0 && visibleEmerging.length === 0;

  if (peaceState) {
    sections.push({
      id: 'peace',
      kind: 'peace',
      title: 'A quiet sky',
      nodeIds: [],
      groupIds: [],
    });
  }

  return {
    shared,
    sections: sections.slice(0, MAX_SECTIONS),
    canvasStars,
    prioritizedNodeIds,
    pins,
    emergingGroups: visibleEmerging,
    joinedGroups,
    peaceState,
    maxVerticalSections: MAX_SECTIONS,
  };
}
