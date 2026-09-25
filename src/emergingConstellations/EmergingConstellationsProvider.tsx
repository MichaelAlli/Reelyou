import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { currentUser } from '@/data/mockData';
import { isEmergingConstellationDemoEnabled } from '@/constants/devFlags';
import type {
  CommunityMembership,
  CommunityMessage,
  EmergingConstellation,
} from '@/emergingConstellations/emergingConstellationTypes';
import { devEmergingConstellationIfEligible } from '@/emergingConstellations/emergingConstellationFixtures';

interface EmergingConstellationsContextValue {
  activeSuggestion: EmergingConstellation | null;
  dismissedSuggestionIds: readonly string[];
  memberships: readonly CommunityMembership[];
  messagesByCommunity: Readonly<Record<string, readonly CommunityMessage[]>>;
  dismissSuggestion: (constellationId: string) => void;
  joinConstellation: (constellationId: string) => void;
  leaveConstellation: (constellationId: string) => void;
  muteConstellation: (constellationId: string, muted: boolean) => void;
  sendMessage: (communityId: string, body: string, replyToMessageId?: string) => void;
  membershipFor: (communityId: string) => CommunityMembership | undefined;
}

const EmergingConstellationsContext = createContext<EmergingConstellationsContextValue | null>(
  null,
);

export function EmergingConstellationsProvider({ children }: { children: ReactNode }) {
  const [dismissedSuggestionIds, setDismissedSuggestionIds] = useState<string[]>([]);
  const [memberships, setMemberships] = useState<CommunityMembership[]>([]);
  const [messagesByCommunity, setMessagesByCommunity] = useState<
    Record<string, CommunityMessage[]>
  >({});

  const activeSuggestion = useMemo(() => {
    if (!isEmergingConstellationDemoEnabled()) return null;
    const candidate = devEmergingConstellationIfEligible();
    if (!candidate) return null;
    if (dismissedSuggestionIds.includes(candidate.id)) return null;
    const joined = memberships.some(
      (entry) => entry.communityId === candidate.id && entry.status === 'joined',
    );
    if (joined) return null;
    return candidate;
  }, [dismissedSuggestionIds, memberships]);

  const dismissSuggestion = useCallback((constellationId: string) => {
    setDismissedSuggestionIds((current) =>
      current.includes(constellationId) ? current : [...current, constellationId],
    );
  }, []);

  const joinConstellation = useCallback((constellationId: string) => {
    setMemberships((current) => {
      const existing = current.find((entry) => entry.communityId === constellationId);
      if (existing?.status === 'joined') return current;
      const filtered = current.filter((entry) => entry.communityId !== constellationId);
      return [
        ...filtered,
        {
          communityId: constellationId,
          userId: currentUser.id,
          status: 'joined',
          role: 'member',
          joinedAt: Date.now(),
          notificationsMuted: false,
        },
      ];
    });
  }, []);

  const leaveConstellation = useCallback((constellationId: string) => {
    setMemberships((current) =>
      current.map((entry) =>
        entry.communityId === constellationId
          ? { ...entry, status: 'left', joinedAt: null }
          : entry,
      ),
    );
  }, []);

  const muteConstellation = useCallback((constellationId: string, muted: boolean) => {
    setMemberships((current) =>
      current.map((entry) =>
        entry.communityId === constellationId
          ? { ...entry, notificationsMuted: muted }
          : entry,
      ),
    );
  }, []);

  const sendMessage = useCallback(
    (communityId: string, body: string, replyToMessageId?: string) => {
      const trimmed = body.trim();
      if (!trimmed) return;
      const message: CommunityMessage = {
        id: `cm-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        communityId,
        authorUserId: currentUser.id,
        body: trimmed,
        replyToMessageId,
        moderationStatus: 'visible',
        createdAt: Date.now(),
      };
      setMessagesByCommunity((current) => ({
        ...current,
        [communityId]: [...(current[communityId] ?? []), message],
      }));
    },
    [],
  );

  const membershipFor = useCallback(
    (communityId: string) =>
      memberships.find(
        (entry) => entry.communityId === communityId && entry.userId === currentUser.id,
      ),
    [memberships],
  );

  const value = useMemo(
    () => ({
      activeSuggestion,
      dismissedSuggestionIds,
      memberships,
      messagesByCommunity,
      dismissSuggestion,
      joinConstellation,
      leaveConstellation,
      muteConstellation,
      sendMessage,
      membershipFor,
    }),
    [
      activeSuggestion,
      dismissedSuggestionIds,
      joinConstellation,
      leaveConstellation,
      membershipFor,
      memberships,
      messagesByCommunity,
      muteConstellation,
      sendMessage,
      dismissSuggestion,
    ],
  );

  return (
    <EmergingConstellationsContext.Provider value={value}>
      {children}
    </EmergingConstellationsContext.Provider>
  );
}

export function useEmergingConstellations(): EmergingConstellationsContextValue {
  const ctx = useContext(EmergingConstellationsContext);
  if (!ctx) {
    throw new Error('useEmergingConstellations must be used within EmergingConstellationsProvider');
  }
  return ctx;
}
