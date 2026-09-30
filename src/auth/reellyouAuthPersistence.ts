import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_TOKEN_KEY = 'reellyou.auth.accessToken.v1';
const USER_KEY = 'reellyou.auth.user.v1';

export interface StoredAuthUser {
  id: string;
  fullName: string;
  email: string;
}

export async function loadAccessToken(): Promise<string | null> {
  return AsyncStorage.getItem(ACCESS_TOKEN_KEY);
}

export async function saveAuthSession(input: {
  accessToken: string;
  user: StoredAuthUser;
}): Promise<void> {
  await AsyncStorage.multiSet([
    [ACCESS_TOKEN_KEY, input.accessToken],
    [USER_KEY, JSON.stringify(input.user)],
  ]);
}

export async function loadStoredAuthUser(): Promise<StoredAuthUser | null> {
  const raw = await AsyncStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredAuthUser;
  } catch {
    return null;
  }
}

export async function clearAuthSession(): Promise<void> {
  await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, USER_KEY]);
}
