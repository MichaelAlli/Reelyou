import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { currentUser, orbitUsers } from '@/data/mockData';
import { useOnboarding } from '@/onboarding';
import { useSkywriteBeacon } from '@/skywrite/beacon/SkywriteBeaconProvider';
import { beaconNow } from '@/skywrite/beacon/beaconTime';
import { contributionBeaconSignalsFromQueue } from '@/skywrite/beacon/skywriteBeaconSignals';
import { useSkywriteThreads } from '@/skywrite/threads/SkywriteThreadProvider';
import { BETA_CONNECTED_USER_IDS } from '@/messages/messagesConnections';
import { canonicalThreadId } from '@/messages/messagesCanonical';
import {
  acceptMessageRequestLocal,
  blockUserLocal,
  limitUserLocal,
  removeLimitUserLocal,
  unblockUserLocal,
  declineMessageRequestLocal,
  inboxThreadIds,
  markThreadReadLocal,
  muteThreadLocal,
  openOrCreateThread,
  sendMessageLocal,
  threadMessages,
} from '@/messages/messagesLocalService';
import { loadMessagesState, saveMessagesState } from '@/messages/messagesPersistence';
import type { MessagesState } from '@/messages/messagesTypes';
import {
  canInitiateMessage,
  incomingRequestsEnabled,
} from '@/messages/messagesEligibility';
import {
  DEFAULT_USER_PREFERENCES,
  type UserPreferencesState,
  type UserPreferencesUpdate,
} from '@/preferences/userPreferencesTypes';
import { loadUserPreferences, saveUserPreferences } from '@/preferences/userPreferencesPersistence';
import { ensureModerationBootstrap } from '@/moderation/moderationBootstrap';
import { filterHomeFeedBlockedActors } from '@/moderation/moderationEnforcement';
import { submitModerationReport } from '@/moderation/moderationReportService';
import type {
  ModerationReportReason,
  SubmitModerationReportInput,
  SubmitModerationReportResult,
} from '@/moderation/moderationTypes';
import { isHomePresentationHandled as isHomePresentationHandledMeta } from '@/signals/homeSignalPresentation';
import { buildReelyouSignals, hasMeaningfulUnread } from '@/signals/reelyouSignalEngine';
import type { ReelyouSignalSources } from '@/signals/reelyouSignalSources';
import {
  EMPTY_SIGNALS_META,
  type ReelyouSignal,
  type ReelyouSignalsMetaState,
} from '@/signals/reelyouSignalTypes';
import { loadReelyouSignalsMeta, saveReelyouSignalsMeta } from '@/signals/reelyouSignalsPersistence';
import { loadStarPathResourceState } from '@/starpath/starpathResourcePersistence';
import type { StarPathResourceState } from '@/starpath/starpathOpportunityTypes';
import { EMPTY_RESOURCE_STATE } from '@/starpath/starpathOpportunityTypes';
import { personalizeAroundYourSkyFeed } from '@/social/aroundYourSky/personalizeHomeFeed';
import {
  addSkyFollowEdge,
  countSkyFriends,
  isFollowingSkyUser,
  isMutualSkyFriends,
  listFollowers,
  listFollowing,
  listSkyFriendUserIds,
  removeSkyFollowEdge,
} from '@/social/skyFollow/skyFollowLogic';
import {
  loadSkyFollowGraph,
  saveSkyFollowGraph,
} from '@/social/skyFollow/skyFollowPersistence';
import type { SkyFollowGraph } from '@/social/skyFollow/skyFollowTypes';
import { EMPTY_SKY_FOLLOW_GRAPH } from '@/social/skyFollow/skyFollowTypes';
import { isFollowingSky } from '@/social/skyFollow/resolveVisitorSkyConnection';

