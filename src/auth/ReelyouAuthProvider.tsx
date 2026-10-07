import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  loginAccount,
  registerAccount,
  fetchSession,
  refreshAuthSession,
} from '@/auth/reellyouAuthApi';
import { isReelyouAuthConfigured } from '@/auth/reellyouAuthConfig';
import {
  clearAuthSession,
  loadAccessToken,
  loadRefreshToken,
  loadRememberMePreference,
  loadStoredAuthUser,
  saveAuthSession,
  type StoredAuthUser,
} from '@/auth/reellyouAuthPersistence';
import { stopAllProtectedPlayback } from '@/media/protectedPlaybackStop';

interface ReelyouAuthContextValue {
  ready: boolean;
  configured: boolean;
  accessToken: string | null;
  user: StoredAuthUser | null;
  isAuthenticated: boolean;
  register: (input: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    termsAccepted: boolean;
    termsVersion: string;
    privacyVersion: string;
    consentAcceptedAt: number;
    rememberMe?: boolean;
  }) => Promise<{ ok: boolean; error?: string }>;
  login: (input: {
    email: string;
    password: string;
    rememberMe?: boolean;
  }) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<string | null>;
  /** Merge server profile fields into the stored session user (does not sign out). */
  patchSessionUser: (patch: Partial<StoredAuthUser>) => Promise<void>;
}

const ReelyouAuthContext = createContext<ReelyouAuthContextValue | null>(null);

async function restoreSession(): Promise<{
  accessToken: string | null;
  user: StoredAuthUser | null;
}> {
  const token = await loadAccessToken();
  const storedUser = await loadStoredAuthUser();
  if (!token || !storedUser) return { accessToken: null, user: null };

  const live = await fetchSession(token);
  if (live) return { accessToken: token, user: live };

  const refreshToken = await loadRefreshToken();
  if (!refreshToken) return { accessToken: null, user: null };

  const refreshed = await refreshAuthSession(refreshToken);
  if (!refreshed.ok) return { accessToken: null, user: null };

  const rememberMe = await loadRememberMePreference();
  await saveAuthSession({
    accessToken: refreshed.accessToken,
    refreshToken: refreshed.refreshToken ?? refreshToken,
    user: refreshed.user,
    rememberMe,
  });
  return { accessToken: refreshed.accessToken, user: refreshed.user };
}

export function ReelyouAuthProvider({ children }: { children: ReactNode }) {
  const configured = isReelyouAuthConfigured();
  const [ready, setReady] = useState(!configured);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<StoredAuthUser | null>(null);

  useEffect(() => {
    if (!configured) {
      setReady(true);
      return;
    }
    let mounted = true;
    void restoreSession().then(async (session) => {
      if (!mounted) return;
      if (session.accessToken && session.user) {
        setAccessToken(session.accessToken);
        setUser(session.user);
      } else {
        await clearAuthSession();
      }
      setReady(true);
    });
    return () => {
      mounted = false;
    };
  }, [configured]);

  const register = useCallback(
    async (input: {
      email: string;
      password: string;
      fullName: string;
      phone?: string;
      termsAccepted: boolean;
      termsVersion: string;
      privacyVersion: string;
      consentAcceptedAt: number;
      rememberMe?: boolean;
    }) => {
      if (!configured) return { ok: false, error: 'auth_not_configured' };
      const result = await registerAccount(input);
      if (!result.ok) return { ok: false, error: result.error };
      await saveAuthSession({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        user: result.user,
        rememberMe: input.rememberMe !== false,
      });
      setAccessToken(result.accessToken);
      setUser(result.user);
      return { ok: true };
    },
    [configured],
  );

  const login = useCallback(
    async (input: { email: string; password: string; rememberMe?: boolean }) => {
      if (!configured) return { ok: false, error: 'auth_not_configured' };
      const result = await loginAccount(input);
      if (!result.ok) return { ok: false, error: result.error };
      const rememberMe = input.rememberMe === true;
      if (!rememberMe) {
        await clearAuthSession();
      }
      await saveAuthSession({
        accessToken: result.accessToken,
        refreshToken: rememberMe ? result.refreshToken : null,
        user: result.user,
        rememberMe,
      });
      setAccessToken(result.accessToken);
      setUser(result.user);
      return { ok: true };
    },
    [configured],
  );

  const logout = useCallback(async () => {
    stopAllProtectedPlayback();
    await clearAuthSession();
    setAccessToken(null);
    setUser(null);
  }, []);

  const patchSessionUser = useCallback(async (patch: Partial<StoredAuthUser>) => {
    let nextUser: StoredAuthUser | null = null;
    setUser((current) => {
      if (!current) return current;
      nextUser = { ...current, ...patch };
      return nextUser;
    });
    if (!nextUser) return;
    const token = await loadAccessToken();
    if (!token) return;
    const rememberMe = await loadRememberMePreference();
    const refreshToken = await loadRefreshToken();
    await saveAuthSession({
      accessToken: token,
      refreshToken,
      user: nextUser,
      rememberMe,
    });
  }, []);

  const refreshAccessToken = useCallback(async () => {
    const refreshToken = await loadRefreshToken();
    if (!refreshToken) return null;
    const refreshed = await refreshAuthSession(refreshToken);
    if (!refreshed.ok) return null;
    const rememberMe = await loadRememberMePreference();
    await saveAuthSession({
      accessToken: refreshed.accessToken,
      refreshToken: refreshed.refreshToken ?? refreshToken,
      user: refreshed.user,
      rememberMe,
    });
    setAccessToken(refreshed.accessToken);
    setUser(refreshed.user);
    return refreshed.accessToken;
  }, []);

  const value = useMemo(
    (): ReelyouAuthContextValue => ({
      ready,
      configured,
      accessToken,
      user,
      isAuthenticated: Boolean(accessToken && user),
      register,
      login,
      logout,
      refreshAccessToken,
      patchSessionUser,
    }),
    [accessToken, configured, login, logout, patchSessionUser, ready, refreshAccessToken, register, user],
  );

  return <ReelyouAuthContext.Provider value={value}>{children}</ReelyouAuthContext.Provider>;
}

export function useReelyouAuth(): ReelyouAuthContextValue {
  const ctx = useContext(ReelyouAuthContext);
  if (!ctx) {
    throw new Error('useReelyouAuth must be used within ReelyouAuthProvider');
  }
  return ctx;
}

/** Session user id for backend calls; falls back to local mock only when auth is not configured. */
export function useFriendDiscoveryViewerId(fallbackUserId: string): string {
  const auth = useReelyouAuth();
  if (auth.configured && auth.user) return auth.user.id;
  return fallbackUserId;
}
