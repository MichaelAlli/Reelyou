import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const ACCESS_TOKEN_KEY = 'reellyou.auth.accessToken.v1';
const USER_KEY = 'reellyou.auth.user.v1';
const REFRESH_TOKEN_KEY = 'reellyou.auth.refreshToken.v1';
const REMEMBER_ME_KEY = 'reellyou.auth.rememberMe.v1';

export interface StoredAuthUser {
  id: string;
  fullName: string;
  email: string;
  username?: string | null;
  bio?: string | null;
  avatarMediaKey?: string | null;
  onboardingComplete?: boolean;
}

function webSessionStorage(): Storage | null {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
  return window.sessionStorage;
}

function webLocalStorage(): Storage | null {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
  return window.localStorage;
}

async function storageSet(key: string, value: string, persistent: boolean): Promise<void> {
  if (Platform.OS === 'web') {
    const store = persistent ? webLocalStorage() : webSessionStorage();
    store?.setItem(key, value);
    if (persistent) webSessionStorage()?.removeItem(key);
    else webLocalStorage()?.removeItem(key);
    return;
  }
  if (persistent) {
    await AsyncStorage.setItem(key, value);
  } else {
    await AsyncStorage.setItem(key, value);
  }
}

async function storageGet(key: string, persistent: boolean): Promise<string | null> {
  if (Platform.OS === 'web') {
    const primary = persistent ? webLocalStorage() : webSessionStorage();
    const fallback = persistent ? webSessionStorage() : webLocalStorage();
    return primary?.getItem(key) ?? fallback?.getItem(key) ?? null;
  }
  return AsyncStorage.getItem(key);
}

async function storageRemove(keys: string[]): Promise<void> {
  if (Platform.OS === 'web') {
    for (const key of keys) {
      webLocalStorage()?.removeItem(key);
      webSessionStorage()?.removeItem(key);
    }
    return;
  }
  await AsyncStorage.multiRemove(keys);
}

export async function loadRememberMePreference(): Promise<boolean> {
  const raw = await AsyncStorage.getItem(REMEMBER_ME_KEY);
  if (raw === '1') return true;
  if (raw === '0') return false;
  if (Platform.OS === 'web') {
    return webLocalStorage()?.getItem(ACCESS_TOKEN_KEY) != null;
  }
  return false;
}

export async function saveRememberMePreference(rememberMe: boolean): Promise<void> {
  await AsyncStorage.setItem(REMEMBER_ME_KEY, rememberMe ? '1' : '0');
}

export async function loadAccessToken(): Promise<string | null> {
  const remember = await loadRememberMePreference();
  return storageGet(ACCESS_TOKEN_KEY, remember);
}

export async function loadRefreshToken(): Promise<string | null> {
  const remember = await loadRememberMePreference();
  return storageGet(REFRESH_TOKEN_KEY, remember);
}

export async function saveAuthSession(input: {
  accessToken: string;
  refreshToken?: string | null;
  user: StoredAuthUser;
  rememberMe: boolean;
}): Promise<void> {
  await saveRememberMePreference(input.rememberMe);
  const persistent = input.rememberMe;
  await storageSet(ACCESS_TOKEN_KEY, input.accessToken, persistent);
  await storageSet(USER_KEY, JSON.stringify(input.user), persistent);
  if (input.refreshToken) {
    await storageSet(REFRESH_TOKEN_KEY, input.refreshToken, persistent);
  } else {
    await storageRemove([REFRESH_TOKEN_KEY]);
  }
}

export async function loadStoredAuthUser(): Promise<StoredAuthUser | null> {
  const remember = await loadRememberMePreference();
  const raw = await storageGet(USER_KEY, remember);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredAuthUser;
  } catch {
    return null;
  }
}

export async function clearAuthSession(): Promise<void> {
  await storageRemove([ACCESS_TOKEN_KEY, USER_KEY, REFRESH_TOKEN_KEY]);
}
