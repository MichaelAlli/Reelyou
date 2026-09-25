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
import { useThemedStyles } from '@/theme/useTheme';

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
  const { dismissSignal, messages, skyFollowGraph } = useReelyouConnect();
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
  const [respondMode, setRespondMode] = useState(fromBeacon);
  const [responseSendError, setResponseSendError] = useState<string | null>(null);
  const [visibilityPickerOpen, setVisibilityPickerOpen] = useState(false);

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

  const styles = useThemedStyles((tokens) =>
    StyleSheet.create({
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
        color: tokens.gold,
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
        color: tokens.gold,
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
        color: tokens.secondaryText,
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
        fontSize: 12.5,
        lineHeight: 18,
        color: tokens.secondaryText,
      },
      beaconActions: { flexDirection: 'row', gap: 10 },
      beaconBtn: {
        flex: 1,
        minHeight: 44,
        borderRadius: Radius.md,
        borderWidth: 1,
        borderColor: 'rgba(232, 200, 114, 0.45)',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 8,
      },
      beaconBtnPrimary: {
        backgroundColor: 'rgba(232, 200, 114, 0.16)',
      },
      beaconBtnText: {
        fontFamily: Fonts.sans,
        fontSize: 13,
        fontWeight: '600',
        color: tokens.gold,
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
        color: tokens.primaryText,
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
        color: tokens.gold,
      },
      input: {
        borderRadius: Radius.md,
        borderWidth: 1,
        borderColor: 'rgba(167, 139, 250, 0.28)',
        padding: Spacing.sm,
        minHeight: 88,
        fontFamily: Fonts.sans,
        fontSize: 14,
        color: tokens.primaryText,
        marginTop: 8,
      },
      submitBtn: {
        marginTop: 10,
        minHeight: 44,
        borderRadius: Radius.md,
        backgroundColor: 'rgba(232, 200, 114, 0.18)',
        alignItems: 'center',
        justifyContent: 'center',
      },
      submitBtnText: {
        fontFamily: Fonts.sans,
        fontSize: 14,
        fontWeight: '700',
        color: tokens.gold,
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
    }),
  );

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
    if (fromBeacon && returnToInvitations) {
      markReturnToSkyInvitationsAfterResponse();
      router.back();
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
                <View style={styles.beaconBanner}>
                  <Text style={styles.beaconCopy}>
                    {areaLabel
                      ? `Suggested because ${areaLabel} is one of the areas you chose.`
                      : SkywriteCopy.beaconTransparency}
                  </Text>
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
                </View>
              ) : null}

              <Text style={styles.title}>{MySkyCopy.skywriteDetailTitle}</Text>
              <Text style={styles.meta}>
                {formatSkywriteDate(record.createdAt)}
                {visibilityLabel ? ` · ${visibilityLabel}` : ''}
                {areaLabel ? ` · ${areaLabel}` : ''}
              </Text>

              {canSaveThread && !visitorPlaybackOnly ? (
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

              {isAuthor && !visitorPlaybackOnly ? (
                <Pressable
                  style={styles.saveBtn}
                  onPress={() => setVisibilityPickerOpen((open) => !open)}
                  accessibilityLabel="Change visibility">
                  <Text style={styles.saveBtnText}>Change visibility</Text>
                </Pressable>
              ) : null}

              {isAuthor && visibilityPickerOpen ? (
                <View style={{ gap: 8, marginBottom: Spacing.sm }}>
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

              {responses.length > 0 ? (
                <View style={{ marginTop: Spacing.md }}>
                  <Text style={styles.label}>{SkywriteCopy.threadResponsesTitle}</Text>
                  {responses.map((response) => (
                    <View key={response.responseId} style={styles.responseCard}>
                      <Text style={styles.responseBody}>{response.body}</Text>
                      {isAuthor && response.responderId !== currentUser.id ? (
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
                      ) : null}
                    </View>
                  ))}
                </View>
              ) : null}

              {!isAuthor && !visitorPlaybackOnly && (respondMode || fromBeacon) ? (
                <View style={{ marginTop: Spacing.md }}>
                  <Text style={styles.label}>{SkywriteCopy.respond}</Text>
                  <TextInput
                    value={responseDraft}
                    onChangeText={setResponseDraft}
                    placeholder={SkywriteCopy.threadResponsePlaceholder}
                    placeholderTextColor="rgba(235,228,248,0.45)"
                    multiline
                    style={styles.input}
                  />
                  {responseSendError ? (
                    <Text style={styles.beaconCopy}>{responseSendError}</Text>
                  ) : null}
                  <Pressable
                    style={styles.submitBtn}
                    onPress={handleSubmitResponse}
                    accessibilityLabel={SkywriteCopy.threadSubmitResponse}>
                    <Text style={styles.submitBtnText}>{SkywriteCopy.threadSubmitResponse}</Text>
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
    </View>
  );
}
