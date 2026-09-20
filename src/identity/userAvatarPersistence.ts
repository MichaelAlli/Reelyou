import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  DEFAULT_USER_AVATAR_IDENTITY,
  type UserAvatarIdentity,
} from '@/identity/userAvatarTypes';

const STORAGE_KEY = '@reellyou/user-avatar-identity';

export async function loadUserAvatarIdentity(): Promise<UserAvatarIdentity> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_USER_AVATAR_IDENTITY };
    return { ...DEFAULT_USER_AVATAR_IDENTITY, ...(JSON.parse(raw) as UserAvatarIdentity) };
  } catch {
    return { ...DEFAULT_USER_AVATAR_IDENTITY };
  }
}

export async function saveUserAvatarIdentity(identity: UserAvatarIdentity): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(identity));
}
