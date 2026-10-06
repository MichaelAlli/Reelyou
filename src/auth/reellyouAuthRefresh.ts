import { refreshAuthSession } from '@/auth/reellyouAuthApi';
import {
  loadRefreshToken,
  loadStoredAuthUser,
  saveAuthSession,
  loadRememberMePreference,
} from '@/auth/reellyouAuthPersistence';

let refreshInFlight: Promise<string | null> | null = null;

/** Single-flight refresh — returns new access token or null. */
export async function tryRefreshAccessToken(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = (async () => {
    try {
      const refreshToken = await loadRefreshToken();
      const user = await loadStoredAuthUser();
      if (!refreshToken || !user) return null;
      const result = await refreshAuthSession(refreshToken);
      if (!result.ok) return null;
      const rememberMe = await loadRememberMePreference();
      await saveAuthSession({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken ?? refreshToken,
        user: result.user,
        rememberMe,
      });
      return result.accessToken;
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
}
