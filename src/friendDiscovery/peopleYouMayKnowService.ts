import { orbitUsers } from '@/data/mockData';
import type {
  FriendDiscoveryState,
  PeopleYouMayKnowSuggestion,
} from '@/friendDiscovery/friendDiscoveryTypes';
import { resolvePublicSkyOwnerProfile } from '@/mySky/skyIdentity';
import {
  isFollowingSkyUser,
  listFollowers,
  listFollowing,
} from '@/social/skyFollow/skyFollowLogic';
import type { SkyFollowGraph } from '@/social/skyFollow/skyFollowTypes';

export function countMutualSkyConnections(
  graph: SkyFollowGraph,
  viewerId: string,
  candidateId: string,
): number {
  const viewerFollowing = new Set(listFollowing(graph, viewerId));
  const candidateFollowers = listFollowers(graph, candidateId);
  let count = 0;
  for (const id of candidateFollowers) {
    if (id === viewerId || id === candidateId) continue;
    if (viewerFollowing.has(id)) count += 1;
  }
  return count;
}

export interface BuildPeopleYouMayKnowInput {
  viewerId: string;
  graph: SkyFollowGraph;
  blockedUserIds: readonly string[];
  friendDiscovery: FriendDiscoveryState;
  reduceSuggestions: boolean;
}

export function buildPeopleYouMayKnowSuggestions(
  input: BuildPeopleYouMayKnowInput,
): PeopleYouMayKnowSuggestion[] {
  if (input.reduceSuggestions) return [];

  const blocked = new Set(input.blockedUserIds);
  const dismissed = new Set(input.friendDiscovery.dismissedSuggestionUserIds);
  const following = new Set(listFollowing(input.graph, input.viewerId));
  const byUser = new Map<string, PeopleYouMayKnowSuggestion>();

  function consider(
    userId: string,
    source: PeopleYouMayKnowSuggestion['source'],
    reasonLabel: string,
    mutualCount?: number,
  ) {
    if (userId === input.viewerId || blocked.has(userId) || dismissed.has(userId)) return;
    if (following.has(userId)) return;
    if (!resolvePublicSkyOwnerProfile(userId, 'none')) return;
    const existing = byUser.get(userId);
    if (existing) return;
    byUser.set(userId, { userId, source, reasonLabel, mutualCount });
  }

  for (const id of input.friendDiscovery.contactMatchUserIds) {
    consider(id, 'phone_contacts', 'From your contacts');
  }
  for (const id of input.friendDiscovery.googleMatchUserIds) {
    consider(id, 'google_contacts', 'From Google Contacts');
  }
  for (const id of input.friendDiscovery.facebookMatchUserIds) {
    consider(id, 'facebook', 'From Facebook');
  }

  for (const orbit of orbitUsers) {
    const mutual = countMutualSkyConnections(input.graph, input.viewerId, orbit.id);
    if (mutual >= 1) {
      const label =
        mutual === 1 ? '1 mutual connection' : `${mutual} mutual connections`;
      consider(orbit.id, 'mutual_connections', label, mutual);
    }
  }

  const list = [...byUser.values()];
  list.sort((a, b) => {
    const score = (s: PeopleYouMayKnowSuggestion) => {
      if (s.source === 'phone_contacts' || s.source === 'google_contacts') return 3;
      if (s.source === 'facebook') return 2;
      return 1 + (s.mutualCount ?? 0) * 0.1;
    };
    return score(b) - score(a);
  });

  return list.slice(0, 12);
}

export function isUserDiscoverableForMatching(
  userId: string,
  prefs: Pick<FriendDiscoveryState, 'discoverableByVerifiedPhone' | 'discoverableByVerifiedEmail'>,
): boolean {
  void userId;
  return prefs.discoverableByVerifiedPhone || prefs.discoverableByVerifiedEmail;
}

export function viewerAlreadyFollows(
  graph: SkyFollowGraph,
  viewerId: string,
  targetId: string,
): boolean {
  return isFollowingSkyUser(graph, viewerId, targetId);
}
