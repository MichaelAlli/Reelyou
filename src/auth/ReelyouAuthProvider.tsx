import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { loginAccount, registerAccount, fetchSession } from '@/auth/reellyouAuthApi';
import { isReelyouAuthConfigured } from '@/auth/reellyouAuthConfig';
import {
  clearAuthSession,
  loadAccessToken,
  loadStoredAuthUser,
  saveAuthSession,
  type StoredAuthUser,
} from '@/auth/reellyouAuthPersistence';

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
  }) => Promise<{ ok: boolean; error?: string }>;
  login: (input: { email: string; password: string }) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const ReelyouAuthContext = createContext<ReelyouAuthContextValue | null>(null);

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
    void (async () => {
      const token = await loadAccessToken();
      const storedUser = await loadStoredAuthUser();
      if (!mounted) return;
      if (token && storedUser) {
        const live = await fetchSession(token);
        if (live) {
          setAccessToken(token);
          setUser(live);
        } else {
          await clearAuthSession();
        }
      }
      setReady(true);
    })();
    return () => {
      mounted = false;
    };
  }, [configured]);

  const register = useCallback(
    async (input: { email: string; password: string; fullName: string; phone?: string }) => {
      if (!configured) return { ok: false, error: 'auth_not_configured' };
      const result = await registerAccount(input);
      if (!result.ok) return { ok: false, error: result.error };
      await saveAuthSession({ accessToken: result.accessToken, user: result.user });
      setAccessToken(result.accessToken);
      setUser(result.user);
      return { ok: true };
    },
    [configured],
  );

  const login = useCallback(
    async (input: { email: string; password: string }) => {
      if (!configured) return { ok: false, error: 'auth_not_configured' };
      const result = await loginAccount(input);
      if (!result.ok) return { ok: false, error: result.error };
      await saveAuthSession({ accessToken: result.accessToken, user: result.user });
      setAccessToken(result.accessToken);
      setUser(result.user);
      return { ok: true };
    },
    [configured],
  );

  const logout = useCallback(async () => {
    await clearAuthSession();
    setAccessToken(null);
    setUser(null);
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
    }),
    [accessToken, configured, login, logout, ready, register, user],
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
