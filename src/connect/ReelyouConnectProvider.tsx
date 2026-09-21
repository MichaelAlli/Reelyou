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

interface ReelyouConnectContextValue {
  ready: boolean;
  preferences: UserPreferencesState;
  updatePreferences: (patch: UserPreferencesUpdate) => void;
  messages: MessagesState;
  inboxThreadIds: string[];
  messageRequestsEnabled: boolean;
  signals: ReelyouSignal[];
  hasUnreadSignals: boolean;
  dismissSignal: (signalId: string) => void;
  acknowledgeSignal: (signalId: string) => void;
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
  searchableUsers: typeof orbitUsers;
}

const ReelyouConnectContext = createContext<ReelyouConnectContextValue | null>(null);

export function ReelyouConnectProvider({ children }: { children: ReactNode }) {
  const { aroundYourSkyFeed } = useOnboarding();
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
  const prefTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const msgTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const metaTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connectedUserIds = BETA_CONNECTED_USER_IDS;

  useEffect(() => {
    let mounted = true;
    void (async () => {
      const [prefs, msgs, meta, resources] = await Promise.all([
        loadUserPreferences(),
        loadMessagesState(),
        loadReelyouSignalsMeta(),
        loadStarPathResourceState(),
      ]);
      if (!mounted) return;
      setPreferences(prefs);
      setMessages(msgs);
      setSignalsMeta(meta);
      setStarpathResources(resources);
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

  const signalSources: ReelyouSignalSources = useMemo(
    () => ({
      starpathResourceState: starpathResources,
      homeFeed: personalizedHomeFeed,
    }),
    [personalizedHomeFeed, starpathResources],
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
    [scheduleMetaSave],
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
      hasUnreadSignals,
      dismissSignal,
      acknowledgeSignal,
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
      hasUnreadSignals,
      dismissSignal,
      acknowledgeSignal,
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
    ],
  );

  return <ReelyouConnectContext.Provider value={value}>{children}</ReelyouConnectContext.Provider>;
}

export function useReelyouConnect(): ReelyouConnectContextValue {
  const ctx = useContext(ReelyouConnectContext);
  if (!ctx) throw new Error('useReelyouConnect must be used within ReelyouConnectProvider');
  return ctx;
}
