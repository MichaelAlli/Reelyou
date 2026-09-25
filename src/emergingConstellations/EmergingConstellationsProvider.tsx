import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { useReelyouConnect } from '@/connect/ReelyouConnectProvider';
import { currentUser } from '@/data/mockData';
import { isEmergingConstellationDemoEnabled } from '@/constants/devFlags';
import {
  fixtureEncouragementsForCommunity,
  fixturePostsForCommunity,
  fixtureRepliesForCommunity,
} from '@/emergingConstellations/communitySocialFixtures';
import { pushCommunityMeaningfulSignal } from '@/emergingConstellations/communityMeaningfulSignalOutbox';
import { syncCommunityMuteRegistry } from '@/emergingConstellations/communitySignalMuteRegistry';
import { hasEncouraged } from '@/emergingConstellations/communitySocialLogic';
import {
  devEmergingConstellationIfEligible,
  resolveEmergingConstellationById,
} from '@/emergingConstellations/emergingConstellationFixtures';
import {
  EmergingConstellationsContext,
  type EmergingConstellationsContextValue,
} from '@/emergingConstellations/emergingConstellationsContext';
import type {
  CommunityEncouragement,
  CommunityMembership,
  CommunityMessage,
  CommunityPost,
  CommunityPostKind,
  CommunityPostReply,
  EmergingConstellation,
} from '@/emergingConstellations/emergingConstellationTypes';
import {
  EMPTY_EMERGING_CONSTELLATIONS_STATE,
  loadEmergingConstellationsState,
  saveEmergingConstellationsState,
  type EmergingConstellationsPersistedState,
} from '@/emergingConstellations/emergingConstellationPersistence';
import {
  emitCommunityBelongingSignal,
  emitCommunityReplySignal,
  emitEmergingConstellationCandidate,
} from '@/signals/canonical/canonicalSignalEmitters';
import { createCanonicalSignalStore } from '@/signals/canonical/canonicalSignalStore';

const DISMISS_COOLDOWN_MS = 7 * 86400_000;

function notifyFixtureRepliesForOwner(
  state: EmergingConstellationsPersistedState,
  communityId: string,
) {
  const membership = state.memberships.find(
    (entry) =>
      entry.communityId === communityId &&
      entry.userId === currentUser.id &&
      entry.status === 'joined',
  );
  if (membership?.notificationsMuted) return;
  const posts = state.postsByCommunity[communityId] ?? [];
  for (const post of posts) {
    if (post.authorUserId !== currentUser.id) continue;
    for (const reply of state.repliesByPost[post.id] ?? []) {
      if (reply.authorUserId === currentUser.id) continue;
      pushCommunityMeaningfulSignal({
        signalId: `sig-community-reply-${reply.id}`,
        userId: currentUser.id,
        type: 'community_reply',
        title: 'Someone responded to your reflection',
        description: reply.content.slice(0, 120),
        createdAt: reply.createdAt,
        communityId,
        postId: post.id,
        destinationRoute: '/emerging-constellation/post',
        destinationParams: { id: communityId, postId: post.id },
      });
    }
  }
}

function seedFixtureContent(
  state: EmergingConstellationsPersistedState,
  communityId: string,
): EmergingConstellationsPersistedState {
  if (state.fixturesSeededForCommunityIds.includes(communityId)) return state;
  const posts = fixturePostsForCommunity(communityId);
  const replies = fixtureRepliesForCommunity(communityId);
  const encouragements = fixtureEncouragementsForCommunity(communityId);
  const repliesByPost = { ...state.repliesByPost };
  for (const reply of replies) {
    repliesByPost[reply.postId] = [...(repliesByPost[reply.postId] ?? []), reply];
  }
  return {
    ...state,
    fixturesSeededForCommunityIds: [...state.fixturesSeededForCommunityIds, communityId],
    postsByCommunity: {
      ...state.postsByCommunity,
      [communityId]: [...(state.postsByCommunity[communityId] ?? []), ...posts],
    },
    repliesByPost,
    encouragements: [...state.encouragements, ...encouragements],
  };
}

