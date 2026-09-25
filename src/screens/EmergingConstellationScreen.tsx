import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomNav } from '@/components/BottomNav';
import { ConstellationPeoplePreview } from '@/components/emergingConstellations/ConstellationPeoplePreview';
import { ModerationReportSheet } from '@/components/safety/ModerationReportSheet';
import { currentUser } from '@/data/mockData';
import { useReelyouConnect } from '@/connect/ReelyouConnectProvider';
import {
  CommunityExperienceCopy,
  constellationHeroTagline,
  formatPeopleHereLine,
} from '@/constants/communityExperienceCopy';
import {
  CAREER_TRANSITION_MEMBER_FIXTURES,
  memberDisplayName,
} from '@/emergingConstellations/communitySocialFixtures';
import {
  finiteActivitySlice,
  visiblePostsForViewer,
  visibleRepliesForPost,
} from '@/emergingConstellations/communitySocialLogic';
import type { CommunityPost } from '@/emergingConstellations/emergingConstellationTypes';
import { useEmergingConstellations } from '@/emergingConstellations/EmergingConstellationsProvider';
import { EmotionAiCopy } from '@/constants/emotionAiCopy';
import { Fonts, Spacing, TabBarHeight } from '@/constants/theme';

const FINITE_MOMENTS_LIMIT = 5;

type ComposeIntent = 'ask' | 'share' | 'encourage';

