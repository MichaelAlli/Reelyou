import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HomeBackdrop } from '@/components/home/HomeBackdrop';
import { ModerationReportSheet } from '@/components/safety/ModerationReportSheet';
import { useReelyouConnect } from '@/connect/ReelyouConnectProvider';
import { MySkyCopy } from '@/constants/mySkyCopy';
import {
  SKYWRITE_VISIBILITY_OPTIONS,
  SkywriteCopy,
} from '@/constants/skywriteCopy';
import {
  getSkywriteTextStyleLabel,
  getSkywriteWriteInputStyle,
} from '@/constants/skywriteTextStyles';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { currentUser } from '@/data/mockData';
import { getSkyAreaCategory, isSkyAreaCategoryId } from '@/skyAreas/skyAreaCategory';
import { useOnboarding } from '@/onboarding';
import { resolveSkywriteViewerAccess } from '@/skywrite/access/resolveSkywriteViewerAccess';
import { beaconSignalIdForSkywrite } from '@/skywrite/beacon/skywriteBeaconEligibility';
import { resolveVisibilityOptionId } from '@/skywrite/skywriteVisibility';
import type { Privacy } from '@/types';
import { markReturnToSkyInvitationsAfterResponse } from '@/skywrite/invitations/skyInvitationFlow';
import { useSkywriteLibrary } from '@/skywrite/library/SkywriteLibraryProvider';
import { resolveSkywriteById } from '@/skywrite/resolveSkywriteById';
import { useSkywriteBeacon } from '@/skywrite/beacon/SkywriteBeaconProvider';
import { resolveSavedThreadSourceAccess } from '@/skywrite/savedThreads/savedThreadAccess';
import { useSavedThreads } from '@/skywrite/savedThreads/SavedThreadsProvider';
import { useSkywriteThreads } from '@/skywrite/threads/SkywriteThreadProvider';
import type { SubmitModerationReportInput } from '@/moderation/moderationTypes';
import { useTheme } from '@/theme/useTheme';
import type { ThemeTokens } from '@/theme/types';

/** Readable on HomeBackdrop — not tied to light app theme tokens. */
const CELESTIAL_INVITATION_TEXT = {
  primary: '#FFF8F0',
  secondary: 'rgba(248, 244, 236, 0.88)',
  tertiary: 'rgba(248, 244, 236, 0.76)',
  placeholder: 'rgba(248, 244, 236, 0.62)',
  gold: '#E8C872',
  goldBright: '#F5E6B8',
  inputBackground: 'rgba(6, 10, 28, 0.78)',
  inputBorder: 'rgba(232, 200, 114, 0.4)',
} as const;

function formatSkywriteDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

