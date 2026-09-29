import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  EMPTY_SKYWRITE_COMMENT_STATE,
  type SkywriteCommentRecord,
  type SkywriteCommentStarterKind,
  type SkywriteCommentState,
} from '@/skywrite/comments/skywriteCommentTypes';

const STORAGE_KEY = '@reellyou/skywrite-comments';

const STARTER_KINDS = new Set<SkywriteCommentStarterKind>(['encourage', 'relate', 'idea']);

function parseComment(raw: unknown): SkywriteCommentRecord | null {
  if (!raw || typeof raw !== 'object') return null;
  const entry = raw as Partial<SkywriteCommentRecord>;
  if (typeof entry.commentId !== 'string') return null;
  if (typeof entry.skywriteId !== 'string') return null;
  if (typeof entry.authorId !== 'string') return null;
  if (typeof entry.body !== 'string') return null;
  if (typeof entry.createdAt !== 'number') return null;
  const starterKind =
    typeof entry.starterKind === 'string' && STARTER_KINDS.has(entry.starterKind as SkywriteCommentStarterKind)
      ? (entry.starterKind as SkywriteCommentStarterKind)
      : undefined;
  return {
    commentId: entry.commentId,
    skywriteId: entry.skywriteId,
    authorId: entry.authorId,
    body: entry.body,
    createdAt: entry.createdAt,
    updatedAt: typeof entry.updatedAt === 'number' ? entry.updatedAt : entry.createdAt,
    starterKind,
    clientRequestId:
      typeof entry.clientRequestId === 'string' ? entry.clientRequestId : undefined,
  };
}

export function parseSkywriteCommentState(raw: string | null): SkywriteCommentState {
  if (!raw) return { ...EMPTY_SKYWRITE_COMMENT_STATE };
  try {
    const parsed = JSON.parse(raw) as Partial<SkywriteCommentState>;
    const comments = Array.isArray(parsed.comments)
      ? parsed.comments
          .map(parseComment)
          .filter((entry): entry is SkywriteCommentRecord => entry != null)
      : [];
    return {
      comments,
      updatedAt: typeof parsed.updatedAt === 'number' ? parsed.updatedAt : 0,
    };
  } catch {
    return { ...EMPTY_SKYWRITE_COMMENT_STATE };
  }
}

export async function loadSkywriteCommentState(): Promise<SkywriteCommentState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return parseSkywriteCommentState(raw);
  } catch {
    return { ...EMPTY_SKYWRITE_COMMENT_STATE };
  }
}

export async function saveSkywriteCommentState(state: SkywriteCommentState): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
