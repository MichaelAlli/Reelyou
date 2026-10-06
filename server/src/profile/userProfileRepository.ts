import { getUserRecord } from '../db/accountRepository.js';
import { loadAccountDatabase, persistAccountDatabase, type StoredUser } from '../db/accountStore.js';

export interface UserProfileRecord {
  userId: string;
  fullName: string;
  email: string;
  username: string | null;
  bio: string | null;
  avatarMediaKey: string | null;
  onboardingComplete: boolean;
  updatedAt: number;
}

function rowToProfile(row: StoredUser): UserProfileRecord {
  return {
    userId: row.id,
    fullName: row.fullName,
    email: row.emailNormalized,
    username: row.username ?? null,
    bio: row.bio ?? null,
    avatarMediaKey: row.avatarMediaKey ?? null,
    onboardingComplete: row.onboardingComplete === true,
    updatedAt: row.profileUpdatedAt ?? row.createdAt,
  };
}

export function getUserProfile(userId: string): UserProfileRecord | null {
  const row = getUserRecord(userId);
  if (!row) return null;
  return rowToProfile(row);
}

export function updateUserProfile(
  userId: string,
  patch: {
    fullName?: string;
    username?: string | null;
    bio?: string | null;
    avatarMediaKey?: string | null;
  },
): UserProfileRecord | null {
  const db = loadAccountDatabase();
  const row = db.users.find((u) => u.id === userId && u.deletedAt == null);
  if (!row) return null;
  if (typeof patch.fullName === 'string') {
    const trimmed = patch.fullName.trim();
    if (trimmed) row.fullName = trimmed;
  }
  if (patch.username !== undefined) {
    const trimmed = patch.username?.trim() ?? '';
    row.username = trimmed.length > 0 ? trimmed : null;
  }
  if (patch.bio !== undefined) {
    const trimmed = patch.bio?.trim() ?? '';
    row.bio = trimmed.length > 0 ? trimmed : null;
  }
  if (patch.avatarMediaKey !== undefined) {
    row.avatarMediaKey = patch.avatarMediaKey?.trim() ? patch.avatarMediaKey.trim() : null;
  }
  row.profileUpdatedAt = Date.now();
  persistAccountDatabase();
  return rowToProfile(row);
}

export function setUserOnboardingComplete(
  userId: string,
  complete: boolean,
  onboardingSnapshot?: Record<string, unknown> | null,
): UserProfileRecord | null {
  const db = loadAccountDatabase();
  const row = db.users.find((u) => u.id === userId && u.deletedAt == null);
  if (!row) return null;
  row.onboardingComplete = complete;
  if (onboardingSnapshot !== undefined) {
    row.onboardingSnapshot = onboardingSnapshot ?? null;
  }
  row.profileUpdatedAt = Date.now();
  persistAccountDatabase();
  return rowToProfile(row);
}