function createSkywriteDetailStyles(tokens: ThemeTokens, skyInvitationReply: boolean) {
  const primary = skyInvitationReply ? CELESTIAL_INVITATION_TEXT.primary : tokens.primaryText;
  const secondary = skyInvitationReply ? CELESTIAL_INVITATION_TEXT.secondary : tokens.secondaryText;
  const tertiary = skyInvitationReply ? CELESTIAL_INVITATION_TEXT.tertiary : tokens.mutedText;
  const gold = skyInvitationReply ? CELESTIAL_INVITATION_TEXT.gold : tokens.gold;
  const goldBright = skyInvitationReply ? CELESTIAL_INVITATION_TEXT.goldBright : tokens.goldLight;

  return StyleSheet.create({
    root: { flex: 1 },
    safe: { flex: 1 },
    scroll: {
      paddingHorizontal: Spacing.lg,
      paddingBottom: Spacing.xl,
    },
    back: {
      marginTop: Spacing.sm,
      marginBottom: Spacing.md,
      minHeight: 44,
      justifyContent: 'center',
    },
    backText: {
      fontFamily: Fonts.sans,
      fontSize: 15,
      color: skyInvitationReply ? CELESTIAL_INVITATION_TEXT.gold : tokens.gold,
      fontWeight: '600',
    },
    title: {
      fontFamily: Fonts.serif,
      fontSize: 24,
      fontWeight: '600',
      color: tokens.primaryText,
      marginBottom: 4,
    },
    meta: {
      fontFamily: Fonts.sans,
      fontSize: 12,
      color: tokens.mutedText,
      marginBottom: Spacing.md,
    },
    card: {
      borderRadius: Radius.lg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: 'rgba(232, 200, 114, 0.28)',
      backgroundColor: 'rgba(12, 10, 28, 0.55)',
      padding: Spacing.md,
      gap: Spacing.sm,
    },
    body: { color: tokens.primaryText },
    label: {
      fontFamily: Fonts.sans,
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
      color: gold,
    },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    chip: {
      borderRadius: Radius.full,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: 'rgba(167, 139, 250, 0.25)',
      paddingVertical: 4,
      paddingHorizontal: 10,
    },
    chipText: {
      fontFamily: Fonts.sans,
      fontSize: 11,
      color: tokens.secondaryText,
    },
    photo: {
      width: '100%',
      aspectRatio: 4 / 3,
      borderRadius: Radius.md,
      marginTop: Spacing.xs,
    },
    mediaNote: {
      fontFamily: Fonts.sans,
      fontSize: 13,
      color: secondary,
    },
    beaconBanner: {
      borderRadius: Radius.md,
      borderWidth: 1,
      borderColor: 'rgba(232, 200, 114, 0.35)',
      backgroundColor: 'rgba(232, 200, 114, 0.08)',
      padding: Spacing.sm,
      gap: 8,
      marginBottom: Spacing.md,
    },
    beaconCopy: {
      fontFamily: Fonts.sans,
      fontSize: 13,
      lineHeight: 19,
      color: tertiary,
      textAlign: 'center',
    },
    beaconActions: { flexDirection: 'row', gap: 10 },
    beaconBtn: {
      flex: 1,
      minHeight: 44,
      borderRadius: Radius.md,
      borderWidth: 1,
      borderColor: 'rgba(232, 200, 114, 0.55)',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 8,
    },
    beaconBtnPrimary: {
      backgroundColor: 'rgba(232, 200, 114, 0.28)',
    },
    beaconBtnText: {
      fontFamily: Fonts.sans,
      fontSize: 14,
      fontWeight: '700',
      color: goldBright,
    },
    responseCard: {
      borderRadius: Radius.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: 'rgba(167, 139, 250, 0.22)',
      padding: Spacing.sm,
      gap: 6,
      marginTop: 8,
    },
    responseBody: {
      fontFamily: Fonts.sans,
      fontSize: 14,
      lineHeight: 20,
      color: primary,
    },
    saveBtn: {
      alignSelf: 'flex-start',
      minHeight: 40,
      justifyContent: 'center',
      paddingHorizontal: 4,
    },
    saveBtnText: {
      fontFamily: Fonts.sans,
      fontSize: 12.5,
      fontWeight: '700',
      color: gold,
    },
    saveBtnTextSecondary: {
      fontFamily: Fonts.sans,
      fontSize: 12,
      fontWeight: '600',
      color: tertiary,
    },
    actionGroup: {
      marginTop: Spacing.sm,
      marginBottom: Spacing.md,
      padding: Spacing.sm,
      borderRadius: Radius.lg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: 'rgba(167, 139, 250, 0.22)',
      backgroundColor: 'rgba(8, 10, 28, 0.4)',
      gap: 4,
    },
    actionGroupLabel: {
      fontFamily: Fonts.sans,
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      color: tertiary,
      marginBottom: 4,
      paddingHorizontal: 4,
    },
    invitationContextLabel: {
      fontFamily: Fonts.sans,
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      color: gold,
      marginBottom: 8,
    },
    invitationEyebrow: {
      fontFamily: Fonts.sans,
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '600',
      color: secondary,
      marginBottom: 10,
    },
    invitationArea: {
      fontFamily: Fonts.serif,
      fontSize: 22,
      fontWeight: '600',
      color: primary,
      marginBottom: 8,
    },
    invitationQuestion: {
      fontFamily: Fonts.serif,
      fontSize: 26,
      lineHeight: 34,
      fontWeight: '600',
      color: primary,
      marginBottom: Spacing.md,
    },
    invitationQuote: {
      fontFamily: Fonts.sans,
      fontSize: 16,
      lineHeight: 23,
      color: primary,
      marginBottom: Spacing.md,
    },
    invitationAck: {
      fontFamily: Fonts.sans,
      fontSize: 16,
      fontWeight: '700',
      color: '#A7F3C8',
      textAlign: 'center',
      marginVertical: Spacing.lg,
    },
    composerHint: {
      fontFamily: Fonts.sans,
      fontSize: 14,
      lineHeight: 20,
      color: secondary,
      marginBottom: 6,
    },
    composerSheet: {
      marginTop: Spacing.sm,
      paddingTop: Spacing.sm,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: 'rgba(232, 200, 114, 0.35)',
    },
    input: {
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: skyInvitationReply
        ? CELESTIAL_INVITATION_TEXT.inputBorder
        : 'rgba(167, 139, 250, 0.28)',
      padding: Spacing.md,
      minHeight: 72,
      fontFamily: Fonts.sans,
      fontSize: 16,
      lineHeight: 22,
      color: primary,
      marginTop: 4,
      backgroundColor: skyInvitationReply
        ? CELESTIAL_INVITATION_TEXT.inputBackground
        : 'rgba(12, 10, 28, 0.35)',
    },
    submitBtn: {
      marginTop: 10,
      minHeight: 44,
      borderRadius: Radius.md,
      backgroundColor: 'rgba(232, 200, 114, 0.32)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    submitBtnDisabled: {
      backgroundColor: 'rgba(232, 200, 114, 0.12)',
      borderWidth: 1,
      borderColor: 'rgba(232, 200, 114, 0.25)',
    },
    submitBtnText: {
      fontFamily: Fonts.sans,
      fontSize: 15,
      fontWeight: '800',
      color: goldBright,
    },
    submitBtnTextDisabled: {
      color: 'rgba(245, 230, 184, 0.55)',
    },
    formError: {
      fontFamily: Fonts.sans,
      fontSize: 13,
      lineHeight: 18,
      color: '#FCA5A5',
      marginTop: 6,
    },
    emptyTitle: {
      fontFamily: Fonts.serif,
      fontSize: 20,
      color: tokens.primaryText,
      marginBottom: Spacing.sm,
    },
    emptyBody: {
      fontFamily: Fonts.sans,
      fontSize: 14,
      lineHeight: 20,
      color: tokens.secondaryText,
    },
  });
}

