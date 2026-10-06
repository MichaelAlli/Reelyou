import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { SkywriteCopy } from '@/constants/skywriteCopy';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useEffectiveViewerId } from '@/auth/useSessionUserId';
import { orbitUsers } from '@/data/mockData';
import { useSkywriteComments } from '@/skywrite/comments/SkywriteCommentProvider';
import type { SkywriteCommentStarterKind } from '@/skywrite/comments/skywriteCommentTypes';
import type { SkywriteRecord } from '@/skywrite/types';

const STARTERS: { id: SkywriteCommentStarterKind; label: string; prompt: string }[] = [
  {
    id: 'encourage',
    label: 'Encourage',
    prompt: 'Something I want you to know…',
  },
  {
    id: 'relate',
    label: 'Relate',
    prompt: 'I’ve experienced something similar…',
  },
  {
    id: 'idea',
    label: 'Offer an idea',
    prompt: 'One thought you could explore…',
  },
];

function displayNameForUser(userId: string, viewerId: string | null): string {
  if (userId === viewerId) return 'You';
  const orbit = orbitUsers.find((entry) => entry.id === userId);
  return orbit?.name.split(' ')[0] ?? 'Sky friend';
}

function formatCommentTime(ts: number): string {
  try {
    return new Date(ts).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

interface SkywriteCommentsPanelProps {
  skywrite: SkywriteRecord;
  compact?: boolean;
}

export function SkywriteCommentsPanel({ skywrite, compact = false }: SkywriteCommentsPanelProps) {
  const activeUserId = useEffectiveViewerId();
  const postOwnerId = skywrite.authorId ?? activeUserId ?? '';
  const { getComments, getCommentCount, canViewerComment, addComment, deleteComment, syncCommentsForSkywrite } =
    useSkywriteComments();
  const comments = useMemo(() => getComments(skywrite.id), [getComments, skywrite.id]);
  const count = getCommentCount(skywrite.id);
  const mayComment = canViewerComment(skywrite);

  useEffect(() => {
    void syncCommentsForSkywrite(skywrite.id);
  }, [skywrite.id, syncCommentsForSkywrite]);

  const [draft, setDraft] = useState('');
  const [activeStarter, setActiveStarter] = useState<SkywriteCommentStarterKind | null>(null);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const pendingRequestIdRef = useRef<string | null>(null);

  const applyStarter = useCallback((starter: (typeof STARTERS)[number]) => {
    setActiveStarter(starter.id);
    setDraft((current) => {
      const prefix = `${starter.prompt} `;
      if (current.trim().length === 0) return prefix;
      if (current.startsWith(starter.prompt)) return current;
      return `${prefix}${current}`;
    });
    setSendError(null);
  }, []);

  const handleSend = useCallback(async () => {
    const trimmed = draft.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setSendError(null);
    const clientRequestId = pendingRequestIdRef.current ?? `req-${Date.now()}`;
    pendingRequestIdRef.current = clientRequestId;
    const result = await addComment({
      skywrite,
      body: trimmed,
      starterKind: activeStarter ?? undefined,
      clientRequestId,
    });
    setSending(false);
    if (!result.ok) {
      if (result.reason === 'duplicate') {
        setSendError(null);
        setDraft('');
        setActiveStarter(null);
        pendingRequestIdRef.current = null;
        return;
      }
      setSendError(
        result.reason === 'forbidden'
          ? SkywriteCopy.commentForbidden
          : SkywriteCopy.commentSendError,
      );
      return;
    }
    setDraft('');
    setActiveStarter(null);
    pendingRequestIdRef.current = null;
  }, [activeStarter, addComment, draft, sending, skywrite]);

  const handleDelete = useCallback(
    async (commentId: string) => {
      await deleteComment(skywrite, commentId);
    },
    [deleteComment, skywrite],
  );

  if (!mayComment && comments.length === 0) return null;

  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      <Text style={styles.title}>
        {SkywriteCopy.commentsTitle}
        {count > 0 ? ` (${count})` : ''}
      </Text>

      {comments.map((comment) => (
        <View key={comment.commentId} style={styles.commentCard}>
          <View style={styles.commentHeader}>
            <Text style={styles.author}>{displayNameForUser(comment.authorId, activeUserId)}</Text>
            <Text style={styles.time}>{formatCommentTime(comment.createdAt)}</Text>
          </View>
          <Text style={styles.body}>{comment.body}</Text>
          {comment.authorId === activeUserId || postOwnerId === activeUserId ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={SkywriteCopy.deleteOwnComment}
              onPress={() => void handleDelete(comment.commentId)}
              style={styles.deleteBtn}>
              <Text style={styles.deleteText}>{SkywriteCopy.deleteOwnComment}</Text>
            </Pressable>
          ) : null}
        </View>
      ))}

      {mayComment ? (
        <View style={styles.composer}>
          <View style={styles.starterRow}>
            {STARTERS.map((starter) => (
              <Pressable
                key={starter.id}
                accessibilityRole="button"
                accessibilityLabel={starter.label}
                onPress={() => applyStarter(starter)}
                style={[
                  styles.starterChip,
                  activeStarter === starter.id && styles.starterChipActive,
                ]}>
                <Text style={styles.starterText}>{starter.label}</Text>
              </Pressable>
            ))}
          </View>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={SkywriteCopy.commentPlaceholder}
            placeholderTextColor="rgba(248,244,236,0.45)"
            multiline
            style={styles.input}
          />
          {sendError ? <Text style={styles.error}>{sendError}</Text> : null}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={SkywriteCopy.commentSend}
            disabled={sending || draft.trim().length === 0}
            onPress={() => void handleSend()}
            style={[styles.sendBtn, (sending || draft.trim().length === 0) && styles.sendDisabled]}>
            {sending ? (
              <ActivityIndicator color="#1a1028" />
            ) : (
              <Text style={styles.sendText}>{SkywriteCopy.commentSend}</Text>
            )}
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: Spacing.md,
    gap: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(232, 200, 114, 0.22)',
  },
  wrapCompact: {
    marginTop: Spacing.sm,
  },
  title: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: '#E8C872',
  },
  commentCard: {
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(167, 139, 250, 0.22)',
    backgroundColor: 'rgba(8, 10, 28, 0.45)',
    padding: Spacing.sm,
    gap: 4,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  author: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(248,244,236,0.92)',
  },
  time: {
    fontFamily: Fonts.sans,
    fontSize: 10,
    color: 'rgba(248,244,236,0.55)',
  },
  body: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(248,244,236,0.88)',
  },
  deleteBtn: {
    alignSelf: 'flex-start',
    minHeight: 32,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  deleteText: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(248,244,236,0.55)',
  },
  composer: {
    gap: 8,
    marginTop: 4,
  },
  starterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  starterChip: {
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232, 200, 114, 0.35)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    minHeight: 32,
    justifyContent: 'center',
  },
  starterChipActive: {
    backgroundColor: 'rgba(232, 200, 114, 0.12)',
  },
  starterText: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '600',
    color: '#E8C872',
  },
  input: {
    minHeight: 72,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232, 200, 114, 0.35)',
    backgroundColor: 'rgba(6, 10, 28, 0.78)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    color: '#FFF8F0',
    textAlignVertical: 'top',
  },
  error: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: '#F87171',
  },
  sendBtn: {
    minHeight: 44,
    borderRadius: Radius.full,
    backgroundColor: '#E8C872',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  sendDisabled: { opacity: 0.5 },
  sendText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1028',
  },
});
