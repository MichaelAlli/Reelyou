import {
  DEFAULT_USER_AVATAR_IDENTITY,
  type UserAvatarIdentity,
} from '@/identity/userAvatarTypes';
import { readScopedJson, writeScopedJson } from '@/storage/scopedAsyncStorage';

const STORAGE_KEY = '@reellyou/user-avatar-identity';

function parseIdentity(raw: string | null): UserAvatarIdentity {
  if (!raw) return { ...DEFAULT_USER_AVATAR_IDENTITY };
  try {
    return { ...DEFAULT_USER_AVATAR_IDENTITY, ...(JSON.parse(raw) as UserAvatarIdentity) };
  } catch {
    return { ...DEFAULT_USER_AVATAR_IDENTITY };
  }
}

export async function loadUserAvatarIdentity(): Promise<UserAvatarIdentity> {
  try {
    return await readScopedJson(STORAGE_KEY, parseIdentity);
  } catch {
    return { ...DEFAULT_USER_AVATAR_IDENTITY };
  }
}

export async function saveUserAvatarIdentity(identity: UserAvatarIdentity): Promise<void> {
  await writeScopedJson(STORAGE_KEY, identity);
}
