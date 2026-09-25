import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  BackHandler,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { SymbolView } from 'expo-symbols';

import { ReelYouControlChip, ReelYouIcons } from '@/components/legacy/ReelYouControlChip';
import { LegacyCopy } from '@/constants/legacyCopy';
import { Fonts, Spacing } from '@/constants/theme';
import { currentUser } from '@/data/mockData';
import { useLegacy } from '@/legacy/LegacyProvider';
import { filterReelMomentIdsForViewer } from '@/legacy/legacyViewerAccess';
import { leaveReelYouRoute } from '@/legacy/reelYouLeaveNavigation';
import { useReelyouConnect } from '@/connect/ReelyouConnectProvider';
import { useReelYouPlaybackEngine } from '@/legacy/useReelYouPlaybackEngine';
import { useOverlayAudioPreviewScope } from '@/skywrite/media/useOverlayAudioPreviewScope';
import { useThemedStyles } from '@/theme/useTheme';

function formatSceneDate(ms: number): string {
  try {
    return new Date(ms).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  } catch {
    return '';
  }
}

export function ReelYouPlaybackScreen() {
  const router = useRouter();
  const { visitorOwnerId } = useLocalSearchParams<{ visitorOwnerId?: string }>();
  const insets = useSafeAreaInsets();
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const { skyFollowGraph, messages } = useReelyouConnect();
  const {
    reelSequence,
    moments,
    momentById,
    markReelReviewed,
    editMomentCopy,
    hideMomentFromReel,
    setMomentPrivacy,
  } = useLegacy();
  const visitorSubjectId =
    typeof visitorOwnerId === 'string' && visitorOwnerId.length > 0 ? visitorOwnerId : undefined;
  const isVisitorPlayback = Boolean(visitorSubjectId);
  const { stopAll, togglePreview, isPreviewPlaying } = useOverlayAudioPreviewScope(true);
  const [reviewOpen, setReviewOpen] = useState(false);
  const exitingRef = useRef(false);

  const sceneIds = useMemo(() => {
    if (!isVisitorPlayback || !visitorSubjectId) {
      return [...reelSequence.momentIds];
    }
    const ctx = {
      subjectUserId: visitorSubjectId,
      viewerUserId: currentUser.id,
      followGraph: skyFollowGraph,
      blockedUserIds: messages.blockedUserIds,
    };
    return filterReelMomentIdsForViewer(reelSequence.momentIds, moments, ctx);
  }, [
    isVisitorPlayback,
    messages.blockedUserIds,
    moments,
    reelSequence.momentIds,
    skyFollowGraph,
    visitorSubjectId,
  ]);

  const momentForIndex = useCallback(
    (sceneIndex: number) => {
      const id = sceneIds[sceneIndex];
      return id ? momentById(id) : undefined;
    },
    [momentById, sceneIds],
  );

  const {
    index: sceneIndex,
    playing,
    completed,
    sceneProgress,
    togglePlay,
    goNext,
    goPrevious,
    replay,
    cleanup,
    pause,
  } = useReelYouPlaybackEngine(sceneIds, momentForIndex);

  const currentId = sceneIds[sceneIndex];
  const moment = currentId ? momentById(currentId) : undefined;

  const photoHeight = Math.min(Math.round(windowHeight * 0.42), 340);

  const styles = useThemedStyles((tokens) =>
    StyleSheet.create({
      root: {
        flex: 1,
        width: windowWidth,
        height: windowHeight,
        backgroundColor: '#12182A',
      },
      safe: { flex: 1 },
      mainColumn: { flex: 1, minHeight: 0 },
      sceneScroll: { flex: 1, minHeight: 0 },
      sceneScrollContent: {
        flexGrow: 1,
        justifyContent: 'flex-end',
        paddingHorizontal: Spacing.lg,
        paddingTop: insets.top + 52,
        paddingBottom: Spacing.sm,
      },
      sceneInner: {
        paddingVertical: Spacing.sm,
      },
      date: {
        fontFamily: Fonts.sans,
        fontSize: 13,
        fontWeight: '600',
        color: tokens.gold,
        letterSpacing: 0.5,
      },
      title: {
        fontFamily: Fonts.serif,
        fontSize: 28,
        lineHeight: 34,
        fontWeight: '600',
        color: '#F8F4FF',
        marginTop: 6,
      },
      body: {
        fontFamily: Fonts.sans,
        fontSize: 16,
        lineHeight: 24,
        color: 'rgba(248, 244, 255, 0.88)',
        marginTop: 8,
      },
      photo: {
        width: '100%',
        borderRadius: 14,
        marginTop: Spacing.md,
        backgroundColor: 'rgba(255,255,255,0.08)',
      },
      audioBtn: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 999,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(212, 175, 55, 0.55)',
        backgroundColor: 'rgba(212, 175, 55, 0.12)',
        marginTop: Spacing.sm,
      },
      audioText: { fontFamily: Fonts.sans, fontSize: 13, fontWeight: '600', color: tokens.gold },
      footer: {
        flexShrink: 0,
        zIndex: 20,
        elevation: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(212, 175, 55, 0.28)',
        backgroundColor: 'rgba(22, 26, 40, 0.97)',
        paddingTop: Spacing.md,
        gap: Spacing.sm,
        shadowColor: '#000',
        shadowOpacity: 0.35,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: -4 },
      },
      progressWrap: { paddingHorizontal: Spacing.lg, gap: 8 },
      progressTrack: {
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(255,255,255,0.18)',
        overflow: 'hidden',
      },
      progressFill: { height: '100%', backgroundColor: tokens.gold },
      sceneDots: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6 },
      dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.35)' },
      dotActive: { backgroundColor: tokens.gold, width: 18 },
      playbackRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-end',
        gap: 8,
        paddingHorizontal: Spacing.xs,
      },
      replayRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingHorizontal: Spacing.sm,
      },
      reviewButton: {
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        minHeight: 44,
        paddingHorizontal: Spacing.lg,
        paddingVertical: 10,
        borderRadius: 999,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(167, 139, 250, 0.45)',
        backgroundColor: 'rgba(167, 139, 250, 0.12)',
      },
      reviewButtonText: {
        fontFamily: Fonts.sans,
        fontSize: 13,
        fontWeight: '600',
        color: '#E8DEFF',
      },
      reviewPanel: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.xs,
        gap: 10,
      },
      reviewRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
      reviewAction: {
        minHeight: 40,
        justifyContent: 'center',
        paddingHorizontal: 8,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(212, 175, 55, 0.35)',
      },
      reviewActionText: {
        fontFamily: Fonts.sans,
        fontSize: 12,
        fontWeight: '600',
        color: 'rgba(248, 244, 255, 0.85)',
      },
      topChrome: {
        position: 'absolute',
        left: 0,
        right: 0,
        zIndex: 30,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
      },
      back: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        minHeight: 44,
        paddingRight: 12,
        borderRadius: 999,
        backgroundColor: 'rgba(0, 0, 0, 0.25)',
        paddingLeft: 8,
      },
      backText: { fontFamily: Fonts.sans, fontSize: 14, fontWeight: '600', color: tokens.gold },
      close: {
        minHeight: 44,
        paddingHorizontal: 12,
        justifyContent: 'center',
        borderRadius: 999,
        backgroundColor: 'rgba(0, 0, 0, 0.25)',
      },
      closeText: { fontFamily: Fonts.sans, fontSize: 14, fontWeight: '600', color: tokens.gold },
      completedHint: {
        fontFamily: Fonts.sans,
        fontSize: 12,
        color: 'rgba(248, 244, 255, 0.72)',
        textAlign: 'center',
        paddingHorizontal: Spacing.lg,
      },
      reviewNote: {
        fontFamily: Fonts.sans,
        fontSize: 11,
        color: 'rgba(248, 244, 255, 0.62)',
        textAlign: 'center',
        paddingHorizontal: Spacing.lg,
      },
    }),
  );

  const exitReelYou = useCallback(
    async (options: { markReviewed: boolean }) => {
      if (exitingRef.current) return;
      exitingRef.current = true;
      pause();
      cleanup();
      await stopAll();
      if (options.markReviewed && !isVisitorPlayback) {
        markReelReviewed();
      }
      leaveReelYouRoute(router);
    },
    [cleanup, isVisitorPlayback, markReelReviewed, pause, router, stopAll],
  );

  const handleBack = useCallback(() => {
    void exitReelYou({ markReviewed: false });
  }, [exitReelYou]);

  const handleClose = useCallback(() => {
    void exitReelYou({ markReviewed: !isVisitorPlayback });
  }, [exitReelYou, isVisitorPlayback]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      handleBack();
      return true;
    });
    return () => subscription.remove();
  }, [handleBack]);

  useEffect(() => {
    void stopAll();
  }, [currentId, stopAll]);

  useEffect(() => {
    return () => {
      cleanup();
      void stopAll();
    };
  }, [cleanup, stopAll]);

  const openReview = useCallback(() => {
    pause();
    setReviewOpen((value) => !value);
  }, [pause]);

  const promptEdit = useCallback(() => {
    if (!moment) return;
    pause();
    Alert.prompt(
      LegacyCopy.edit,
      'Update how this scene appears in your REEL-YOU.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: (value?: string) => {
            if (value?.trim()) editMomentCopy(moment.legacyMomentId, value.trim());
          },
        },
      ],
      'plain-text',
      moment.title,
    );
  }, [editMomentCopy, moment, pause]);

  const confirmHideFromReel = useCallback(() => {
    if (!moment) return;
    pause();
    Alert.alert(LegacyCopy.reelHideFromReel, LegacyCopy.reelHideConfirm, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: LegacyCopy.reelHideFromReel,
        onPress: () => hideMomentFromReel(moment.legacyMomentId),
      },
    ]);
  }, [hideMomentFromReel, moment, pause]);

  const togglePrivacy = useCallback(() => {
    if (!moment) return;
    pause();
    const next = moment.privacy === 'private' ? 'public' : 'private';
    setMomentPrivacy(moment.legacyMomentId, next);
  }, [moment, pause, setMomentPrivacy]);

  const photoUri = useMemo(() => {
    if (!moment?.mediaRefs || moment.sourceContentDeleted) return null;
    return moment.mediaRefs.photoUri ?? null;
  }, [moment]);

  const audioUri = moment?.mediaRefs?.audioUri;
  const audioPreviewId = moment ? `reel-${moment.legacyMomentId}` : '';

  const accent = '#D4AF37';
  const textBright = '#F8F4FF';
  const textMuted = 'rgba(248, 244, 255, 0.45)';

  if (!moment || sceneIds.length === 0) {
    return (
      <View style={styles.root}>
        <StatusBar style="light" />
        <LinearGradient
          colors={['#1A2240', '#252B45', '#1E2438']}
          style={StyleSheet.absoluteFill}
        />
        <SafeAreaView style={styles.safe}>
          <View style={[styles.topChrome, { top: insets.top + Spacing.xs }]}>
            <Pressable
              onPress={handleBack}
              style={styles.back}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={LegacyCopy.back}>
              <SymbolView
                name={{ ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' }}
                size={18}
                tintColor="#D4AF37"
                weight="semibold"
                accessibilityElementsHidden
                importantForAccessibility="no"
              />
              <Text style={styles.backText}>{LegacyCopy.back}</Text>
            </Pressable>
            <Pressable
              onPress={handleClose}
              style={styles.close}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={LegacyCopy.reelClose}>
              <Text style={styles.closeText}>{LegacyCopy.reelClose}</Text>
            </Pressable>
          </View>
          <View style={[styles.sceneScrollContent, { justifyContent: 'center' }]}>
            <Text style={styles.body}>{LegacyCopy.reelEmpty}</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const footerBottomPad = Math.max(insets.bottom, Spacing.md);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#222A48', '#2D3458', '#1A2036']}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['rgba(255,255,255,0.08)', 'transparent', 'rgba(0,0,0,0.15)']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <SafeAreaView style={styles.safe} edges={['left', 'right']}>
        <View style={[styles.topChrome, { top: insets.top + Spacing.xs }]}>
          <Pressable
            onPress={handleBack}
            style={styles.back}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={LegacyCopy.back}>
            <SymbolView
              name={{ ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' }}
              size={18}
              tintColor="#D4AF37"
              weight="semibold"
              accessibilityElementsHidden
              importantForAccessibility="no"
            />
            <Text style={styles.backText}>{LegacyCopy.back}</Text>
          </Pressable>
          <Pressable
            onPress={handleClose}
            style={styles.close}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={LegacyCopy.reelClose}>
            <Text style={styles.closeText}>{LegacyCopy.reelClose}</Text>
          </Pressable>
        </View>

        <View style={styles.mainColumn}>
          <ScrollView
            style={styles.sceneScroll}
            contentContainerStyle={styles.sceneScrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
            keyboardShouldPersistTaps="handled">
            <Animated.View
              key={moment.legacyMomentId}
              entering={FadeIn.duration(480)}
              exiting={FadeOut.duration(320)}
              style={styles.sceneInner}>
              <Text style={styles.date}>{formatSceneDate(moment.occurredAt)}</Text>
              <Text style={styles.title} numberOfLines={4}>
                {moment.title}
              </Text>
              <Text style={styles.body} numberOfLines={6}>
                {moment.shortSummary}
              </Text>
              {photoUri ? (
                <Image
                  source={{ uri: photoUri }}
                  style={[styles.photo, { height: photoHeight }]}
                  contentFit="cover"
                />
              ) : null}
              {audioUri ? (
                <Pressable
                  style={styles.audioBtn}
                  onPress={() => void togglePreview(audioPreviewId, audioUri)}>
                  <Text style={styles.audioText}>
                    {isPreviewPlaying(audioPreviewId) ? 'Pause audio' : 'Play audio'}
                  </Text>
                </Pressable>
              ) : null}
            </Animated.View>
          </ScrollView>

          <View style={[styles.footer, { paddingBottom: footerBottomPad }]}>
            <View style={styles.progressWrap}>
              <View style={styles.progressTrack}>
                <View
                  style={[styles.progressFill, { width: `${Math.round(sceneProgress * 100)}%` }]}
                />
              </View>
              <View style={styles.sceneDots}>
                {sceneIds.map((id, dotIndex) => (
                  <View key={id} style={[styles.dot, dotIndex === sceneIndex && styles.dotActive]} />
                ))}
              </View>
              {completed ? <Text style={styles.completedHint}>{LegacyCopy.reelCompleteHint}</Text> : null}
            </View>

            <View style={styles.playbackRow}>
              <ReelYouControlChip
                icon={ReelYouIcons.previous}
                label={LegacyCopy.reelPrevious}
                onPress={goPrevious}
                disabled={sceneIndex === 0}
                accentColor={accent}
                textColor={textBright}
                mutedTextColor={textMuted}
              />
              <ReelYouControlChip
                icon={playing ? ReelYouIcons.pause : ReelYouIcons.play}
                label={playing ? LegacyCopy.reelPause : LegacyCopy.reelPlay}
                onPress={togglePlay}
                primary
                accentColor={accent}
                textColor={textBright}
                mutedTextColor={textMuted}
              />
              <ReelYouControlChip
                icon={ReelYouIcons.next}
                label={LegacyCopy.reelNext}
                onPress={goNext}
                disabled={sceneIndex >= sceneIds.length - 1}
                accentColor={accent}
                textColor={textBright}
                mutedTextColor={textMuted}
              />
            </View>

            {completed ? (
              <View style={styles.replayRow}>
                <ReelYouControlChip
                  icon={ReelYouIcons.replay}
                  label={LegacyCopy.reelReplay}
                  onPress={replay}
                  accentColor={accent}
                  textColor={textBright}
                  mutedTextColor={textMuted}
                />
              </View>
            ) : null}

            {!isVisitorPlayback ? (
              <Pressable style={styles.reviewButton} onPress={openReview} hitSlop={8} accessibilityRole="button">
                <SymbolView
                  name={ReelYouIcons.review}
                  size={18}
                  tintColor="#C4B5FD"
                  weight="semibold"
                  accessibilityElementsHidden
                  importantForAccessibility="no"
                />
                <Text style={styles.reviewButtonText}>
                  {reviewOpen ? LegacyCopy.reelReviewClose : LegacyCopy.reelReviewOpen}
                </Text>
              </Pressable>
            ) : null}

            {!isVisitorPlayback && reviewOpen ? (
              <View style={styles.reviewPanel}>
                <View style={styles.reviewRow}>
                  <Pressable style={styles.reviewAction} onPress={promptEdit}>
                    <Text style={styles.reviewActionText}>{LegacyCopy.reelEditScene}</Text>
                  </Pressable>
                  <Pressable style={styles.reviewAction} onPress={confirmHideFromReel}>
                    <Text style={styles.reviewActionText}>{LegacyCopy.reelHideFromReel}</Text>
                  </Pressable>
                  <Pressable style={styles.reviewAction} onPress={togglePrivacy}>
                    <Text style={styles.reviewActionText}>
                      {moment.privacy === 'private' ? LegacyCopy.reelMarkPublic : LegacyCopy.reelKeepPrivate}
                    </Text>
                  </Pressable>
                </View>
                <Text style={styles.reviewNote}>{LegacyCopy.reelReviewNote}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