export function SkywriteDetailScreen() {
  const router = useRouter();
  const { id, source, returnTo, visitor } = useLocalSearchParams<{
    id?: string;
    source?: string;
    returnTo?: string;
    visitor?: string;
  }>();
  const visitorPlaybackOnly = visitor === '1';
  const { skywrites, updateSkywrite } = useOnboarding();
  const {
    dismissSignal,
    messages,
    skyFollowGraph,
    submitModerationReport,
    blockUser,
    limitUser,
  } = useReelyouConnect();
  const { saveThread, isThreadSaved, getSavedForSkywrite } = useSavedThreads();
  const {
    getResponses,
    addResponse,
    ignoreBeacon,
    saveResponseAsAuthor,
    unsaveResponseAsAuthor,
  } = useSkywriteThreads();
  const { getLifecycle, resolveAuthorBeacon, reactivateAuthorBeacon } = useSkywriteBeacon();
  const { lifecycle: contentLifecycle } = useSkywriteLibrary();

  const record = resolveSkywriteById(
    skywrites,
    typeof id === 'string' ? id : undefined,
    contentLifecycle,
  );
  const skywriteId = record?.id;
  const responses = useMemo(
    () => (skywriteId ? getResponses(skywriteId) : []),
    [getResponses, skywriteId],
  );

  const isAuthor = record?.authorId === currentUser.id;
  const canSaveThread = useMemo(() => {
    if (!record) return false;
    return (
      resolveSavedThreadSourceAccess({
        skywrite: { ...record, authorId: record.authorId ?? currentUser.id },
        blockedUserIds: messages.blockedUserIds,
        viewerId: currentUser.id,
      }) === 'available'
    );
  }, [messages.blockedUserIds, record]);
  const savedEntry = skywriteId ? getSavedForSkywrite(skywriteId) : undefined;
  const lifecycle = skywriteId ? getLifecycle(skywriteId) : undefined;
  const beaconResolved = lifecycle?.beaconStatus === 'resolved';
  const fromBeacon = source === 'beacon';
  const returnToInvitations = returnTo === 'invitations';
  const [responseDraft, setResponseDraft] = useState('');
  const [respondMode, setRespondMode] = useState(false);
  const [invitationWhyOpen, setInvitationWhyOpen] = useState(false);
  const [perspectiveSentAck, setPerspectiveSentAck] = useState(false);
  const [responseSendError, setResponseSendError] = useState<string | null>(null);
  const [visibilityPickerOpen, setVisibilityPickerOpen] = useState(false);
  const [reportInput, setReportInput] = useState<Omit<
    SubmitModerationReportInput,
    'reporterUserId' | 'reason' | 'optionalNote'
  > | null>(null);

  const viewerCanView = useMemo(() => {
    if (!record) return false;
    return resolveSkywriteViewerAccess({
      viewerId: currentUser.id,
      authorId: record.authorId ?? currentUser.id,
      visibility: record.visibility,
      followGraph: skyFollowGraph,
      blockedUserIds: messages.blockedUserIds,
    });
  }, [messages.blockedUserIds, record, skyFollowGraph]);

  const areaLabel = useMemo(() => {
    if (!record?.skyAreaId) return null;
    if (isSkyAreaCategoryId(record.skyAreaId)) {
      return getSkyAreaCategory(record.skyAreaId).label;
    }
    return record.skyAreaId;
  }, [record?.skyAreaId]);

  const skyInvitationReply = fromBeacon && !isAuthor && viewerCanView;
  const canSendResponse = responseDraft.trim().length > 0;
  const { tokens } = useTheme();

  const styles = useMemo(
    () => createSkywriteDetailStyles(tokens, skyInvitationReply),
    [tokens, skyInvitationReply],
  );

  const placeholderColor = skyInvitationReply
    ? CELESTIAL_INVITATION_TEXT.placeholder
    : 'rgba(235,228,248,0.55)';

  const handleIgnoreBeacon = useCallback(() => {
    if (!skywriteId) return;
    ignoreBeacon(skywriteId);
    dismissSignal(beaconSignalIdForSkywrite(skywriteId));
    router.back();
  }, [dismissSignal, ignoreBeacon, router, skywriteId]);

  const handleRespondTap = useCallback(() => {
    setRespondMode(true);
  }, []);

  const handleSaveThread = useCallback(() => {
    if (!record) return;
    const saved = saveThread({ ...record, authorId: record.authorId ?? currentUser.id });
    router.push(`/skywrite/saved/${saved.savedThreadId}` as never);
  }, [record, router, saveThread]);

  const handleOpenSavedThread = useCallback(() => {
    if (!savedEntry) return;
    router.push(`/skywrite/saved/${savedEntry.savedThreadId}` as never);
  }, [router, savedEntry]);

  const handleSubmitResponse = useCallback(() => {
    if (!skywriteId) return;
    const created = addResponse(skywriteId, responseDraft);
    if (!created) {
      setResponseSendError(SkywriteCopy.emptyValidation);
      return;
    }
    setResponseSendError(null);
    setResponseDraft('');
    setRespondMode(false);
    dismissSignal(beaconSignalIdForSkywrite(skywriteId));
    if (fromBeacon) {
      setPerspectiveSentAck(true);
      const navigateAway = () => {
        if (returnToInvitations) {
          markReturnToSkyInvitationsAfterResponse();
        }
        router.back();
      };
      setTimeout(navigateAway, 1400);
      return;
    }
  }, [addResponse, dismissSignal, fromBeacon, responseDraft, returnToInvitations, router, skywriteId]);

  const visibilityLabel =
    SKYWRITE_VISIBILITY_OPTIONS.find(
      (option) => option.id === resolveVisibilityOptionId(record?.visibility ?? 'public'),
    )?.title ?? record?.visibility;

  return (
    <View style={styles.root}>
      <HomeBackdrop />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={MySkyCopy.skywriteDetailBack}
            onPress={() => router.back()}
            style={styles.back}>
            <Text style={styles.backText}>{MySkyCopy.skywriteDetailBack}</Text>
          </Pressable>

          {record && !viewerCanView ? (
            <Text style={styles.backText}>This Skywrite isn&apos;t available to you.</Text>
          ) : null}

          {record && viewerCanView ? (
            <>
              {fromBeacon && !isAuthor ? (
                <>
                  {perspectiveSentAck ? (
                    <Text style={styles.invitationAck}>{SkywriteCopy.perspectiveSent}</Text>
                  ) : (
                    <>
                      {areaLabel ? (
                        <Text style={styles.invitationContextLabel}>{areaLabel}</Text>
                      ) : (
                        <Text style={styles.invitationEyebrow}>{SkywriteCopy.invitationEyebrow}</Text>
                      )}
                      <Text style={styles.invitationQuestion}>
                        {(record.text.trim() || SkywriteCopy.writePlaceholder).slice(0, 280)}
                        {record.text.trim().length > 280 ? '…' : ''}
                      </Text>
                      {!respondMode ? (
                        <View style={styles.beaconActions}>
                          <Pressable
                            style={[styles.beaconBtn, styles.beaconBtnPrimary]}
                            onPress={handleRespondTap}
                            accessibilityLabel={SkywriteCopy.respond}>
                            <Text style={styles.beaconBtnText}>{SkywriteCopy.respond}</Text>
                          </Pressable>
                          <Pressable
                            style={styles.beaconBtn}
                            onPress={handleIgnoreBeacon}
                            accessibilityLabel={SkywriteCopy.ignoreBeacon}>
                            <Text style={styles.beaconBtnText}>{SkywriteCopy.ignoreBeacon}</Text>
                          </Pressable>
                        </View>
                      ) : null}
                      <Pressable
                        onPress={() => setInvitationWhyOpen((open) => !open)}
                        style={{ alignItems: 'center', marginTop: Spacing.sm }}>
                        <Text style={styles.beaconCopy}>{SkywriteCopy.invitationWhyThis}</Text>
                      </Pressable>
                      {invitationWhyOpen ? (
                        <Text style={styles.beaconCopy}>{SkywriteCopy.invitationWhyBody}</Text>
                      ) : null}
                    </>
                  )}
                </>
              ) : (
                <>
                  <Text style={styles.title}>{MySkyCopy.skywriteDetailTitle}</Text>
                  <Text style={styles.meta}>
                    {formatSkywriteDate(record.createdAt)}
                    {visibilityLabel ? ` · ${visibilityLabel}` : ''}
                    {areaLabel ? ` · ${areaLabel}` : ''}
                  </Text>
                </>
              )}

              {!skyInvitationReply && !visitorPlaybackOnly ? (
                <View style={styles.actionGroup}>
                  <Text style={styles.actionGroupLabel}>
                    {isAuthor ? 'Your Skywrite' : 'Options'}
                  </Text>
                  {!isAuthor ? (
                    <Pressable
                      style={styles.saveBtn}
                      accessibilityRole="button"
                      accessibilityLabel="Report Skywrite"
                      onPress={() =>
                        setReportInput({
                          targetType: 'skywrite',
                          targetId: record.id,
                          targetOwnerUserId: record.authorId,
                          skywriteId: record.id,
                          visibilityContext: record.visibility,
                          provenanceIds: [record.id],
                        })
                      }>
                      <Text style={styles.saveBtnTextSecondary}>Report</Text>
                    </Pressable>
                  ) : null}

                  {canSaveThread ? (
                    <Pressable
                      style={styles.saveBtn}
                      onPress={
                        isThreadSaved(record.id) ? handleOpenSavedThread : handleSaveThread
                      }
                      accessibilityLabel={
                        isThreadSaved(record.id)
                          ? SkywriteCopy.openSavedThread
                          : SkywriteCopy.saveThread
                      }>
                      <Text style={styles.saveBtnText}>
                        {isThreadSaved(record.id)
                          ? SkywriteCopy.openSavedThread
                          : SkywriteCopy.saveThread}
                      </Text>
                    </Pressable>
                  ) : null}

                  {isAuthor ? (
                    <Pressable
                      style={styles.saveBtn}
                      onPress={() => setVisibilityPickerOpen((open) => !open)}
                      accessibilityLabel="Change visibility">
                      <Text style={styles.saveBtnText}>Change visibility</Text>
                    </Pressable>
                  ) : null}

                  {isAuthor && visibilityPickerOpen ? (
                    <View style={{ gap: 4 }}>
                      {SKYWRITE_VISIBILITY_OPTIONS.map((option) => (
                        <Pressable
                          key={option.id}
                          style={styles.saveBtn}
                          onPress={() => {
                            if (!skywriteId) return;
                            updateSkywrite(skywriteId, { visibility: option.id as Privacy });
                            setVisibilityPickerOpen(false);
                          }}>
                          <Text style={styles.saveBtnText}>
                            {option.title} — {option.subtitle}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  ) : null}

                  {isAuthor && record.visibility === 'public' ? (
                    <Pressable
                      style={styles.saveBtn}
                      onPress={() => {
                        if (!skywriteId) return;
                        if (beaconResolved) {
                          reactivateAuthorBeacon(skywriteId);
                          return;
                        }
                        resolveAuthorBeacon(skywriteId);
                      }}
                      accessibilityLabel={
                        beaconResolved
                          ? SkywriteCopy.authorBeaconReopen
                          : SkywriteCopy.authorBeaconResolved
                      }>
                      <Text style={styles.saveBtnText}>
                        {beaconResolved
                          ? SkywriteCopy.authorBeaconReopen
                          : SkywriteCopy.authorBeaconResolved}
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              ) : null}

              {skyInvitationReply && !isAuthor && !visitorPlaybackOnly ? (
                <View style={styles.actionGroup}>
                  <Text style={styles.actionGroupLabel}>Options</Text>
                  <Pressable
                    style={styles.saveBtn}
                    accessibilityRole="button"
                    accessibilityLabel="Report Skywrite"
                    onPress={() =>
                      setReportInput({
                        targetType: 'skywrite',
                        targetId: record.id,
                        targetOwnerUserId: record.authorId,
                        skywriteId: record.id,
                        visibilityContext: record.visibility,
                        provenanceIds: [record.id],
                      })
                    }>
                    <Text style={styles.saveBtnTextSecondary}>Report</Text>
                  </Pressable>
                  {canSaveThread ? (
                    <Pressable
                      style={styles.saveBtn}
                      onPress={
                        isThreadSaved(record.id) ? handleOpenSavedThread : handleSaveThread
                      }>
                      <Text style={styles.saveBtnTextSecondary}>
                        {isThreadSaved(record.id)
                          ? SkywriteCopy.openSavedThread
                          : SkywriteCopy.saveThread}
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              ) : null}

              {!(fromBeacon && !isAuthor) ? (
                <View style={styles.card}>
                  <Text style={styles.label}>{getSkywriteTextStyleLabel(record.textStyle)}</Text>
                  <Text style={[styles.body, getSkywriteWriteInputStyle(record.textStyle)]}>
                    {record.text.trim() || SkywriteCopy.writePlaceholder}
                  </Text>

                  {record.media.photo?.uri ? (
                    <Image
                      source={{ uri: record.media.photo.uri }}
                      style={styles.photo}
                      contentFit="cover"
                      accessibilityIgnoresInvertColors
                    />
                  ) : null}

                  {record.mediaMode === 'voice' || record.mediaMode === 'photo_voiceover' ? (
                    <Text style={styles.mediaNote}>{SkywriteCopy.voiceNoteTitle} included</Text>
                  ) : null}

                  {record.userHashtags.length > 0 ? (
                    <View style={styles.chipRow}>
                      {record.userHashtags.map((tag) => (
                        <View key={tag} style={styles.chip}>
                          <Text style={styles.chipText}>#{tag}</Text>
                        </View>
                      ))}
                    </View>
                  ) : null}
                </View>
              ) : (
                <>
                  {record.media.photo?.uri ? (
                    <Image
                      source={{ uri: record.media.photo.uri }}
                      style={styles.photo}
                      contentFit="cover"
                      accessibilityIgnoresInvertColors
                    />
                  ) : null}
                  {record.mediaMode === 'voice' || record.mediaMode === 'photo_voiceover' ? (
                    <Text style={styles.mediaNote}>{SkywriteCopy.voiceNoteTitle} included</Text>
                  ) : null}
                </>
              )}

              {responses.length > 0 ? (
                <View style={{ marginTop: Spacing.md }}>
                  <Text style={styles.label}>{SkywriteCopy.threadResponsesTitle}</Text>
                  {responses.map((response) => (
                    <View key={response.responseId} style={styles.responseCard}>
                      <Text style={styles.responseBody}>{response.body}</Text>
                      {isAuthor && response.responderId !== currentUser.id ? (
                        <>
                        <Pressable
                          style={styles.saveBtn}
                          accessibilityLabel="Report invitation response"
                          onPress={() =>
                            setReportInput({
                              targetType: 'reply',
                              targetId: response.responseId,
                              targetOwnerUserId: response.responderId,
                              skywriteId: record.id,
                              visibilityContext: 'sky_invitation_response',
                              provenanceIds: [response.responseId, record.id],
                            })
                          }>
                          <Text style={styles.saveBtnText}>Report</Text>
                        </Pressable>
                        <Pressable
                          style={styles.saveBtn}
                          accessibilityLabel={
                            response.savedByAuthor
                              ? SkywriteCopy.unsaveResponse
                              : SkywriteCopy.saveResponse
                          }
                          onPress={() => {
                            if (!skywriteId || !record.skyAreaId) return;
                            if (response.savedByAuthor) {
                              unsaveResponseAsAuthor(skywriteId, response.responseId);
                              return;
                            }
                            saveResponseAsAuthor({
                              skywriteId,
                              responseId: response.responseId,
                              authorId: record.authorId,
                              skyAreaId: record.skyAreaId,
                            });
                          }}>
                          <Text style={styles.saveBtnText}>
                            {response.savedByAuthor
                              ? SkywriteCopy.unsaveResponse
                              : SkywriteCopy.saveResponse}
                          </Text>
                        </Pressable>
                        </>
                      ) : null}
                    </View>
                  ))}
                </View>
              ) : null}

              {!isAuthor && !visitorPlaybackOnly && respondMode && !perspectiveSentAck ? (
                <View style={styles.composerSheet}>
                  {skyInvitationReply ? (
                    <Text style={styles.composerHint}>{SkywriteCopy.invitationComposerHint}</Text>
                  ) : null}
                  <TextInput
                    value={responseDraft}
                    onChangeText={setResponseDraft}
                    placeholder={SkywriteCopy.threadResponsePlaceholder}
                    placeholderTextColor={placeholderColor}
                    multiline
                    autoFocus
                    style={styles.input}
                  />
                  {responseSendError ? (
                    <Text style={styles.formError}>{responseSendError}</Text>
                  ) : null}
                  <Pressable
                    style={[
                      styles.submitBtn,
                      !canSendResponse && styles.submitBtnDisabled,
                    ]}
                    disabled={!canSendResponse}
                    onPress={handleSubmitResponse}
                    accessibilityLabel={SkywriteCopy.sendPerspective}
                    accessibilityState={{ disabled: !canSendResponse }}>
                    <Text
                      style={[
                        styles.submitBtnText,
                        !canSendResponse && styles.submitBtnTextDisabled,
                      ]}>
                      {SkywriteCopy.sendPerspective}
                    </Text>
                  </Pressable>
                </View>
              ) : null}
            </>
          ) : (
            <View style={styles.card}>
              <Text style={styles.emptyTitle}>{MySkyCopy.skywriteMissingTitle}</Text>
              <Text style={styles.emptyBody}>{MySkyCopy.skywriteMissingBody}</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
      {reportInput ? (
        <ModerationReportSheet
          visible
          onClose={() => setReportInput(null)}
          title="Report"
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
    </View>
  );
}
