import type {
  SkywriteCommentRecord,
  SkywriteCommentStarterKind,
  SkywriteCommentState,
} from '@/skywrite/comments/skywriteCommentTypes';

function nowMs(): number {
  return Date.now();
}

export function commentsForSkywrite(
  state: SkywriteCommentState,
  skywriteId: string,
): SkywriteCommentRecord[] {
  return state.comments
    .filter((entry) => entry.skywriteId === skywriteId)
    .sort((a, b) => a.createdAt - b.createdAt);
}

export function commentCountForSkywrite(state: SkywriteCommentState, skywriteId: string): number {
  return commentsForSkywrite(state, skywriteId).length;
}

export function addSkywriteComment(
  state: SkywriteCommentState,
  params: {
    skywriteId: string;
    authorId: string;
    body: string;
    starterKind?: SkywriteCommentStarterKind;
    clientRequestId?: string;
    commentId?: string;
  },
): { state: SkywriteCommentState; comment: SkywriteCommentRecord } | { state: SkywriteCommentState; duplicate: true } {
  const trimmed = params.body.trim();
  if (!trimmed) {
    return { state, duplicate: true };
  }

  if (params.clientRequestId) {
    const existing = state.comments.find(
      (entry) => entry.clientRequestId === params.clientRequestId,
    );
    if (existing) {
      return { state, duplicate: true };
    }
  }

  const ts = nowMs();
  const comment: SkywriteCommentRecord = {
    commentId: params.commentId ?? `cmt-${params.skywriteId}-${ts}`,
    skywriteId: params.skywriteId,
    authorId: params.authorId,
    body: trimmed,
    createdAt: ts,
    updatedAt: ts,
    starterKind: params.starterKind,
    clientRequestId: params.clientRequestId,
  };

  return {
    state: {
      ...state,
      comments: [...state.comments, comment],
      updatedAt: ts,
    },
    comment,
  };
}

export function deleteSkywriteComment(
  state: SkywriteCommentState,
  commentId: string,
  authorId: string,
): { state: SkywriteCommentState; removed: SkywriteCommentRecord | null } {
  const target = state.comments.find((entry) => entry.commentId === commentId);
  if (!target || target.authorId !== authorId) {
    return { state, removed: null };
  }
  const ts = nowMs();
  return {
    state: {
      ...state,
      comments: state.comments.filter((entry) => entry.commentId !== commentId),
      updatedAt: ts,
    },
    removed: target,
  };
}

export function updateSkywriteCommentBody(
  state: SkywriteCommentState,
  commentId: string,
  authorId: string,
  body: string,
): { state: SkywriteCommentState; comment: SkywriteCommentRecord | null } {
  const trimmed = body.trim();
  if (!trimmed) return { state, comment: null };
  const ts = nowMs();
  let updated: SkywriteCommentRecord | null = null;
  const comments = state.comments.map((entry) => {
    if (entry.commentId !== commentId || entry.authorId !== authorId) return entry;
    updated = { ...entry, body: trimmed, updatedAt: ts };
    return updated;
  });
  if (!updated) return { state, comment: null };
  return {
    state: { ...state, comments, updatedAt: ts },
    comment: updated,
  };
}
