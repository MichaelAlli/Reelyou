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
import type { SafetyReportReason } from '@/safety/safetyActions';
import { reportUserSafety } from '@/safety/safetyActions';
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
  loadFollowedSkyUserIds,
  saveFollowedSkyUserIds,
} from '@/social/skyFollow/skyFollowPersistence';
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
  reportUser: (params: {
    reportedUserId: string;
    threadId?: string;
    reason?: SafetyReportReason;
  }) => Promise<{ ok: boolean; localOnly: boolean; reportId: string }>;
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
    messageRequests: [],
    messagingVersion: 'beta-v1',
  });
  const [signalsMeta, setSignalsMeta] = useState<ReelyouSignalsMetaState>(EMPTY_SIGNALS_META);
  const [starpathResources, setStarpathResources] = useState<StarPathResourceState>(EMPTY_RESOURCE_STATE);
  const [followedSkyUserIds, setFollowedSkyUserIds] = useState<string[]>([]);
  const prefTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const followTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const msgTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const metaTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connectedUserIds = BETA_CONNECTED_USER_IDS;

  useEffect(() => {
    let mounted = true;
    void (async () => {
      const [prefs, msgs, meta, resources, followed] = await Promise.all([
        loadUserPreferences(),
        loadMessagesState(),
        loadReelyouSignalsMeta(),
        loadStarPathResourceState(),
        loadFollowedSkyUserIds(),
      ]);
      if (!mounted) return;
      setPreferences(prefs);
      setMessages(msgs);
      setSignalsMeta(meta);
      setStarpathResources(resources);
      setFollowedSkyUserIds(followed);
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

  const scheduleFollowSave = useCallback((next: string[]) => {
    if (followTimer.current) clearTimeout(followTimer.current);
    followTimer.current = setTimeout(() => void saveFollowedSkyUserIds(next), 280);
  }, []);

  const followSky = useCallback(
    (userId: string) => {
      setFollowedSkyUserIds((prev) => {
        if (prev.includes(userId)) return prev;
        const next = [...prev, userId];
        scheduleFollowSave(next);
        return next;
      });
    },
    [scheduleFollowSave],
  );

  const unfollowSky = useCallback(
    (userId: string) => {
      setFollowedSkyUserIds((prev) => {
        if (!prev.includes(userId)) return prev;
        const next = prev.filter((id) => id !== userId);
        scheduleFollowSave(next);
        return next;
      });
    },
    [scheduleFollowSave],
  );

  const toggleFollowSky = useCallback(
    (userId: string) => {
      setFollowedSkyUserIds((prev) => {
        const next = prev.includes(userId)
          ? prev.filter((id) => id !== userId)
          : [...prev, userId];
        scheduleFollowSave(next);
        return next;
      });
    },
    [scheduleFollowSave],
  );

  const isFollowingSkyUser = useCallback(
    (userId: string) => isFollowingSky(userId, followedSkyUserIds),
    [followedSkyUserIds],
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

  const personalizedHomeFeed = useMemo(
    () => personalizeAroundYourSkyFeed(aroundYourSkyFeed, preferences),
    [aroundYourSkyFeed, preferences],
  );

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
      ),
    [connectedUserIds, messages.blockedUserIds, preferences.messagingPreferences],
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
    },
    [scheduleMsgSave],
  );

  const reportUser = useCallback(
    async (params: {
      reportedUserId: string;
      threadId?: string;
      reason?: SafetyReportReason;
    }) => {
      const result = await reportUserSafety(params);
      return { ok: result.ok, localOnly: result.localOnly, reportId: result.reportId };
    },
    [],
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
      reportUser,
      getThreadMessages,
      canMessageUser,
      connectedUserIds,
      followedSkyUserIds,
      isFollowingSkyUser,
      followSky,
      unfollowSky,
      toggleFollowSky,
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
      reportUser,
      getThreadMessages,
      canMessageUser,
      connectedUserIds,
      followedSkyUserIds,
      isFollowingSkyUser,
      followSky,
      unfollowSky,
      toggleFollowSky,
    ],
  );

  return <ReelyouConnectContext.Provider value={value}>{children}</ReelyouConnectContext.Provider>;
}

export function useReelyouConnect(): ReelyouConnectContextValue {
  const ctx = useContext(ReelyouConnectContext);
  if (!ctx) throw new Error('useReelyouConnect must be used within ReelyouConnectProvider');
  return ctx;
}