interface ReelyouConnectContextValue {
  ready: boolean;
  preferences: UserPreferencesState;
  updatePreferences: (patch: UserPreferencesUpdate) => void;
  messages: MessagesState;
  inboxThreadIds: string[];
  messageRequestsEnabled: boolean;
  signals: ReelyouSignal[];
  signalsMeta: ReelyouSignalsMetaState;
  hasUnreadSignals: boolean;
  dismissSignal: (signalId: string) => void;
  acknowledgeSignal: (signalId: string) => void;
  isHomePresentationHandled: (signalId: string) => boolean;
  markHomePresentationOpened: (signalIds: string | readonly string[]) => void;
  dismissHomePresentation: (signalIds: string | readonly string[]) => void;
  presentHomeSignal: (signal: ReelyouSignal) => void;
  snoozeSignal: (signalId: string, untilMs: number) => void;
  openOrCreateThreadWith: (userId: string) => string | null;
  sendMessage: (threadId: string, text: string) => void;
  markThreadRead: (threadId: string) => void;
  acceptMessageRequest: (threadId: string) => void;
  declineMessageRequest: (threadId: string) => void;
  muteThread: (threadId: string) => void;
  blockUser: (userId: string) => void;
  unblockUser: (userId: string) => void;
  limitUser: (userId: string) => void;
  removeLimitUser: (userId: string) => void;
  skyFollowGraph: SkyFollowGraph;
  skyFriendsCount: number;
  skyFriendUserIds: string[];
  listFollowingUserIds: () => string[];
  listFollowerUserIds: () => string[];
  isMutualSkyFriend: (userId: string) => boolean;
  submitModerationReport: (
    input: Omit<SubmitModerationReportInput, 'reporterUserId'>,
  ) => Promise<SubmitModerationReportResult>;
  /** @deprecated Use submitModerationReport via ModerationReportSheet. */
  reportUser: (params: {
    reportedUserId: string;
    threadId?: string;
    messageId?: string;
    reason?: ModerationReportReason;
    optionalNote?: string;
  }) => Promise<{ ok: boolean; localOnly: boolean; reportId: string; duplicate?: boolean }>;
  getThreadMessages: (threadId: string) => ReturnType<typeof threadMessages>;
  canMessageUser: (userId: string) => boolean;
  connectedUserIds: string[];
  followedSkyUserIds: string[];
  isFollowingSkyUser: (userId: string) => boolean;
  followSky: (userId: string) => void;
  unfollowSky: (userId: string) => void;
  toggleFollowSky: (userId: string) => void;
  searchableUsers: typeof orbitUsers;
}

const ReelyouConnectContext = createContext<ReelyouConnectContextValue | null>(null);

