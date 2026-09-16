import AsyncStorage from '@react-native-async-storage/async-storage';

import type { SkywriteRecord, SkywritesState } from '@/skywrite/types';
import { EMPTY_SKYWRITES } from '@/skywrite/types';
import type { Mood, Privacy } from '@/types';

const STORAGE_KEY = '@reellyou/skywrites';

function isPrivacy(value: unknown): value is Privacy {
  return value === 'private' || value === 'orbit' || value === 'public';
}

function isMood(value: unknown): value is Mood {
  return (
    value === 'hopeful' ||
    value === 'grateful' ||
    value === 'reflective' ||
    value === 'determined' ||
    value === 'peaceful'
  );
}

function parsePost(raw: unknown): SkywriteRecord | null {
  if (!raw || typeof raw !== 'object') return null;
  const entry = raw as Partial<SkywriteRecord>;
  if (typeof entry.id !== 'string' || typeof entry.text !== 'string') return null;
  if (!isPrivacy(entry.visibility)) return null;
  const userHashtags = Array.isArray(entry.userHashtags)
    ? entry.userHashtags.filter((tag): tag is string => typeof tag === 'string')
    : [];
  return {
    id: entry.id,
    text: entry.text,
    media: null,
    visibility: entry.visibility,
    mood: isMood(entry.mood) ? entry.mood : null,
    userHashtags,
    createdAt: typeof entry.createdAt === 'string' ? entry.createdAt : new Date().toISOString(),
  };
}

function parseState(raw: string | null): SkywritesState {
  if (!raw) return EMPTY_SKYWRITES;
  try {
    const parsed = JSON.parse(raw) as { posts?: unknown[] };
    const posts = Array.isArray(parsed.posts)
      ? parsed.posts.map(parsePost).filter((post): post is SkywriteRecord => post !== null)
      : [];
    return { posts };
  } catch {
    return EMPTY_SKYWRITES;
  }
}

export async function loadSkywrites(): Promise<SkywritesState> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    return parseState(stored);
  } catch {
    return EMPTY_SKYWRITES;
  }
}

export async function saveSkywrites(state: SkywritesState): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Non-blocking.
  }
}
