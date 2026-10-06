import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { resolveActiveUserId } from '@/auth/resolveActiveUserId';
import { useReelyouAuth } from '@/auth/ReelyouAuthProvider';
import { useReelyouConnect } from '@/connect/ReelyouConnectProvider';
import {
  fetchSkywriteCommentsFromServer,
  isSharedSocialPersistenceEnabled,
  deleteSkywriteCommentFromServer,
  postSkywriteCommentToServer,
} from '@/social/sharedSocialApi';
import { canCommentOnSkywrite } from '@/skywrite/comments/canCommentOnSkywrite';
import {
  addSkywriteComment,
  commentCountForSkywrite,
  commentsForSkywrite,
  deleteSkywriteComment,
  mergeServerCommentsForSkywrite,
} from '@/skywrite/comments/skywriteCommentLogic';
import {
  loadSkywriteCommentState,
  saveSkywriteCommentState,
} from '@/skywrite/comments/skywriteCommentPersistence';
import {
  scheduleCommentBackgroundEffects,
  scheduleCommentRemovalBackgroundEffects,
} from '@/skywrite/comments/scheduleCommentBackgroundEffects';
import type {
  SkywriteCommentRecord,
  SkywriteCommentStarterKind,
  SkywriteCommentState,
} from '@/skywrite/comments/skywriteCommentTypes';
import { EMPTY_SKYWRITE_COMMENT_STATE } from '@/skywrite/comments/skywriteCommentTypes';
import { isFollowingSkyUser } from '@/social/skyFollow/skyFollowLogic';
import type { SkywriteRecord } from '@/skywrite/types';

interface AddCommentResult {
  ok: true;
  comment: SkywriteCommentRecord;
}

interface AddCommentFailure {
  ok: false;
  reason: 'empty' | 'duplicate' | 'forbidden' | 'storage';
}

interface SkywriteCommentContextValue {
  isLoaded: boolean;
  getComments: (skywriteId: string) => SkywriteCommentRecord[];
  getCommentCount: (skywriteId: string) => number;
  canViewerComment: (skywrite: SkywriteRecord) => boolean;
  addComment: (params: {
    skywrite: SkywriteRecord;
    body: string;
    starterKind?: SkywriteCommentStarterKind;
    clientRequestId?: string;
  }) => Promise<AddCommentResult | AddCommentFailure>;
  syncCommentsForSkywrite: (skywriteId: string) => Promise<void>;
  deleteComment: (skywrite: SkywriteRecord, commentId: string) => Promise<boolean>;
}

const SkywriteCommentContext = createContext<SkywriteCommentContextValue | null>(null);