export function EmergingConstellationsProvider({ children }: { children: ReactNode }) {
  const { preferences } = useReelyouConnect();
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<EmergingConstellationsPersistedState>(
    EMPTY_EMERGING_CONSTELLATIONS_STATE,
  );
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const canonicalStore = useRef(createCanonicalSignalStore());
  const emergingSignalEmitted = useRef(false);

  useEffect(() => {
    let mounted = true;
    void loadEmergingConstellationsState().then((loaded) => {
      if (!mounted) return;
      setState(loaded);
      syncCommunityMuteRegistry(loaded.memberships, currentUser.id);
      setReady(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    syncCommunityMuteRegistry(state.memberships, currentUser.id);
  }, [state.memberships]);

  const persist = useCallback((next: EmergingConstellationsPersistedState) => {
    setState(next);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void saveEmergingConstellationsState(next);
    }, 280);
  }, []);

  const emergenceSuggestionsAllowed = useMemo(() => {
    if (!isEmergingConstellationDemoEnabled()) return false;
    if (!preferences.discoveryPreferences.showOpportunityDiscovery) return false;
    return (
      preferences.personalizationPreferences.useActivityPatterns ||
      preferences.personalizationPreferences.useExplicitInterests
    );
  }, [preferences.discoveryPreferences.showOpportunityDiscovery, preferences.personalizationPreferences]);

  const activeSuggestion = useMemo(() => {
    if (!ready || !emergenceSuggestionsAllowed) return null;
    const candidate = devEmergingConstellationIfEligible();
    if (!candidate) return null;
    const cooldownUntil = state.dismissCooldownUntil[candidate.id] ?? 0;
    if (cooldownUntil > Date.now()) return null;
    if (state.dismissedSuggestionIds.includes(candidate.id)) return null;
    const joined = state.memberships.some(
      (entry) => entry.communityId === candidate.id && entry.status === 'joined',
    );
    if (joined) return null;
    return candidate;
  }, [
    emergenceSuggestionsAllowed,
    ready,
    state.dismissCooldownUntil,
    state.dismissedSuggestionIds,
    state.memberships,
  ]);

  useEffect(() => {
    if (!activeSuggestion || emergingSignalEmitted.current) return;
    emergingSignalEmitted.current = true;
    emitEmergingConstellationCandidate(
      canonicalStore.current,
      currentUser.id,
      activeSuggestion.id,
      [...activeSuggestion.relatedSkyAreaIds],
      [...activeSuggestion.emergenceEvidenceIds],
    );
    pushCommunityMeaningfulSignal({
      signalId: `sig-emerging-${activeSuggestion.id}`,
      userId: currentUser.id,
      type: 'emerging_constellation_available',
      title: 'A constellation may be forming',
      description: activeSuggestion.sharedTheme,
      createdAt: Date.now(),
      communityId: activeSuggestion.id,
      destinationRoute: '/emerging-constellation/preview',
      destinationParams: { id: activeSuggestion.id },
    });
  }, [activeSuggestion]);

  const dismissSuggestion = useCallback(
    (constellationId: string) => {
      persist({
        ...state,
        dismissedSuggestionIds: state.dismissedSuggestionIds.includes(constellationId)
          ? state.dismissedSuggestionIds
          : [...state.dismissedSuggestionIds, constellationId],
        dismissCooldownUntil: {
          ...state.dismissCooldownUntil,
          [constellationId]: Date.now() + DISMISS_COOLDOWN_MS,
        },
      });
    },
    [persist, state],
  );

  const joinConstellation = useCallback(
    (constellationId: string) => {
      const existing = state.memberships.find(
        (entry) => entry.communityId === constellationId && entry.userId === currentUser.id,
      );
      if (existing?.status === 'joined') return;
      let next = seedFixtureContent(state, constellationId);
      const filtered = next.memberships.filter(
        (entry) => !(entry.communityId === constellationId && entry.userId === currentUser.id),
      );
      next = {
        ...next,
        memberships: [
          ...filtered,
          {
            communityId: constellationId,
            userId: currentUser.id,
            status: 'joined',
            role: 'member',
            joinedAt: Date.now(),
            notificationsMuted: false,
          },
        ],
      };
      persist(next);
      notifyFixtureRepliesForOwner(next, constellationId);
      emitCommunityBelongingSignal(canonicalStore.current, currentUser.id, constellationId);
      pushCommunityMeaningfulSignal({
        signalId: `sig-community-joined-${constellationId}`,
        userId: currentUser.id,
        type: 'community_belonging',
        title: 'You joined a community',
        description: 'You can share perspective and find support when it feels right.',
        createdAt: Date.now(),
        communityId: constellationId,
        destinationRoute: '/emerging-constellation',
        destinationParams: { id: constellationId },
      });
    },
    [persist, state],
  );

  const leaveConstellation = useCallback(
    (constellationId: string) => {
      persist({
        ...state,
        memberships: state.memberships.map((entry) =>
          entry.communityId === constellationId && entry.userId === currentUser.id
            ? { ...entry, status: 'left', joinedAt: null, leftAt: Date.now() }
            : entry,
        ),
      });
    },
    [persist, state],
  );

  const muteConstellation = useCallback(
    (constellationId: string, muted: boolean) => {
      persist({
        ...state,
        memberships: state.memberships.map((entry) =>
          entry.communityId === constellationId && entry.userId === currentUser.id
            ? { ...entry, notificationsMuted: muted }
            : entry,
        ),
      });
    },
    [persist, state],
  );

  const createPost = useCallback(
    (communityId: string, content: string, kind: CommunityPostKind = 'reflection') => {
      const trimmed = content.trim();
      if (!trimmed) return null;
      const membership = state.memberships.find(
        (entry) =>
          entry.communityId === communityId &&
          entry.userId === currentUser.id &&
          entry.status === 'joined',
      );
      if (!membership) return null;
      const id = `cp-${communityId}-${Date.now()}`;
      const post: CommunityPost = {
        id,
        communityId,
        authorUserId: currentUser.id,
        kind,
        content: trimmed,
        moderationStatus: 'visible',
        createdAt: Date.now(),
      };
      persist({
        ...state,
        postsByCommunity: {
          ...state.postsByCommunity,
          [communityId]: [...(state.postsByCommunity[communityId] ?? []), post],
        },
      });
      return id;
    },
    [persist, state],
  );

  const createReply = useCallback(
    (communityId: string, postId: string, content: string) => {
      const trimmed = content.trim();
      if (!trimmed) return null;
      const membership = state.memberships.find(
        (entry) =>
          entry.communityId === communityId &&
          entry.userId === currentUser.id &&
          entry.status === 'joined',
      );
      if (!membership) return null;
      const post = (state.postsByCommunity[communityId] ?? []).find((entry) => entry.id === postId);
      if (!post) return null;
      const id = `cpr-${postId}-${Date.now()}`;
      const reply: CommunityPostReply = {
        id,
        communityId,
        postId,
        authorUserId: currentUser.id,
        content: trimmed,
        moderationStatus: 'visible',
        createdAt: Date.now(),
      };
      persist({
        ...state,
        repliesByPost: {
          ...state.repliesByPost,
          [postId]: [...(state.repliesByPost[postId] ?? []), reply],
        },
      });
      if (
        post.authorUserId === currentUser.id &&
        reply.authorUserId === currentUser.id
      ) {
        return id;
      }
      if (
        post.authorUserId === currentUser.id &&
        !membership.notificationsMuted
      ) {
        emitCommunityReplySignal(
          canonicalStore.current,
          currentUser.id,
          communityId,
          postId,
          id,
          reply.authorUserId,
        );
        pushCommunityMeaningfulSignal({
          signalId: `sig-community-reply-${id}`,
          userId: currentUser.id,
          type: 'community_reply',
          title: 'Someone responded to your reflection',
          description: trimmed.slice(0, 120),
          createdAt: Date.now(),
          communityId,
          postId,
          destinationRoute: '/emerging-constellation/post',
          destinationParams: { id: communityId, postId },
        });
      }
      return id;
    },
    [persist, state],
  );

  const encourageTarget = useCallback(
    (communityId: string, targetType: 'post' | 'reply', targetId: string) => {
      if (
        hasEncouraged(state.encouragements, targetType, targetId, currentUser.id)
      ) {
        return false;
      }
      const membership = state.memberships.find(
        (entry) =>
          entry.communityId === communityId &&
          entry.userId === currentUser.id &&
          entry.status === 'joined',
      );
      if (!membership) return false;
      const encouragement: CommunityEncouragement = {
        id: `ce-${targetType}-${targetId}-${currentUser.id}`,
        communityId,
        targetType,
        targetId,
        fromUserId: currentUser.id,
        createdAt: Date.now(),
      };
      persist({
        ...state,
        encouragements: [...state.encouragements, encouragement],
      });
      return true;
    },
    [persist, state],
  );

  const sendMessage = useCallback(
    (communityId: string, body: string, replyToMessageId?: string) => {
      void createPost(communityId, body, replyToMessageId ? 'update' : 'reflection');
    },
    [createPost],
  );

  const membershipFor = useCallback(
    (communityId: string) =>
      state.memberships.find(
        (entry) => entry.communityId === communityId && entry.userId === currentUser.id,
      ),
    [state.memberships],
  );

  const joinedMemberships = useMemo(
    () =>
      state.memberships.filter(
        (entry) => entry.userId === currentUser.id && entry.status === 'joined',
      ),
    [state.memberships],
  );

  const postById = useCallback(
    (communityId: string, postId: string) =>
      (state.postsByCommunity[communityId] ?? []).find((entry) => entry.id === postId),
    [state.postsByCommunity],
  );

  const messagesByCommunity = useMemo(() => {
    const out: Record<string, CommunityMessage[]> = {};
    for (const [communityId, posts] of Object.entries(state.postsByCommunity)) {
      out[communityId] = posts.map((post) => ({
        id: post.id,
        communityId,
        authorUserId: post.authorUserId,
        body: post.content,
        moderationStatus: post.moderationStatus,
        createdAt: post.createdAt,
      }));
    }
    return out;
  }, [state.postsByCommunity]);

  const value = useMemo(
    () => ({
      ready,
      activeSuggestion,
      dismissedSuggestionIds: state.dismissedSuggestionIds,
      memberships: state.memberships,
      postsByCommunity: state.postsByCommunity,
      repliesByPost: state.repliesByPost,
      encouragements: state.encouragements,
      messagesByCommunity,
      resolveConstellation: resolveEmergingConstellationById,
      dismissSuggestion,
      joinConstellation,
      leaveConstellation,
      muteConstellation,
      createPost,
      createReply,
      encourageTarget,
      sendMessage,
      membershipFor,
      joinedMemberships,
      postById,
    }),
    [
      activeSuggestion,
      createPost,
      createReply,
      dismissSuggestion,
      encourageTarget,
      joinConstellation,
      joinedMemberships,
      leaveConstellation,
      membershipFor,
      messagesByCommunity,
      muteConstellation,
      postById,
      ready,
      sendMessage,
      state,
    ],
  );

  return (
    <EmergingConstellationsContext.Provider value={value}>
      {children}
    </EmergingConstellationsContext.Provider>
  );
}

export { useEmergingConstellations } from '@/emergingConstellations/emergingConstellationsContext';
