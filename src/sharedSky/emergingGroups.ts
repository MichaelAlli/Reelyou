import { getCommunityById } from '@/constants/communitiesData';
import type { SkyPattern } from '@/mySky/skyNodeTypes';
import type { MySkySources } from '@/mySky/mySkyState';

import type { EmergingGroup } from '@/sharedSky/sharedSkyTypes';

const MAX_EMERGING = 4;

function safeWhyThis(pattern: SkyPattern): string {
  if (pattern.note?.trim()) {
    return pattern.note.trim();
  }
  if (pattern.label?.trim()) {
    return `You’ve been returning to themes around ${pattern.label.toLowerCase()}.`;
  }
  return 'You’ve been reflecting on similar questions in your sky lately.';
}

function lifecycleForPattern(pattern: SkyPattern): EmergingGroup['lifecycle'] {
  if (pattern.status === 'established') return 'visible';
  if (pattern.status === 'emerging') return 'emerging';
  if (pattern.status === 'possible') return 'weak';
  return 'hidden';
}

/** Map shared patterns → emerging group anchors (fixture-free when patterns exist). */
export function deriveEmergingGroups(
  patterns: SkyPattern[],
  sources: MySkySources,
): EmergingGroup[] {
  const joinedNames = new Set(sources.joinedCommunities.map((entry) => entry.name.toLowerCase()));
  const now = new Date().toISOString();

  const fromPatterns = patterns
    .filter((pattern) => pattern.nodeIds.length >= 2)
    .slice(0, MAX_EMERGING)
    .map((pattern): EmergingGroup => {
      const lifecycle = lifecycleForPattern(pattern);
      return {
        id: `emerging-${pattern.id}`,
        constellationId: pattern.id,
        patternId: pattern.id,
        communityId: null,
        memberNodeIds: [...pattern.nodeIds],
        themeIds: [],
        strengthBand: pattern.nodeIds.length >= 4 ? 'high' : pattern.nodeIds.length >= 3 ? 'medium' : 'low',
        primaryReasonCodes: pattern.source === 'explicit' ? ['like-hearted-themes'] : ['supporting-pattern'],
        lifecycle,
        joined: false,
        dismissed: false,
        createdAt: pattern.createdAt,
        updatedAt: pattern.updatedAt,
        lastSurfacedAt: now,
        whyThis: safeWhyThis(pattern),
        title: pattern.label ?? 'Emerging pattern',
      };
    });

  const fromCommunities = sources.joinedCommunities.map((joined): EmergingGroup => {
    const community = getCommunityById(joined.id);
    return {
      id: `joined-community-${joined.id}`,
      constellationId: null,
      patternId: null,
      communityId: joined.id,
      memberNodeIds: [],
      themeIds: [joined.id],
      strengthBand: 'high',
      primaryReasonCodes: ['explicit-join'],
      lifecycle: 'joined',
      joined: true,
      dismissed: false,
      createdAt: now,
      updatedAt: now,
      lastSurfacedAt: now,
      whyThis: community
        ? `You joined ${community.name} — a place you chose to return to.`
        : `You joined ${joined.name} — a community you chose to belong to.`,
      title: joined.name,
    };
  });

  return [...fromCommunities, ...fromPatterns.filter((group) => group.lifecycle !== 'hidden')];
}
