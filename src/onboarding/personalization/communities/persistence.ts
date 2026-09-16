import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  EMPTY_COMMUNITIES,
  isCommunityId,
  type CommunitiesRecord,
  type CommunityId,
  type JoinedCommunity,
} from '@/onboarding/personalization/communities/types';

const STORAGE_KEY = '@reellyou/communities';

function parseJoinedEntry(raw: unknown): JoinedCommunity | null {
  if (!raw || typeof raw !== 'object') return null;
  const entry = raw as Partial<JoinedCommunity>;
  if (typeof entry.id !== 'string' || !isCommunityId(entry.id)) return null;
  if (typeof entry.name !== 'string' || entry.name.trim().length === 0) return null;
  if (typeof entry.joinedAt !== 'string') return null;
  return { id: entry.id, name: entry.name.trim(), joinedAt: entry.joinedAt };
}

function parseRecord(raw: string | null): CommunitiesRecord {
  if (!raw) return EMPTY_COMMUNITIES;
  try {
    const parsed = JSON.parse(raw) as Partial<CommunitiesRecord>;
    const joined = Array.isArray(parsed.joined)
      ? parsed.joined.map(parseJoinedEntry).filter((entry): entry is JoinedCommunity => entry !== null)
      : [];
    const explicitInterests = Array.isArray(parsed.explicitInterests)
      ? parsed.explicitInterests.filter((id): id is CommunityId => typeof id === 'string' && isCommunityId(id))
      : [];
    return { joined, explicitInterests };
  } catch {
    return EMPTY_COMMUNITIES;
  }
}

export async function loadCommunities(): Promise<CommunitiesRecord> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    return parseRecord(stored);
  } catch {
    return EMPTY_COMMUNITIES;
  }
}

export async function saveCommunities(record: CommunitiesRecord): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Persistence failure should not block in-memory updates.
  }
}

export async function clearCommunitiesStorage(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // Non-blocking.
  }
}
