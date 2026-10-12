import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { resolveActiveUserId } from '@/auth/resolveActiveUserId';
import { useReelyouAuth } from '@/auth/ReelyouAuthProvider';
import { formatPersonalJourneyDisplayTitle } from '@/journey/personalJourneyTitle';
import {
  EMPTY_PERSONAL_JOURNEY,
  loadLocalPersonalJourney,
  saveLocalPersonalJourney,
  type PersonalJourneySettings,
} from '@/journey/personalJourneyPersistence';
import {
  fetchMyPersonalJourneyFromServer,
  patchMyPersonalJourneyOnServer,
} from '@/social/personalJourneyApi';
import { isSharedSocialPersistenceEnabled } from '@/social/sharedSocialApi';

interface PersonalJourneyContextValue {
  ready: boolean;
  settings: PersonalJourneySettings;
  displayTitle: string;
  saveCustomTitle: (title: string | null) => Promise<boolean>;
  saveOrderedSkywriteIds: (ids: string[]) => Promise<boolean>;
  refresh: () => Promise<void>;
}

const PersonalJourneyContext = createContext<PersonalJourneyContextValue | null>(null);

export function PersonalJourneyProvider({ children }: { children: ReactNode }) {
  const { user: authUser } = useReelyouAuth();
  const ownerUserId = resolveActiveUserId(authUser);
  const [settings, setSettings] = useState<PersonalJourneySettings>(EMPTY_PERSONAL_JOURNEY);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    if (isSharedSocialPersistenceEnabled() && ownerUserId) {
      const remote = await fetchMyPersonalJourneyFromServer();
      if (remote) {
        setSettings(remote);
        await saveLocalPersonalJourney(remote);
        setReady(true);
        return;
      }
    }
    const local = await loadLocalPersonalJourney();
    setSettings(local);
    setReady(true);
  }, [ownerUserId]);

  useEffect(() => {
    setReady(false);
    void refresh();
  }, [refresh]);

  const persist = useCallback(
    async (
      patch: Partial<Pick<PersonalJourneySettings, 'customTitle' | 'orderedSkywriteIds'>>,
    ): Promise<boolean> => {
      const next: PersonalJourneySettings = {
        ...settings,
        ...patch,
        updatedAt: Date.now(),
      };
      setSettings(next);
      await saveLocalPersonalJourney(next);
      if (isSharedSocialPersistenceEnabled() && ownerUserId) {
        const remote = await patchMyPersonalJourneyOnServer(patch);
        if (remote) {
          setSettings(remote);
          await saveLocalPersonalJourney(remote);
          return true;
        }
        return false;
      }
      return true;
    },
    [ownerUserId, settings],
  );

  const saveCustomTitle = useCallback(
    async (title: string | null) => persist({ customTitle: title }),
    [persist],
  );

  const saveOrderedSkywriteIds = useCallback(
    async (ids: string[]) => persist({ orderedSkywriteIds: [...ids] }),
    [persist],
  );

  const displayTitle = useMemo(
    () =>
      formatPersonalJourneyDisplayTitle({
        customTitle: settings.customTitle,
        displayName: authUser?.fullName ?? null,
      }),
    [authUser?.fullName, settings.customTitle],
  );

  const value = useMemo(
    () => ({
      ready,
      settings,
      displayTitle,
      saveCustomTitle,
      saveOrderedSkywriteIds,
      refresh,
    }),
    [displayTitle, ready, refresh, saveCustomTitle, saveOrderedSkywriteIds, settings],
  );

  return (
    <PersonalJourneyContext.Provider value={value}>{children}</PersonalJourneyContext.Provider>
  );
}

export function usePersonalJourney(): PersonalJourneyContextValue {
  const ctx = useContext(PersonalJourneyContext);
  if (!ctx) {
    throw new Error('usePersonalJourney must be used within PersonalJourneyProvider');
  }
  return ctx;
}