export function EmergingConstellationScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const insets = useSafeAreaInsets();
  const tabInset = TabBarHeight + Math.max(insets.bottom, 8);
  const { messages, submitModerationReport } = useReelyouConnect();
  const blockedUserIds = messages.blockedUserIds;
  const {
    resolveConstellation,
    membershipFor,
    leaveConstellation,
    muteConstellation,
    postsByCommunity,
    repliesByPost,
    createPost,
  } = useEmergingConstellations();

  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeIntent, setComposeIntent] = useState<ComposeIntent>('share');
  const [draft, setDraft] = useState('');
  const [showAllActivity, setShowAllActivity] = useState(false);

  const constellation = useMemo(() => resolveConstellation(id ?? null), [id, resolveConstellation]);
  const membership = constellation ? membershipFor(constellation.id) : undefined;
  const joined = membership?.status === 'joined';

  const activity = useMemo(() => {
    if (!constellation) return { items: [], hasMore: false };
    const visible = visiblePostsForViewer(
      postsByCommunity[constellation.id] ?? [],
      blockedUserIds,
    );
    if (showAllActivity) return { items: visible, hasMore: false };
    return finiteActivitySlice(visible, FINITE_MOMENTS_LIMIT);
  }, [blockedUserIds, constellation, postsByCommunity, showAllActivity]);

  const peoplePreview = useMemo(() => {
    const names = CAREER_TRANSITION_MEMBER_FIXTURES.filter(
      (entry) => !blockedUserIds.includes(entry.userId),
    )
      .slice(0, 5)
      .map((entry) => entry.displayName.split(' ')[0]);
    return {
      names,
      line: formatPeopleHereLine(names.slice(0, 3)),
    };
  }, [blockedUserIds]);

  const heroTagline = useMemo(
    () => (constellation ? constellationHeroTagline(constellation) : ''),
    [constellation],
  );

  const openCompose = useCallback((intent: ComposeIntent) => {
    setComposeIntent(intent);
    setComposeOpen(true);
  }, []);

  const composePlaceholder = useMemo(() => {
    switch (composeIntent) {
      case 'ask':
        return CommunityExperienceCopy.composeAskPlaceholder;
      case 'encourage':
        return CommunityExperienceCopy.composeEncouragePlaceholder;
      default:
        return CommunityExperienceCopy.composeSharePlaceholder;
    }
  }, [composeIntent]);

  const postKindForIntent = useCallback((intent: ComposeIntent): CommunityPost['kind'] => {
    switch (intent) {
      case 'ask':
        return 'support_request';
      case 'encourage':
        return 'encouragement';
      default:
        return 'reflection';
    }
  }, []);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/home' as never);
  }, [router]);

  const handleLeave = useCallback(() => {
    if (!constellation) return;
    Alert.alert('Leave community?', 'You can rejoin later. Your past posts remain in the community history.', [
      { text: 'Stay', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: () => {
          leaveConstellation(constellation.id);
          handleBack();
        },
      },
    ]);
  }, [constellation, handleBack, leaveConstellation]);

  const handleSubmitPost = useCallback(() => {
    if (!constellation || !joined) return;
    const postId = createPost(constellation.id, draft, postKindForIntent(composeIntent));
    if (postId) {
      setDraft('');
      setComposeOpen(false);
    }
  }, [composeIntent, constellation, createPost, draft, joined, postKindForIntent]);

  const perspectiveCountForPost = useCallback(
    (postId: string) => {
      if (!constellation) return 0;
      const post = (postsByCommunity[constellation.id] ?? []).find((entry) => entry.id === postId);
      if (!post) return 0;
      return visibleRepliesForPost(repliesByPost[postId] ?? [], postId, blockedUserIds).length;
    },
    [blockedUserIds, constellation, postsByCommunity, repliesByPost],
  );

  if (!constellation) {
    return (
      <View style={styles.root}>
        <Text style={styles.unavailable}>This community is not available right now.</Text>
        <BottomNav />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#12182A', '#1A2240', '#141A2E']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: tabInset }]}>
          <View style={styles.topRow}>
            <Pressable onPress={handleBack} style={styles.back}>
              <Text style={styles.backText}>← Back</Text>
            </Pressable>
            <Pressable onPress={() => setMenuOpen(true)} accessibilityLabel="Community menu">
              <Text style={styles.menu}>⋯</Text>
            </Pressable>
          </View>

          <Text style={styles.title}>{constellation.name}</Text>
          <Text style={styles.heroTagline}>{heroTagline}</Text>

          <ConstellationPeoplePreview names={peoplePreview.names} peopleLine={peoplePreview.line} />

          <View style={styles.joinRow}>
            {joined ? (
              <Text style={styles.joinedText}>{CommunityExperienceCopy.joined}</Text>
            ) : (
              <Pressable
                style={styles.joinBtn}
                onPress={() =>
                  router.push(
                    `/emerging-constellation/preview?id=${encodeURIComponent(constellation.id)}` as never,
                  )
                }>
                <Text style={styles.joinBtnText}>{CommunityExperienceCopy.explore}</Text>
              </Pressable>
            )}
          </View>

          {joined ? (
            <>
              <View style={styles.entryActions}>
                <Pressable style={styles.entryChip} onPress={() => openCompose('ask')}>
                  <Text style={styles.entryChipText}>{CommunityExperienceCopy.askPerspective}</Text>
                </Pressable>
                <Pressable style={styles.entryChip} onPress={() => openCompose('share')}>
                  <Text style={styles.entryChipText}>{CommunityExperienceCopy.shareSomething}</Text>
                </Pressable>
                <Pressable style={styles.entryChip} onPress={() => openCompose('encourage')}>
                  <Text style={styles.entryChipText}>{CommunityExperienceCopy.encourageSomeone}</Text>
                </Pressable>
              </View>

              <View style={styles.sectionRow}>
                <Text style={styles.sectionAround}>{CommunityExperienceCopy.aroundHere}</Text>
                <Pressable
                  onPress={() =>
                    router.push(
                      `/emerging-constellation/members?id=${encodeURIComponent(constellation.id)}` as never,
                    )
                  }>
                  <Text style={styles.linkInline}>People</Text>
                </Pressable>
              </View>

              {activity.items.length === 0 ? (
                <Text style={styles.bodyMuted}>{EmotionAiCopy.communityQuietEmpty}</Text>
              ) : (
                activity.items.map((post) => {
                  const authorName =
                    post.authorUserId === currentUser.id
                      ? 'You'
                      : memberDisplayName(post.authorUserId);
                  const perspectives = perspectiveCountForPost(post.id);
                  return (
                    <Pressable
                      key={post.id}
                      style={styles.momentRow}
                      onPress={() =>
                        router.push(
                          `/emerging-constellation/post?id=${encodeURIComponent(constellation.id)}&postId=${encodeURIComponent(post.id)}` as never,
                        )
                      }>
                      <Text style={styles.momentAuthor}>
                        {authorName}
                        {authorName !== 'You' ? ' ✨' : ''}
                      </Text>
                      <Text style={styles.momentBody} numberOfLines={3}>
                        “{post.content}”
                      </Text>
                      <Text style={styles.momentMeta}>
                        {perspectives > 0
                          ? `💬 ${CommunityExperienceCopy.perspectives(perspectives)} · ${CommunityExperienceCopy.joinIn}`
                          : CommunityExperienceCopy.joinIn}
                      </Text>
                    </Pressable>
                  );
                })
              )}

              {activity.hasMore ? (
                <Pressable onPress={() => setShowAllActivity(true)} style={styles.seeMore}>
                  <Text style={styles.linkInline}>{CommunityExperienceCopy.exploreMore}</Text>
                </Pressable>
              ) : activity.items.length > 0 ? (
                <Text style={styles.caughtUp}>{CommunityExperienceCopy.caughtUp}</Text>
              ) : null}
            </>
          ) : (
            <Text style={styles.bodyMuted}>Explore when it feels right.</Text>
          )}
        </ScrollView>
      </SafeAreaView>

      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setMenuOpen(false)} />
        <View style={styles.menuSheet}>
          {joined ? (
            <>
              <Pressable
                onPress={() => {
                  muteConstellation(constellation.id, !membership?.notificationsMuted);
                  setMenuOpen(false);
                }}>
                <Text style={styles.menuItem}>
                  {membership?.notificationsMuted ? 'Unmute community signals' : 'Mute community signals'}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setMenuOpen(false);
                  setReportOpen(true);
                }}>
                <Text style={styles.menuItem}>Report community</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setMenuOpen(false);
                  handleLeave();
                }}>
                <Text style={styles.menuItemDanger}>Leave community</Text>
              </Pressable>
            </>
          ) : (
            <Pressable
              onPress={() => {
                setMenuOpen(false);
                setReportOpen(true);
              }}>
              <Text style={styles.menuItem}>Report community</Text>
            </Pressable>
          )}
        </View>
      </Modal>

      <ModerationReportSheet
        visible={reportOpen}
        onClose={() => setReportOpen(false)}
        title="Report community"
        reportInput={{
          targetType: 'community',
          targetId: constellation.id,
          communityId: constellation.id,
          visibilityContext: 'community',
          provenanceIds: [constellation.id],
        }}
        onSubmit={submitModerationReport}
        followUp={{
          showLeaveCommunity: joined,
          onLeaveCommunity: () => leaveConstellation(constellation.id),
        }}
      />

      <Modal visible={composeOpen} transparent animationType="slide" onRequestClose={() => setComposeOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setComposeOpen(false)} />
        <View style={[styles.composeSheet, { paddingBottom: tabInset }]}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={composePlaceholder}
            placeholderTextColor="rgba(248,244,236,0.4)"
            style={styles.composeInput}
            multiline
            autoFocus
          />
          <Pressable style={styles.composeSubmit} onPress={handleSubmitPost}>
            <Text style={styles.composeSubmitText}>{CommunityExperienceCopy.shareSomething}</Text>
          </Pressable>
        </View>
      </Modal>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#05070A' },
  safe: { flex: 1 },
  scroll: { paddingHorizontal: Spacing.lg },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  back: { minHeight: 44, justifyContent: 'center' },
  backText: { fontFamily: Fonts.sans, fontSize: 15, fontWeight: '600', color: '#E8C872' },
  menu: { fontSize: 22, color: '#E8C872', paddingHorizontal: 8, minHeight: 44, lineHeight: 44 },
  title: { fontFamily: Fonts.serif, fontSize: 28, color: '#FFF8F0', marginTop: 4 },
  heroTagline: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    lineHeight: 21,
    color: 'rgba(248,244,236,0.78)',
    marginTop: 6,
  },
  joinRow: { marginTop: 4, marginBottom: 4 },
  joinBtn: {
    alignSelf: 'flex-start',
    minHeight: 40,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: 'rgba(232, 200, 114, 0.22)',
    justifyContent: 'center',
  },
  joinBtnText: { fontFamily: Fonts.sans, fontSize: 13, fontWeight: '700', color: '#F5E6B8' },
  joinedText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(196, 168, 255, 0.9)',
  },
  entryActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
    marginBottom: 8,
  },
  entryChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(232, 200, 114, 0.12)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232,200,114,0.22)',
  },
  entryChipText: { fontFamily: Fonts.sans, fontSize: 12, fontWeight: '600', color: '#F5E6B8' },
  sectionAround: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: 'rgba(248,244,236,0.55)',
  },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 },
  bodyMuted: { fontFamily: Fonts.sans, fontSize: 13, lineHeight: 19, color: 'rgba(248,244,236,0.62)', marginTop: 10 },
  momentRow: {
    marginTop: 18,
    paddingVertical: 4,
  },
  momentAuthor: { fontFamily: Fonts.sans, fontSize: 14, fontWeight: '700', color: '#FFF8F0' },
  momentBody: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    lineHeight: 21,
    color: 'rgba(248,244,236,0.88)',
    marginTop: 6,
  },
  momentMeta: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(232, 200, 114, 0.75)',
    marginTop: 8,
  },
  seeMore: { marginTop: 12, alignItems: 'center' },
  caughtUp: {
    textAlign: 'center',
    marginTop: 16,
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: 'rgba(248,244,236,0.45)',
  },
  linkInline: { fontFamily: Fonts.sans, fontSize: 12, fontWeight: '600', color: '#C4B5FD' },
  unavailable: { textAlign: 'center', marginTop: 80, color: '#FFF8F0', paddingHorizontal: 24 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' },
  menuSheet: {
    position: 'absolute',
    right: 16,
    top: 100,
    backgroundColor: '#1A2240',
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 220,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232,200,114,0.2)',
  },
  menuItem: { fontFamily: Fonts.sans, fontSize: 14, color: '#FFF8F0', paddingVertical: 12, paddingHorizontal: 16 },
  menuItemDanger: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: 'rgba(248,120,120,0.9)',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  composeSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#141A2E',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: Spacing.lg,
  },
  composeInput: {
    minHeight: 100,
    fontFamily: Fonts.sans,
    fontSize: 15,
    color: '#FFF8F0',
    textAlignVertical: 'top',
  },
  composeSubmit: {
    marginTop: 12,
    minHeight: 44,
    borderRadius: 999,
    backgroundColor: 'rgba(232, 200, 114, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  composeSubmitText: { fontFamily: Fonts.sans, fontSize: 15, fontWeight: '700', color: '#F5E6B8' },
});
