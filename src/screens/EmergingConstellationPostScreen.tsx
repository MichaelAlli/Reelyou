import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomNav } from '@/components/BottomNav';
import { ModerationReportSheet } from '@/components/safety/ModerationReportSheet';
import { currentUser } from '@/data/mockData';
import { useReelyouConnect } from '@/connect/ReelyouConnectProvider';
import { CommunityExperienceCopy } from '@/constants/communityExperienceCopy';
import { memberDisplayName } from '@/emergingConstellations/communitySocialFixtures';
import {
  encouragementCountForTarget,
  hasEncouraged,
  visibleRepliesForPost,
} from '@/emergingConstellations/communitySocialLogic';
import { useEmergingConstellations } from '@/emergingConstellations/EmergingConstellationsProvider';
import type { SubmitModerationReportInput } from '@/moderation/moderationTypes';
import { Fonts, Spacing, TabBarHeight } from '@/constants/theme';

export function EmergingConstellationPostScreen() {
  const router = useRouter();
  const { id, postId } = useLocalSearchParams<{ id?: string; postId?: string }>();
  const insets = useSafeAreaInsets();
  const tabInset = TabBarHeight + Math.max(insets.bottom, 8);
  const { messages, submitModerationReport, blockUser, limitUser } = useReelyouConnect();
  const blockedUserIds = messages.blockedUserIds;
  const {
    resolveConstellation,
    membershipFor,
    postById,
    repliesByPost,
    encouragements,
    createReply,
    encourageTarget,
  } = useEmergingConstellations();
  const [replyDraft, setReplyDraft] = useState('');
  const [reportInput, setReportInput] = useState<Omit<
    SubmitModerationReportInput,
    'reporterUserId' | 'reason' | 'optionalNote'
  > | null>(null);

  const constellation = useMemo(() => resolveConstellation(id ?? null), [id, resolveConstellation]);
  const membership = constellation ? membershipFor(constellation.id) : undefined;
  const joined = membership?.status === 'joined';
  const post =
    constellation && postId ? postById(constellation.id, postId) : undefined;

  const replies = useMemo(() => {
    if (!post) return [];
    return visibleRepliesForPost(repliesByPost[post.id] ?? [], post.id, blockedUserIds);
  }, [blockedUserIds, post, repliesByPost]);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else if (constellation) {
      router.replace(`/emerging-constellation?id=${encodeURIComponent(constellation.id)}` as never);
    } else router.replace('/(tabs)/home' as never);
  }, [constellation, router]);

  const handleReply = useCallback(() => {
    if (!constellation || !post || !joined) return;
    createReply(constellation.id, post.id, replyDraft);
    setReplyDraft('');
  }, [constellation, createReply, joined, post, replyDraft]);

  if (!constellation || !post || post.moderationStatus !== 'visible') {
    return (
      <View style={styles.root}>
        <Text style={styles.unavailable}>This thread is not available.</Text>
        <BottomNav />
      </View>
    );
  }

  if (blockedUserIds.includes(post.authorUserId)) {
    return (
      <View style={styles.root}>
        <Text style={styles.unavailable}>This content is not available.</Text>
        <BottomNav />
      </View>
    );
  }

  const postEncouraged = hasEncouraged(encouragements, 'post', post.id, currentUser.id);
  const postEncourageCount = encouragementCountForTarget(encouragements, 'post', post.id);
  const authorName =
    post.authorUserId === currentUser.id ? 'You' : memberDisplayName(post.authorUserId);

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#12182A', '#1A2240', '#141A2E']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={8}>
          <Pressable onPress={handleBack} style={styles.back}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
          <ScrollView
            contentContainerStyle={{ paddingBottom: tabInset + (joined ? 120 : 24) }}
            keyboardShouldPersistTaps="handled">
            <View style={styles.heroPerson}>
              <View style={styles.avatarStar}>
                <Text style={styles.avatarInitial}>
                  {authorName === 'You' ? 'Y' : authorName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={styles.author}>{authorName}</Text>
            </View>
            <Text style={styles.body}>{post.content}</Text>

            <View style={styles.actions}>
              {joined ? (
                <Pressable
                  disabled={postEncouraged}
                  onPress={() => encourageTarget(constellation.id, 'post', post.id)}>
                  <Text style={[styles.actionText, postEncouraged && styles.actionMuted]}>
                    {postEncouraged ? 'Encouraged' : 'Encourage'}
                  </Text>
                </Pressable>
              ) : null}
              {postEncourageCount > 0 ? (
                <Text style={styles.supportNote}>
                  {postEncourageCount === 1 ? 'One person encouraged' : `${postEncourageCount} encouraged`}
                </Text>
              ) : null}
              <Pressable
                onPress={() =>
                  setReportInput({
                    targetType: 'community_post',
                    targetId: post.id,
                    targetOwnerUserId: post.authorUserId,
                    communityId: constellation.id,
                    postId: post.id,
                    visibilityContext: 'community_post',
                    provenanceIds: [post.id],
                  })
                }>
                <Text style={styles.report}>Report post</Text>
              </Pressable>
            </View>

            <Text style={styles.repliesTitle}>
              {CommunityExperienceCopy.perspectives(replies.length)}
            </Text>
            {replies.length === 0 ? (
              <Text style={styles.emptyReplies}>{CommunityExperienceCopy.noPerspectivesYet}</Text>
            ) : (
              replies.map((reply) => {
                const encouraged = hasEncouraged(encouragements, 'reply', reply.id, currentUser.id);
                const replyAuthor =
                  reply.authorUserId === currentUser.id
                    ? 'You'
                    : memberDisplayName(reply.authorUserId);
                return (
                  <View key={reply.id} style={styles.replyBlock}>
                    <Text style={styles.replyAuthor}>{replyAuthor}</Text>
                    <Text style={styles.replyBody}>{reply.content}</Text>
                    <View style={styles.replyActions}>
                      {joined ? (
                        <Pressable
                          disabled={encouraged}
                          onPress={() =>
                            encourageTarget(constellation.id, 'reply', reply.id)
                          }>
                          <Text style={[styles.actionText, encouraged && styles.actionMuted]}>
                            {encouraged ? 'Encouraged' : 'Encourage'}
                          </Text>
                        </Pressable>
                      ) : null}
                      <Pressable
                        onPress={() =>
                          setReportInput({
                            targetType: 'reply',
                            targetId: reply.id,
                            targetOwnerUserId: reply.authorUserId,
                            communityId: constellation.id,
                            postId: post.id,
                            replyId: reply.id,
                            visibilityContext: 'community_reply',
                            provenanceIds: [reply.id, post.id],
                          })
                        }>
                        <Text style={styles.report}>Report reply</Text>
                      </Pressable>
                      {reply.authorUserId !== currentUser.id ? (
                        <Pressable
                          onPress={() =>
                            router.push(
                              `/visitor-profile?id=${encodeURIComponent(reply.authorUserId)}` as never,
                            )
                          }>
                          <Text style={styles.actionText}>Profile</Text>
                        </Pressable>
                      ) : null}
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>

          {joined ? (
            <View style={[styles.composer, { marginBottom: tabInset }]}>
              <TextInput
                value={replyDraft}
                onChangeText={setReplyDraft}
                placeholder={CommunityExperienceCopy.perspectivePlaceholder}
                placeholderTextColor="rgba(248,244,236,0.4)"
                style={styles.input}
                multiline
              />
              <Pressable onPress={handleReply} style={styles.send}>
                <Text style={styles.sendText}>{CommunityExperienceCopy.send}</Text>
              </Pressable>
            </View>
          ) : null}
        </KeyboardAvoidingView>
      </SafeAreaView>
      {reportInput ? (
        <ModerationReportSheet
          visible
          onClose={() => setReportInput(null)}
          title={reportInput.targetType === 'reply' ? 'Report reply' : 'Report post'}
          reportInput={reportInput}
          onSubmit={submitModerationReport}
          followUp={{
            showBlock: Boolean(reportInput.targetOwnerUserId),
            showLimit: Boolean(reportInput.targetOwnerUserId),
            onBlock: reportInput.targetOwnerUserId
              ? () => blockUser(reportInput.targetOwnerUserId!)
              : undefined,
            onLimit: reportInput.targetOwnerUserId
              ? () => limitUser(reportInput.targetOwnerUserId!)
              : undefined,
          }}
        />
      ) : null}
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#05070A' },
  flex: { flex: 1 },
  safe: { flex: 1 },
  back: { minHeight: 44, justifyContent: 'center', paddingHorizontal: Spacing.lg },
  backText: { fontFamily: Fonts.sans, fontSize: 15, fontWeight: '600', color: '#E8C872' },
  heroPerson: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: Spacing.lg,
    marginTop: 8,
  },
  avatarStar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(232, 200, 114, 0.2)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(248,244,236,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: { fontFamily: Fonts.sans, fontSize: 16, fontWeight: '700', color: '#FFF8F0' },
  author: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF8F0',
  },
  body: {
    fontFamily: Fonts.sans,
    fontSize: 18,
    lineHeight: 25,
    color: '#FFF8F0',
    paddingHorizontal: Spacing.lg,
    marginTop: 14,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginTop: 14,
  },
  actionText: { fontFamily: Fonts.sans, fontSize: 12, fontWeight: '600', color: '#E8C872' },
  actionMuted: { color: 'rgba(248,244,236,0.45)' },
  supportNote: { fontFamily: Fonts.sans, fontSize: 11, color: 'rgba(248,244,236,0.45)' },
  report: { fontFamily: Fonts.sans, fontSize: 11, color: 'rgba(248,244,236,0.45)' },
  repliesTitle: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(248,244,236,0.5)',
    marginTop: 28,
    paddingHorizontal: Spacing.lg,
    letterSpacing: 0.3,
  },
  emptyReplies: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: 'rgba(248,244,236,0.55)',
    paddingHorizontal: Spacing.lg,
    marginTop: 8,
  },
  replyBlock: {
    marginTop: 16,
    marginHorizontal: Spacing.lg,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(196, 168, 255, 0.35)',
  },
  replyAuthor: { fontFamily: Fonts.sans, fontSize: 13, fontWeight: '700', color: 'rgba(248,244,236,0.75)' },
  replyBody: { fontFamily: Fonts.sans, fontSize: 15, lineHeight: 21, color: '#FFF8F0', marginTop: 4 },
  replyActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 8 },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: Spacing.lg,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(232,200,114,0.2)',
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    fontFamily: Fonts.sans,
    fontSize: 15,
    color: '#FFF8F0',
  },
  send: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 12 },
  sendText: { fontFamily: Fonts.sans, fontSize: 14, fontWeight: '700', color: '#E8C872' },
  unavailable: { textAlign: 'center', marginTop: 80, color: '#FFF8F0' },
});
