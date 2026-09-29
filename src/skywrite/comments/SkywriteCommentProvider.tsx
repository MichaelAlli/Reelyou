import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { useReelyouConnect } from '@/connect/ReelyouConnectProvider';
import { currentUser } from '@/data/mockData';
import { canCommentOnSkywrite } from '@/skywrite/comments/canCommentOnSkywrite';
import {
  addSkywriteComment,
  commentCountForSkywrite,
  commentsForSkywrite,
  deleteSkywriteComment,
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
  deleteOwnComment: (commentId: string) => Promise<boolean>;
}

const SkywriteCommentContext = createContext<SkywriteCommentContextValue | null>(null);

export function SkywriteCommentProvider({ children }: { children: ReactNode }) {
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
      const authorId = skywrite.authorId ?? currentUser.id;
      return canCommentOnSkywrite({
        viewerId: currentUser.id,
        authorId,
        visibility: skywrite.visibility,
        viewerFollowsAuthor: isFollowingSkyUser(skyFollowGraph, currentUser.id, authorId),
        authorFollowsViewer: isFollowingSkyUser(skyFollowGraph, authorId, currentUser.id),
        viewerBlockedAuthor: messages.blockedUserIds.includes(authorId),
        authorBlockedViewer: messages.blockedUserIds.includes(currentUser.id),
      });
    },
    [messages.blockedUserIds, skyFollowGraph],
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
      const result = addSkywriteComment(state, {
        skywriteId: params.skywrite.id,
        authorId: currentUser.id,
        body: params.body,
        starterKind: params.starterKind,
        clientRequestId: params.clientRequestId,
      });
      if ('duplicate' in result) {
        if (!params.body.trim()) return { ok: false, reason: 'empty' };
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
    [canViewerComment, persist, state],
  );

  const deleteOwnComment = useCallback(
    async (commentId: string) => {
      const result = deleteSkywriteComment(state, commentId, currentUser.id);
      if (!result.removed) return false;
      persist(result.state);
      scheduleCommentRemovalBackgroundEffects(commentId);
      return true;
    },
    [persist, state],
  );

  const value = useMemo<SkywriteCommentContextValue>(
    () => ({
      isLoaded,
      getComments,
      getCommentCount,
      canViewerComment,
      addComment,
      deleteOwnComment,
    }),
    [addComment, canViewerComment, deleteOwnComment, getCommentCount, getComments, isLoaded],
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
