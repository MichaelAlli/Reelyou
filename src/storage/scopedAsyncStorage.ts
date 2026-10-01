import AsyncStorage from '@react-native-async-storage/async-storage';

import { isReelyouAuthConfigured } from '@/auth/reellyouAuthConfig';
import { userScopedStorageKey } from '@/storage/userScopedStorageKey';

let activeUserId: string | null = null;

/** Set before load/save so persistence modules scope keys to the signed-in user. */
export function setActiveStorageUserId(userId: string | null): void {
  activeUserId = userId?.trim() ? userId.trim() : null;
}

export function getActiveStorageUserId(): string | null {
  return activeUserId;
}

function resolveStorageKey(baseKey: string): string {
  if (!isReelyouAuthConfigured() || !activeUserId) return baseKey;
  return userScopedStorageKey(baseKey, activeUserId);
}

/**
 * Read user-scoped value; optionally migrate legacy global key once for the active user.
 */
export async function readScopedJson<T>(
  baseKey: string,
  parse: (raw: string | null) => T,
  migrateLegacy?: (legacy: T, userId: string) => T,
): Promise<T> {
  const scopedKey = resolveStorageKey(baseKey);
  try {
    const scopedRaw = await AsyncStorage.getItem(scopedKey);
    if (scopedRaw != null) return parse(scopedRaw);

    if (!isReelyouAuthConfigured() || !activeUserId || scopedKey === baseKey) {
      return parse(null);
    }

    const legacyRaw = await AsyncStorage.getItem(baseKey);
    if (legacyRaw == null) return parse(null);

    let legacyValue = parse(legacyRaw);
    if (migrateLegacy) {
      legacyValue = migrateLegacy(legacyValue, activeUserId);
    }
    await AsyncStorage.setItem(scopedKey, JSON.stringify(legacyValue));
    return legacyValue;
  } catch {
    return parse(null);
  }
}

export async function writeScopedJson(baseKey: string, value: unknown): Promise<boolean> {
  try {
    await AsyncStorage.setItem(resolveStorageKey(baseKey), JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export async function removeScopedKey(baseKey: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(resolveStorageKey(baseKey));
  } catch {
    // Non-blocking.
  }
}
