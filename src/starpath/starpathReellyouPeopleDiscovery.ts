import { isReelyouAuthConfigured } from '@/auth/reellyouAuthConfig';
import { isLegacyDemoEnabled } from '@/constants/devFlags';
import { orbitUsers } from '@/data/mockData';
import { resolvePublicSkyOwnerProfile } from '@/mySky/skyIdentity';
import type { OpportunityCandidate } from '@/starpath/starpathOpportunityTypes';
import type { StarPathGuidanceSafeInputs } from '@/starpath/starpathGuidanceInputs';
import { isMutualSkyFriends, listFollowing } from '@/social/skyFollow/skyFollowLogic';
import type { SkyFollowGraph } from '@/social/skyFollow/skyFollowTypes';
import { buildVisitorProfileHref } from '@/profile/visitorProfileRoute';

export interface ReellyouPeopleDiscoveryInput {
  viewerId: string;
  graph: SkyFollowGraph;
  blockedUserIds: readonly string[];
  inputs: StarPathGuidanceSafeInputs;
  now: number;
}

function keywordOverlap(text: string, hints: string[]): number {
  const lower = text.toLowerCase();
  let score = 0;
  for (const h of hints) {
    const token = h.toLowerCase();
    if (token.length > 2 && lower.includes(token)) score += 1;
  }
  return score;
}

/**
 * Suggest discoverable Reelyou members using permitted connection signals only.
 * Does not auto-follow or message; links open visitor profile.
 */
export function discoverReellyouPeopleCandidates(
  input: ReellyouPeopleDiscoveryInput,
): OpportunityCandidate[] {
  const hints = [
    ...(input.inputs.todayFocusText ? [input.inputs.todayFocusText] : []),
    ...input.inputs.explicitGoalHints,
    ...input.inputs.elevatedBranchIds,
    ...input.inputs.journeyPatternAreaIds,
  ];
  if (hints.length === 0) return [];

  const blocked = new Set(input.blockedUserIds);
  const scored: { userId: string; score: number }[] = [];

  if (isReelyouAuthConfigured() && !isLegacyDemoEnabled()) {
    return [];
  }

  for (const orbit of orbitUsers) {
    if (orbit.id === input.viewerId || blocked.has(orbit.id)) continue;
    const mutual = isMutualSkyFriends(input.graph, input.viewerId, orbit.id);
    const viewerFollows = listFollowing(input.graph, input.viewerId).includes(orbit.id);
    if (!mutual && !viewerFollows) continue;

    const profile = resolvePublicSkyOwnerProfile(orbit.id, mutual ? 'connected' : 'none');
    if (!profile) continue;

    const corpus = `${profile.name} ${profile.subtitle ?? ''} ${orbit.themes.join(' ')}`;
    let score = keywordOverlap(corpus, hints);
    if (mutual) score += 2;
    if (input.inputs.recentExplicitInterests.some((id) => corpus.toLowerCase().includes(id))) {
      score += 0.5;
    }
    if (score <= 0) continue;
    scored.push({ userId: orbit.id, score });
  }

  scored.sort((a, b) => b.score - a.score || a.userId.localeCompare(b.userId));

  return scored.slice(0, 3).map(({ userId, score }) => {
    const profile = resolvePublicSkyOwnerProfile(userId, 'connected');
    const path = buildVisitorProfileHref(userId);
    const origin =
      typeof globalThis !== 'undefined'
        ? (globalThis as { location?: { origin?: string } }).location?.origin
        : undefined;
    const officialUrl = origin ? `${origin}${path}` : path;

    return {
      id: `reellyou-person-${userId}`,
      title: profile?.name ?? userId,
      opportunityType: 'mentor',
      provider: 'Reelyou',
      sourceName: 'Reelyou member (discoverable)',
      officialUrl,
      description:
        'Someone in your permitted Sky network who may share themes you are exploring. View their profile — no automatic follow or message.',
      categories: ['relationships', 'community'],
      relatedBranchIds: ['relationships'],
      relatedNodeIds: [],
      reasonCodes: ['exploration_context'],
      freshnessStatus: 'fresh',
      verificationStatus: 'verified',
      retrievedAt: input.now,
      lastVerifiedAt: input.now,
      availabilityStatus: 'open',
      fixtureOnly: false,
    } satisfies OpportunityCandidate;
  });
}