export function ReelyouConnectProvider({ children }: { children: ReactNode }) {
  const { aroundYourSkyFeed, skywrites } = useOnboarding();
  const { buildQueueForViewer } = useSkywriteBeacon();
  const { ignoreBeacon } = useSkywriteThreads();
  const [ready, setReady] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferencesState>(DEFAULT_USER_PREFERENCES);
  const [messages, setMessages] = useState<MessagesState>({
    threadsById: {},
    threadIds: [],
    messagesById: {},
    unreadThreadIds: [],
    mutedThreadIds: [],
    blockedUserIds: [],
    limitedUserIds: [],
    messageRequests: [],
    messagingVersion: 'beta-v1',
  });
  const [signalsMeta, setSignalsMeta] = useState<ReelyouSignalsMetaState>(EMPTY_SIGNALS_META);
  const [starpathResources, setStarpathResources] = useState<StarPathResourceState>(EMPTY_RESOURCE_STATE);
  const [skyFollowGraph, setSkyFollowGraph] = useState<SkyFollowGraph>(EMPTY_SKY_FOLLOW_GRAPH);
  const prefTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const followTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const msgTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const metaTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connectedUserIds = BETA_CONNECTED_USER_IDS;

  useEffect(() => {
    let mounted = true;
    void (async () => {
      const [prefs, msgs, meta, resources, followGraph] = await Promise.all([
        loadUserPreferences(),
        loadMessagesState(),
        loadReelyouSignalsMeta(),
        loadStarPathResourceState(),
        loadSkyFollowGraph(),
        ensureModerationBootstrap(),
      ]);
      if (!mounted) return;
      setPreferences(prefs);
      setMessages(msgs);
      setSignalsMeta(meta);
      setStarpathResources(resources);
      setSkyFollowGraph(followGraph);
      setReady(true);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const interval = setInterval(() => {
      void loadStarPathResourceState().then(setStarpathResources);
    }, 8000);
    return () => clearInterval(interval);
  }, [ready]);

  const schedulePrefSave = useCallback((next: UserPreferencesState) => {
    if (prefTimer.current) clearTimeout(prefTimer.current);
    prefTimer.current = setTimeout(() => void saveUserPreferences(next), 280);
  }, []);

  const scheduleMsgSave = useCallback((next: MessagesState) => {
    if (msgTimer.current) clearTimeout(msgTimer.current);
    msgTimer.current = setTimeout(() => void saveMessagesState(next), 280);
  }, []);

  const scheduleMetaSave = useCallback((next: ReelyouSignalsMetaState) => {
    if (metaTimer.current) clearTimeout(metaTimer.current);
    metaTimer.current = setTimeout(() => void saveReelyouSignalsMeta(next), 280);
  }, []);

  const scheduleFollowGraphSave = useCallback((next: SkyFollowGraph) => {
    if (followTimer.current) clearTimeout(followTimer.current);
    followTimer.current = setTimeout(() => void saveSkyFollowGraph(next), 280);
  }, []);

  const followedSkyUserIds = useMemo(
    () => listFollowing(skyFollowGraph, currentUser.id),
    [skyFollowGraph],
  );

  const skyFriendsCount = useMemo(
    () => countSkyFriends(skyFollowGraph, currentUser.id),
    [skyFollowGraph],
  );

  const skyFriendUserIds = useMemo(
    () => listSkyFriendUserIds(skyFollowGraph, currentUser.id),
    [skyFollowGraph],
  );

  const followSky = useCallback(
    (userId: string) => {
      if (messages.blockedUserIds.includes(userId)) return;
      setSkyFollowGraph((prev) => {
        const next = addSkyFollowEdge(prev, currentUser.id, userId);
        scheduleFollowGraphSave(next);
        return next;
      });
    },
    [messages.blockedUserIds, scheduleFollowGraphSave],
  );

  const unfollowSky = useCallback(
    (userId: string) => {
      setSkyFollowGraph((prev) => {
        const next = removeSkyFollowEdge(prev, currentUser.id, userId);
        scheduleFollowGraphSave(next);
        return next;
      });
    },
    [scheduleFollowGraphSave],
  );

  const toggleFollowSky = useCallback(
    (userId: string) => {
      if (isFollowingSkyUser(skyFollowGraph, currentUser.id, userId)) {
        unfollowSky(userId);
      } else {
        followSky(userId);
      }
    },
    [followSky, skyFollowGraph, unfollowSky],
  );

  const isFollowingSkyUserCb = useCallback(
    (userId: string) => isFollowingSky(userId, followedSkyUserIds),
    [followedSkyUserIds],
  );

  const isMutualSkyFriend = useCallback(
    (userId: string) => isMutualSkyFriends(skyFollowGraph, currentUser.id, userId),
    [skyFollowGraph],
  );

  const listFollowingUserIds = useCallback(
    () => listFollowing(skyFollowGraph, currentUser.id),
    [skyFollowGraph],
  );

  const listFollowerUserIds = useCallback(
    () => listFollowers(skyFollowGraph, currentUser.id),
    [skyFollowGraph],
  );

  const updatePreferences = useCallback(
    (patch: UserPreferencesUpdate) => {
      setPreferences((prev) => {
        const next: UserPreferencesState = {
          ...prev,
          signalPreferences: { ...prev.signalPreferences, ...patch.signalPreferences },
          messagingPreferences: { ...prev.messagingPreferences, ...patch.messagingPreferences },
          discoveryPreferences: { ...prev.discoveryPreferences, ...patch.discoveryPreferences },
          guidePreferences: { ...prev.guidePreferences, ...patch.guidePreferences },
          personalizationPreferences: {
            ...prev.personalizationPreferences,
            ...patch.personalizationPreferences,
          },
          emotionalContextPreference: {
            ...prev.emotionalContextPreference,
            ...patch.emotionalContextPreference,
          },
          accessibilityPreferences: {
            ...prev.accessibilityPreferences,
            ...patch.accessibilityPreferences,
          },
          updatedAt: Date.now(),
        };
        schedulePrefSave(next);
        return next;
      });
    },
    [schedulePrefSave],
  );

  const personalizedHomeFeed = useMemo(() => {
    const personalized = personalizeAroundYourSkyFeed(aroundYourSkyFeed, preferences);
    return {
      ...personalized,
      items: filterHomeFeedBlockedActors(
        personalized.items,
        messages.blockedUserIds,
        messages.limitedUserIds,
      ),
    };
  }, [aroundYourSkyFeed, messages.blockedUserIds, messages.limitedUserIds, preferences]);

  const contributionBeacons = useMemo(() => {
    const queue = buildQueueForViewer(
      currentUser.id,
      messages.blockedUserIds,
      beaconNow(),
    );
    return contributionBeaconSignalsFromQueue(queue);
  }, [buildQueueForViewer, messages.blockedUserIds]);

  const signalSources: ReelyouSignalSources = useMemo(
    () => ({
      starpathResourceState: starpathResources,
      homeFeed: personalizedHomeFeed,
      contributionBeacons,
    }),
    [contributionBeacons, personalizedHomeFeed, starpathResources],
  );

  const signals = useMemo(
    () =>
      buildReelyouSignals(
        messages,
        preferences.signalPreferences,
        preferences.messagingPreferences,
        preferences.discoveryPreferences,
        signalsMeta,
        signalSources,
        Date.now(),
      ),
    [
      messages,
      preferences.signalPreferences,
      preferences.messagingPreferences,
      preferences.discoveryPreferences,
      signalsMeta,
      signalSources,
    ],
  );

  const messageRequestsEnabled = incomingRequestsEnabled(preferences.messagingPreferences);

  const visibleMessageRequests = useMemo(() => {
    if (!messageRequestsEnabled) return [];
    return messages.messageRequests.filter(
      (r) => !messages.blockedUserIds.includes(r.fromUserId),
    );
  }, [messageRequestsEnabled, messages.blockedUserIds, messages.messageRequests]);

  const inboxIds = useMemo(() => inboxThreadIds(messages), [messages]);

  const hasUnreadSignals =
    preferences.messagingPreferences.showUnreadIndicator && hasMeaningfulUnread(signals);

  const dismissSignal = useCallback(
    (signalId: string) => {
      if (signalId.startsWith('sig-beacon-sw-')) {
        ignoreBeacon(signalId.replace('sig-beacon-sw-', ''));
      }
      setSignalsMeta((prev) => {
        const next = {
          ...prev,
          dismissedSignalIds: prev.dismissedSignalIds.includes(signalId)
            ? prev.dismissedSignalIds
            : [...prev.dismissedSignalIds, signalId],
        };
        scheduleMetaSave(next);
        return next;
      });
    },
    [ignoreBeacon, scheduleMetaSave],
  );

  const acknowledgeSignal = useCallback(
    (signalId: string) => {
      setSignalsMeta((prev) => {
        const next = {
          ...prev,
          acknowledgedSignalIds: prev.acknowledgedSignalIds.includes(signalId)
            ? prev.acknowledgedSignalIds
            : [...prev.acknowledgedSignalIds, signalId],
        };
        scheduleMetaSave(next);
        return next;
      });
    },
    [scheduleMetaSave],
  );

  const isHomePresentationHandled = useCallback(
    (signalId: string) => isHomePresentationHandledMeta(signalsMeta, signalId),
    [signalsMeta],
  );

  const markHomePresentationOpened = useCallback(
    (signalIds: string | readonly string[]) => {
      const ids = typeof signalIds === 'string' ? [signalIds] : [...signalIds];
      if (ids.length === 0) return;
      setSignalsMeta((prev) => {
        const acknowledgedSignalIds = [...prev.acknowledgedSignalIds];
        for (const id of ids) {
          if (!acknowledgedSignalIds.includes(id)) {
            acknowledgedSignalIds.push(id);
          }
        }
        const next = { ...prev, acknowledgedSignalIds };
        scheduleMetaSave(next);
        return next;
      });
    },
    [scheduleMetaSave],
  );

  const dismissHomePresentation = useCallback(
    (signalIds: string | readonly string[]) => {
      const ids = typeof signalIds === 'string' ? [signalIds] : [...signalIds];
      if (ids.length === 0) return;
      for (const id of ids) {
        if (id.startsWith('sig-beacon-sw-')) {
          ignoreBeacon(id.replace('sig-beacon-sw-', ''));
        }
      }
      setSignalsMeta((prev) => {
        const dismissedSignalIds = [...prev.dismissedSignalIds];
        for (const id of ids) {
          if (!dismissedSignalIds.includes(id)) {
            dismissedSignalIds.push(id);
          }
        }
        const next = { ...prev, dismissedSignalIds };
        scheduleMetaSave(next);
        return next;
      });
    },
    [ignoreBeacon, scheduleMetaSave],
  );

  const snoozeSignal = useCallback(
    (signalId: string, untilMs: number) => {
      setSignalsMeta((prev) => {
        const next = {
          ...prev,
          snoozedUntil: { ...prev.snoozedUntil, [signalId]: untilMs },
        };
        scheduleMetaSave(next);
        return next;
      });
    },
    [scheduleMetaSave],
  );

  const canMessageUser = useCallback(
    (userId: string) =>
      canInitiateMessage(
        userId,
        preferences.messagingPreferences,
        connectedUserIds,
        messages.blockedUserIds,
        messages.limitedUserIds,
      ),
    [
      connectedUserIds,
      messages.blockedUserIds,
      messages.limitedUserIds,
      preferences.messagingPreferences,
    ],
  );

  const openOrCreateThreadWith = useCallback(
    (userId: string) => {
      if (!canMessageUser(userId)) return null;
      const threadId = canonicalThreadId(currentUser.id, userId);
      setMessages((prev) => {
        const next = openOrCreateThread(prev, userId, connectedUserIds);
        scheduleMsgSave(next);
        return next;
      });
      return threadId;
    },
    [canMessageUser, connectedUserIds, scheduleMsgSave],
  );

  const sendMessage = useCallback(
    (threadId: string, text: string) => {
      setMessages((prev) => {
        const next = sendMessageLocal(prev, threadId, { text }, connectedUserIds);
        scheduleMsgSave(next);
        return next;
      });
    },
    [connectedUserIds, scheduleMsgSave],
  );

  const markThreadRead = useCallback(
    (threadId: string) => {
      acknowledgeSignal(`sig-msg-${threadId}`);
      setMessages((prev) => {
        const next = markThreadReadLocal(prev, threadId);
        scheduleMsgSave(next);
        return next;
      });
    },
    [acknowledgeSignal, scheduleMsgSave],
  );

  const presentHomeSignal = useCallback(
    (signal: ReelyouSignal) => {
      if (signal.type === 'messages' && signal.destinationParams?.threadId) {
        markThreadRead(signal.destinationParams.threadId);
        return;
      }
      markHomePresentationOpened(signal.signalId);
    },
    [markHomePresentationOpened, markThreadRead],
  );

  const acceptMessageRequest = useCallback(
    (threadId: string) => {
      setMessages((prev) => {
        const next = acceptMessageRequestLocal(prev, threadId);
        scheduleMsgSave(next);
        return next;
      });
    },
    [scheduleMsgSave],
  );

  const declineMessageRequest = useCallback(
    (threadId: string) => {
      setMessages((prev) => {
        const next = declineMessageRequestLocal(prev, threadId);
        scheduleMsgSave(next);
        return next;
      });
    },
    [scheduleMsgSave],
  );

  const muteThread = useCallback(
    (threadId: string) => {
      setMessages((prev) => {
        const next = muteThreadLocal(prev, threadId);
        scheduleMsgSave(next);
        return next;
      });
    },
    [scheduleMsgSave],
  );

  const blockUser = useCallback(
    (userId: string) => {
      setMessages((prev) => {
        const next = blockUserLocal(prev, userId);
        scheduleMsgSave(next);
        return next;
      });
      setSkyFollowGraph((prev) => {
        let next = removeSkyFollowEdge(prev, currentUser.id, userId);
        next = removeSkyFollowEdge(next, userId, currentUser.id);
        scheduleFollowGraphSave(next);
        return next;
      });
    },
    [scheduleFollowGraphSave, scheduleMsgSave],
  );

  const unblockUser = useCallback(
    (userId: string) => {
      setMessages((prev) => {
        const next = unblockUserLocal(prev, userId);
        scheduleMsgSave(next);
        return next;
      });
    },
    [scheduleMsgSave],
  );

  const limitUser = useCallback(
    (userId: string) => {
      setMessages((prev) => {
        const next = limitUserLocal(prev, userId);
        scheduleMsgSave(next);
        return next;
      });
    },
    [scheduleMsgSave],
  );

  const removeLimitUser = useCallback(
    (userId: string) => {
      setMessages((prev) => {
        const next = removeLimitUserLocal(prev, userId);
        scheduleMsgSave(next);
        return next;
      });
    },
    [scheduleMsgSave],
  );

  const submitModerationReportCb = useCallback(
    async (input: Omit<SubmitModerationReportInput, 'reporterUserId'>) =>
      submitModerationReport({
        ...input,
        reporterUserId: currentUser.id,
      }),
    [],
  );

  const reportUser = useCallback(
    async (params: {
      reportedUserId: string;
      threadId?: string;
      messageId?: string;
      reason?: ModerationReportReason;
      optionalNote?: string;
    }) => {
      const result = await submitModerationReportCb({
        targetType: params.messageId ? 'message' : 'user',
        targetId: params.messageId ?? params.reportedUserId,
        targetOwnerUserId: params.reportedUserId,
        reason: params.reason ?? 'other',
        optionalNote: params.optionalNote,
        threadId: params.threadId,
        messageId: params.messageId,
        provenanceIds: params.messageId ? [params.messageId] : [params.reportedUserId],
        visibilityContext: params.threadId ? 'direct_message' : 'profile',
      });
      if (!result.ok) {
        return { ok: false, localOnly: true as const, reportId: '' };
      }
      return {
        ok: true,
        localOnly: true as const,
        reportId: result.reportId,
        duplicate: result.duplicate,
      };
    },
    [submitModerationReportCb],
  );

  const getThreadMessages = useCallback(
    (threadId: string) => threadMessages(messages, threadId),
    [messages],
  );

  const value = useMemo<ReelyouConnectContextValue>(
    () => ({
      ready,
      preferences,
      updatePreferences,
      messages,
      inboxThreadIds: inboxIds,
      messageRequestsEnabled,
      signals,
      signalsMeta,
      hasUnreadSignals,
      dismissSignal,
      acknowledgeSignal,
      isHomePresentationHandled,
      markHomePresentationOpened,
      dismissHomePresentation,
      presentHomeSignal,
      snoozeSignal,
      openOrCreateThreadWith,
      sendMessage,
      markThreadRead,
      acceptMessageRequest,
      declineMessageRequest,
      muteThread,
      blockUser,
      submitModerationReport: submitModerationReportCb,
      reportUser,
      getThreadMessages,
      canMessageUser,
      connectedUserIds,
      followedSkyUserIds,
      isFollowingSkyUser: isFollowingSkyUserCb,
      followSky,
      unfollowSky,
      toggleFollowSky,
      unblockUser,
      limitUser,
      removeLimitUser,
      skyFollowGraph,
      skyFriendsCount,
      skyFriendUserIds,
      listFollowingUserIds,
      listFollowerUserIds,
      isMutualSkyFriend,
      searchableUsers: orbitUsers,
    }),
    [
      ready,
      preferences,
      updatePreferences,
      messages,
      inboxIds,
      messageRequestsEnabled,
      signals,
      signalsMeta,
      hasUnreadSignals,
      dismissSignal,
      acknowledgeSignal,
      isHomePresentationHandled,
      markHomePresentationOpened,
      dismissHomePresentation,
      presentHomeSignal,
      snoozeSignal,
      openOrCreateThreadWith,
      sendMessage,
      markThreadRead,
      acceptMessageRequest,
      declineMessageRequest,
      muteThread,
      blockUser,
      submitModerationReportCb,
      reportUser,
      getThreadMessages,
      canMessageUser,
      connectedUserIds,
      followedSkyUserIds,
      isFollowingSkyUserCb,
      followSky,
      unfollowSky,
      toggleFollowSky,
      unblockUser,
      limitUser,
      removeLimitUser,
      skyFollowGraph,
      skyFriendsCount,
      skyFriendUserIds,
      listFollowingUserIds,
      listFollowerUserIds,
      isMutualSkyFriend,
    ],
  );

  return <ReelyouConnectContext.Provider value={value}>{children}</ReelyouConnectContext.Provider>;
}

export function useReelyouConnect(): ReelyouConnectContextValue {
  const ctx = useContext(ReelyouConnectContext);
  if (!ctx) throw new Error('useReelyouConnect must be used within ReelyouConnectProvider');
  return ctx;
}
