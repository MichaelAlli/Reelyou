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

import { useReelyouAuth } from '@/auth/ReelyouAuthProvider';
import { resolveActiveUserId } from '@/auth/resolveActiveUserId';
import { isReelyouAuthConfigured } from '@/auth/reellyouAuthConfig';
import { syncCanonicalProfilePhotoFromIdentity } from '@/identity/canonicalUserProfilePhoto';
import { setActiveStorageUserId } from '@/storage/scopedAsyncStorage';
import {
  pickProfilePhotoFromLibrary,
  takeProfilePhoto,
  type ProfilePhotoPickResult,
} from '@/identity/profilePhotoActions';
import { loadUserAvatarIdentity, saveUserAvatarIdentity } from '@/identity/userAvatarPersistence';
import {
  resolveProfilePhotoUri,
  withProfilePhotoCacheRevision,
} from '@/identity/resolveProfilePhotoUri';
import {
  DEFAULT_USER_AVATAR_IDENTITY,
  type CustomAvatarConfig,
  type UserAvatarIdentity,
} from '@/identity/userAvatarTypes';

interface UserAvatarContextValue {
  ready: boolean;
  identity: UserAvatarIdentity;
  profilePhotoUri: string | null;
  profilePhotoDisplayUri: string | null;
  profilePhotoRevision: number;
  setProfilePhotoUri: (uri: string | null) => void;
  setPresetAvatar: (presetId: string) => void;
  setCustomAvatar: (config: CustomAvatarConfig) => void;
  useDefaultSilhouette: () => void;
  pickFromLibrary: () => Promise<ProfilePhotoPickResult>;
  takePhoto: () => Promise<ProfilePhotoPickResult>;
  removeProfilePhoto: () => void;
}

const UserAvatarContext = createContext<UserAvatarContextValue | null>(null);

function publishSnapshot(identity: UserAvatarIdentity, revision: number) {
  syncCanonicalProfilePhotoFromIdentity(identity, revision);
}

export function UserAvatarProvider({ children }: { children: ReactNode }) {
  const { user: authUser } = useReelyouAuth();
  const storageUserId = isReelyouAuthConfigured() ? resolveActiveUserId(authUser) : null;
  const [ready, setReady] = useState(false);
  const [identity, setIdentity] = useState<UserAvatarIdentity>(DEFAULT_USER_AVATAR_IDENTITY);
  const [profilePhotoRevision, setProfilePhotoRevision] = useState(0);
  const identityRef = useRef(identity);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    identityRef.current = identity;
  }, [identity]);

  const persist = useCallback((next: UserAvatarIdentity, revision: number) => {
    publishSnapshot(next, revision);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void saveUserAvatarIdentity(next);
    }, 200);
  }, []);

  useEffect(() => {
    setActiveStorageUserId(storageUserId);
    let live = true;
    setReady(false);
    void loadUserAvatarIdentity().then((loadedRaw) => {
      if (!live) return;
      const uri = loadedRaw.profilePhotoUri;
      const isUnpersistableUri =
        Boolean(uri?.startsWith('blob:')) ||
        Boolean(uri?.startsWith('data:') && uri.includes('avatarRev='));
      const loaded = isUnpersistableUri
        ? {
            ...loadedRaw,
            profilePhotoUri: null,
            avatarSourceType: 'defaultSilhouette' as const,
          }
        : loadedRaw;
      const revision = loaded.profilePhotoUri ? Date.now() : 0;
      setIdentity(loaded);
      if (isUnpersistableUri) {
        void saveUserAvatarIdentity(loaded);
      }
      setProfilePhotoRevision(revision);
      publishSnapshot(loaded, revision);
      setReady(true);
    });
    return () => {
      live = false;
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [storageUserId]);

  const applyIdentity = useCallback(
    (next: UserAvatarIdentity, bumpPhotoRevision: boolean) => {
      setIdentity(next);
      setProfilePhotoRevision((prev) => {
        const revision = bumpPhotoRevision ? Date.now() : prev;
        persist(next, revision);
        return revision;
      });
    },
    [persist],
  );

  const setProfilePhotoUri = useCallback(
    (uri: string | null) => {
      const next: UserAvatarIdentity = {
        ...identityRef.current,
        avatarSourceType: uri ? 'profilePhoto' : 'defaultSilhouette',
        profilePhotoUri: uri,
      };
      applyIdentity(next, true);
    },
    [applyIdentity],
  );

  const setPresetAvatar = useCallback(
    (presetId: string) => {
      const next: UserAvatarIdentity = {
        ...identityRef.current,
        avatarSourceType: 'presetAvatar',
        avatarAssetId: presetId,
      };
      applyIdentity(next, false);
    },
    [applyIdentity],
  );

  const setCustomAvatar = useCallback(
    (config: CustomAvatarConfig) => {
      const next: UserAvatarIdentity = {
        ...identityRef.current,
        avatarSourceType: 'customAvatar',
        customAvatarConfig: config,
      };
      applyIdentity(next, false);
    },
    [applyIdentity],
  );

  const useDefaultSilhouette = useCallback(() => {
    const next: UserAvatarIdentity = {
      ...identityRef.current,
      avatarSourceType: 'defaultSilhouette',
      profilePhotoUri: null,
    };
    applyIdentity(next, true);
  }, [applyIdentity]);

  const removeProfilePhoto = useCallback(() => {
    useDefaultSilhouette();
  }, [useDefaultSilhouette]);

  const pickFromLibrary = useCallback(() => pickProfilePhotoFromLibrary(), []);
  const takePhoto = useCallback(() => takeProfilePhoto(), []);

  const profilePhotoUri = useMemo(() => resolveProfilePhotoUri(identity), [identity]);
  const profilePhotoDisplayUri = useMemo(
    () =>
      profilePhotoUri
        ? withProfilePhotoCacheRevision(profilePhotoUri, profilePhotoRevision)
        : null,
    [profilePhotoRevision, profilePhotoUri],
  );

  const value = useMemo(
    (): UserAvatarContextValue => ({
      ready,
      identity,
      profilePhotoUri,
      profilePhotoDisplayUri,
      profilePhotoRevision,
      setProfilePhotoUri,
      setPresetAvatar,
      setCustomAvatar,
      useDefaultSilhouette,
      pickFromLibrary,
      takePhoto,
      removeProfilePhoto,
    }),
    [
      ready,
      identity,
      profilePhotoUri,
      profilePhotoDisplayUri,
      profilePhotoRevision,
      setProfilePhotoUri,
      setPresetAvatar,
      setCustomAvatar,
      useDefaultSilhouette,
      pickFromLibrary,
      takePhoto,
      removeProfilePhoto,
    ],
  );

  return <UserAvatarContext.Provider value={value}>{children}</UserAvatarContext.Provider>;
}

export function useUserAvatar(): UserAvatarContextValue {
  const ctx = useContext(UserAvatarContext);
  if (!ctx) {
    throw new Error('useUserAvatar must be used within UserAvatarProvider');
  }
  return ctx;
}
