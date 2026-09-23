import AsyncStorage from '@react-native-async-storage/async-storage';

import { SKYWRITE_SHOWING_UP_OPTIONS } from '@/constants/skywriteCopy';
import { isSkywriteTextStyle } from '@/constants/skywriteTextStyles';
import { isSkyAreaCategoryId } from '@/skyAreas/skyAreaCategory';
import { deriveMediaMode } from '@/skywrite/draft';
import type { SkywriteIntentId } from '@/skywrite/types';
import type {
  SkywriteAudioMedia,
  SkywriteMedia,
  SkywriteMediaMode,
  SkywritePhotoMedia,
  SkywriteRecord,
  SkywritesState,
} from '@/skywrite/types';
import { EMPTY_SKYWRITE_MEDIA, EMPTY_SKYWRITES } from '@/skywrite/types';
import type { Mood, Privacy } from '@/types';

const SHOWING_UP_IDS = new Set(SKYWRITE_SHOWING_UP_OPTIONS.map((option) => option.id));
const MEDIA_MODES = new Set<SkywriteMediaMode>(['text', 'photo', 'voice', 'photo_voiceover']);

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

function parsePhoto(raw: unknown): SkywritePhotoMedia | null {
  if (!raw || typeof raw !== 'object') return null;
  const entry = raw as Partial<SkywritePhotoMedia>;
  if (typeof entry.uri !== 'string') return null;
  return {
    uri: entry.uri,
    width: typeof entry.width === 'number' ? entry.width : undefined,
    height: typeof entry.height === 'number' ? entry.height : undefined,
  };
}

function parseAudio(raw: unknown): SkywriteAudioMedia | null {
  if (!raw || typeof raw !== 'object') return null;
  const entry = raw as Partial<SkywriteAudioMedia>;
  if (typeof entry.uri !== 'string') return null;
  return {
    uri: entry.uri,
    durationMs: typeof entry.durationMs === 'number' ? entry.durationMs : undefined,
  };
}

function parseMedia(raw: unknown): SkywriteMedia {
  if (!raw || typeof raw !== 'object') return { ...EMPTY_SKYWRITE_MEDIA };
  const entry = raw as { photo?: unknown; audio?: unknown };
  return {
    photo: parsePhoto(entry.photo),
    audio: parseAudio(entry.audio),
  };
}

function parsePost(raw: unknown): SkywriteRecord | null {
  if (!raw || typeof raw !== 'object') return null;
  const entry = raw as Partial<SkywriteRecord>;
  if (typeof entry.id !== 'string') return null;
  if (typeof entry.text !== 'string') return null;
  if (!isPrivacy(entry.visibility)) return null;

  const userHashtags = Array.isArray(entry.userHashtags)
    ? entry.userHashtags.filter((tag): tag is string => typeof tag === 'string')
    : [];
  const showingUp =
    typeof entry.showingUp === 'string' && SHOWING_UP_IDS.has(entry.showingUp as never)
      ? entry.showingUp
      : null;
  const media = parseMedia(entry.media);
  const mediaMode =
    typeof entry.mediaMode === 'string' && MEDIA_MODES.has(entry.mediaMode as SkywriteMediaMode)
      ? (entry.mediaMode as SkywriteMediaMode)
      : deriveMediaMode(media, entry.text);

  const textStyle = isSkywriteTextStyle(entry.textStyle) ? entry.textStyle : 'plain';

  const skyAreaId = isSkyAreaCategoryId(entry.skyAreaId) ? entry.skyAreaId : undefined;

  const intentValues = new Set<SkywriteIntentId>([
    'reflection',
    'question',
    'perspective',
    'learned',
  ]);
  const intent =
    typeof entry.intent === 'string' && intentValues.has(entry.intent as SkywriteIntentId)
      ? (entry.intent as SkywriteIntentId)
      : undefined;

  return {
    id: entry.id,
    authorId: typeof entry.authorId === 'string' ? entry.authorId : undefined,
    text: entry.text,
    textStyle,
    media,
    mediaMode,
    visibility: entry.visibility,
    mood: isMood(entry.mood) ? entry.mood : null,
    showingUp,
    userHashtags,
    skyAreaId,
    intent,
    animateToSky: entry.animateToSky !== false,
    allowAIContext: entry.allowAIContext !== false,
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