export function SkywriteCommentProvider({ children }: { children: ReactNode }) {
  const { user: authUser } = useReelyouAuth();
  const activeUserId = resolveActiveUserId(authUser);
  const { messages, skyFollowGraph } = useReelyouConnect();
  const [state, setState] = useState<SkywriteCommentState>(EMPTY_SKYWRITE_COMMENT_STATE);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    void loadSkywriteCommentState().then((loaded) => {
      if (!mounted) return;
      setState(loaded);
      setIsLoaded(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const persist = useCallback((next: SkywriteCommentState) => {
    setState(next);
    void saveSkywriteCommentState(next).catch(() => {
      /* surface via send error in UI */
    });
  }, []);

  const canViewerComment = useCallback(
    (skywrite: SkywriteRecord) => {
      const authorId = skywrite.authorId ?? activeUserId;
      return canCommentOnSkywrite({
        viewerId: activeUserId,
        authorId,
        visibility: skywrite.visibility,
        viewerFollowsAuthor: isFollowingSkyUser(skyFollowGraph, activeUserId, authorId),
        authorFollowsViewer: isFollowingSkyUser(skyFollowGraph, authorId, activeUserId),
        viewerBlockedAuthor: messages.blockedUserIds.includes(authorId),
        authorBlockedViewer: messages.blockedUserIds.includes(activeUserId),
      });
    },
    [activeUserId, messages.blockedUserIds, skyFollowGraph],
  );

  const getComments = useCallback(
    (skywriteId: string) => commentsForSkywrite(state, skywriteId),
    [state],
  );

  const getCommentCount = useCallback(
    (skywriteId: string) => commentCountForSkywrite(state, skywriteId),
    [state],
  );

  const addComment = useCallback(
    async (params: {
      skywrite: SkywriteRecord;
      body: string;
      starterKind?: SkywriteCommentStarterKind;
      clientRequestId?: string;
    }): Promise<AddCommentResult | AddCommentFailure> => {
      if (!canViewerComment(params.skywrite)) {
        return { ok: false, reason: 'forbidden' };
      }
      const trimmed = params.body.trim();
      if (!trimmed) return { ok: false, reason: 'empty' };

      if (params.clientRequestId) {
        const existing = state.comments.find(
          (entry) => entry.clientRequestId === params.clientRequestId,
        );
        if (existing) return { ok: true, comment: existing };
      }

      let serverCommentId: string | undefined;
      if (isSharedSocialPersistenceEnabled()) {
        const server = await postSkywriteCommentToServer(params.skywrite.id, trimmed);
        if (!server.ok) return { ok: false, reason: 'storage' };
        serverCommentId = server.comment.id;
      }

      const result = addSkywriteComment(state, {
        skywriteId: params.skywrite.id,
        authorId: activeUserId,
        body: trimmed,
        starterKind: params.starterKind,
        clientRequestId: params.clientRequestId,
        commentId: serverCommentId,
      });
      if ('duplicate' in result) {
        return { ok: false, reason: 'duplicate' };
      }
      try {
        persist(result.state);
      } catch {
        return { ok: false, reason: 'storage' };
      }
      scheduleCommentBackgroundEffects(result.comment, params.skywrite);
      return { ok: true, comment: result.comment };
    },
    [activeUserId, canViewerComment, persist, state],
  );

  const syncCommentsForSkywrite = useCallback(async (skywriteId: string) => {
    if (!isSharedSocialPersistenceEnabled()) return;
    const remote = await fetchSkywriteCommentsFromServer(skywriteId);
    if (!remote) return;
    setState((current) => {
      const merged = mergeServerCommentsForSkywrite(current, skywriteId, remote);
      if (merged === current) return current;
      void saveSkywriteCommentState(merged);
      return merged;
    });
  }, []);

  const deleteComment = useCallback(
    async (skywrite: SkywriteRecord, commentId: string) => {
      const postOwnerId = skywrite.authorId ?? activeUserId;
      const result = deleteSkywriteComment(state, commentId, activeUserId, postOwnerId);
      if (!result.removed) return false;
      if (isSharedSocialPersistenceEnabled()) {
        const deleted = await deleteSkywriteCommentFromServer(skywrite.id, commentId);
        if (!deleted) return false;
      }
      persist(result.state);
      scheduleCommentRemovalBackgroundEffects(commentId);
      return true;
    },
    [activeUserId, persist, state],
  );

  const value = useMemo<SkywriteCommentContextValue>(
    () => ({
      isLoaded,
      getComments,
      getCommentCount,
      canViewerComment,
      addComment,
      syncCommentsForSkywrite,
      deleteComment,
    }),
    [
      addComment,
      canViewerComment,
      deleteComment,
      getCommentCount,
      getComments,
      isLoaded,
      syncCommentsForSkywrite,
    ],
  );

  return (
    <SkywriteCommentContext.Provider value={value}>{children}</SkywriteCommentContext.Provider>
  );
}

export function useSkywriteComments(): SkywriteCommentContextValue {
  const ctx = useContext(SkywriteCommentContext);
  if (!ctx) {
    throw new Error('useSkywriteComments must be used within SkywriteCommentProvider');
  }
  return ctx;
}
