import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { currentUser } from '@/data/mockData';
import {
  loadFriendDiscoveryState,
  saveFriendDiscoveryState,
} from '@/friendDiscovery/friendDiscoveryPersistence';
import {
  EMPTY_FRIEND_DISCOVERY_STATE,
  type FriendDiscoveryState,
} from '@/friendDiscovery/friendDiscoveryTypes';
import {
  matchFromDeviceContacts,
  requestPhoneContactsPermission,
} from '@/friendDiscovery/phoneContactsDiscovery';
import { buildPeopleYouMayKnowSuggestions } from '@/friendDiscovery/peopleYouMayKnowService';
import { useReelyouConnect } from '@/connect/ReelyouConnectProvider';

interface FriendDiscoveryContextValue {
  ready: boolean;
  state: FriendDiscoveryState;
  setDiscoverableByPhone: (enabled: boolean) => void;
  setDiscoverableByEmail: (enabled: boolean) => void;
  dismissSuggestion: (userId: string) => void;
  clearImportedContactMatches: () => void;
  disconnectGoogleContacts: () => void;
  disconnectFacebook: () => void;
  syncPhoneContacts: () => Promise<{ status: string; message?: string }>;
  applyContactMatches: (userIds: string[], source: 'phone' | 'google' | 'facebook') => void;
  peopleYouMayKnow: ReturnType<typeof buildPeopleYouMayKnowSuggestions>;
  markFindYourPeopleSeen: () => void;
}

const FriendDiscoveryContext = createContext<FriendDiscoveryContextValue | null>(null);

export function FriendDiscoveryProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FriendDiscoveryState | null>(null);
  const { messages, skyFollowGraph, preferences } = useReelyouConnect();

  useEffect(() => {
    let mounted = true;
    void loadFriendDiscoveryState().then((loaded) => {
      if (mounted) setState(loaded);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const persist = useCallback(async (next: FriendDiscoveryState) => {
    setState(next);
    await saveFriendDiscoveryState(next);
  }, []);

  const patch = useCallback(
    (partial: Partial<FriendDiscoveryState>) => {
      const base = state ?? EMPTY_FRIEND_DISCOVERY_STATE;
      const next = { ...base, ...partial, updatedAt: Date.now() };
      void persist(next);
    },
    [persist, state],
  );

  const setDiscoverableByPhone = useCallback(
    (enabled: boolean) => patch({ discoverableByVerifiedPhone: enabled }),
    [patch],
  );

  const setDiscoverableByEmail = useCallback(
    (enabled: boolean) => patch({ discoverableByVerifiedEmail: enabled }),
    [patch],
  );

  const dismissSuggestion = useCallback(
    (userId: string) => {
      if (!state) return;
      if (state.dismissedSuggestionUserIds.includes(userId)) return;
      patch({
        dismissedSuggestionUserIds: [...state.dismissedSuggestionUserIds, userId],
      });
    },
    [patch, state],
  );

  const clearImportedContactMatches = useCallback(() => {
    patch({
      contactMatchUserIds: [],
      googleMatchUserIds: [],
      facebookMatchUserIds: [],
      phoneContactsLastSyncAt: null,
      googleContactsConnected: false,
      facebookConnected: false,
    });
  }, [patch]);

  const disconnectGoogleContacts = useCallback(() => {
    patch({ googleContactsConnected: false, googleMatchUserIds: [] });
  }, [patch]);

  const disconnectFacebook = useCallback(() => {
    patch({ facebookConnected: false, facebookMatchUserIds: [] });
  }, [patch]);

  const applyContactMatches = useCallback(
    (userIds: string[], source: 'phone' | 'google' | 'facebook') => {
      const unique = [...new Set(userIds)];
      if (source === 'phone') {
        patch({ contactMatchUserIds: unique, phoneContactsLastSyncAt: Date.now() });
      } else if (source === 'google') {
        patch({ googleMatchUserIds: unique, googleContactsConnected: true });
      } else {
        patch({ facebookMatchUserIds: unique, facebookConnected: true });
      }
    },
    [patch],
  );

  const syncPhoneContacts = useCallback(async () => {
    const perm = await requestPhoneContactsPermission();
    if (perm === 'unsupported_web') {
      return { status: 'unsupported_web', message: 'Use invite link or username search on web.' };
    }
    if (perm === 'denied') {
      return { status: 'denied', message: 'Contacts permission was not granted.' };
    }
    const result = await matchFromDeviceContacts({ viewerUserId: currentUser.id });
    if (result.status === 'ok' || result.status === 'empty') {
      applyContactMatches(
        result.matches.map((m) => m.userId),
        'phone',
      );
    }
    return { status: result.status, message: result.message };
  }, [applyContactMatches]);

  const markFindYourPeopleSeen = useCallback(() => {
    patch({ findYourPeopleOnboardingSeen: true });
  }, [patch]);

  const peopleYouMayKnow = useMemo(() => {
    if (!state) return [];
    return buildPeopleYouMayKnowSuggestions({
      viewerId: currentUser.id,
      graph: skyFollowGraph,
      blockedUserIds: messages.blockedUserIds,
      friendDiscovery: state,
      reduceSuggestions: preferences.discoveryPreferences.reduceDiscoverySuggestions,
    });
  }, [
    messages.blockedUserIds,
    preferences.discoveryPreferences.reduceDiscoverySuggestions,
    skyFollowGraph,
    state,
  ]);

  const value = useMemo((): FriendDiscoveryContextValue => {
    const effectiveState = state ?? EMPTY_FRIEND_DISCOVERY_STATE;
    return {
      ready: state != null,
      state: effectiveState,
      setDiscoverableByPhone,
      setDiscoverableByEmail,
      dismissSuggestion,
      clearImportedContactMatches,
      disconnectGoogleContacts,
      disconnectFacebook,
      syncPhoneContacts,
      applyContactMatches,
      peopleYouMayKnow,
      markFindYourPeopleSeen,
    };
  }, [
    applyContactMatches,
    clearImportedContactMatches,
    disconnectFacebook,
    disconnectGoogleContacts,
    dismissSuggestion,
    markFindYourPeopleSeen,
    peopleYouMayKnow,
    setDiscoverableByEmail,
    setDiscoverableByPhone,
    state,
    syncPhoneContacts,
    state,
  ]);

  return (
    <FriendDiscoveryContext.Provider value={value}>{children}</FriendDiscoveryContext.Provider>
  );
}

export function useFriendDiscovery(): FriendDiscoveryContextValue {
  const ctx = useContext(FriendDiscoveryContext);
  if (!ctx) {
    throw new Error('useFriendDiscovery must be used within FriendDiscoveryProvider');
  }
  return ctx;
}
