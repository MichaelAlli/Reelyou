import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomNav } from '@/components/BottomNav';
import { HomeBackdrop } from '@/components/home/HomeBackdrop';
import { HomeBellIcon } from '@/components/home/HomeIcons';
import { HomeHeaderLogo } from '@/components/home/HomeHeaderLogo';
import { HomeProfilePortrait } from '@/components/home/HomeProfilePortrait';
import { SkywriteAccordionRow } from '@/components/skywrite/SkywriteAccordionRow';
import { SkywriteTextStylePicker } from '@/components/skywrite/SkywriteTextStylePicker';
import { SkywriteMediaAttachments } from '@/components/skywrite/SkywriteMediaAttachments';
import { SkywriteMediaRow } from '@/components/skywrite/SkywriteMediaRow';
import { SkywritePhotoSourceSheet } from '@/components/skywrite/SkywritePhotoSourceSheet';
import { SkywriteVideoSourceSheet } from '@/components/skywrite/SkywriteVideoSourceSheet';
import { SkywriteShootingStar } from '@/components/skywrite/SkywriteShootingStar';
import { SkywriteToggleRow } from '@/components/skywrite/SkywriteToggleRow';
import { SkyAreaSuggestionBanner } from '@/components/skywrite/SkyAreaSuggestionBanner';
import { SkywriteSkyAreaPicker } from '@/components/skywrite/SkywriteSkyAreaPicker';
import { SkywriteComposePreviewOverlay } from '@/components/skywrite/SkywriteComposePreviewOverlay';
import { SkywriteComposeImmersiveVideoStage } from '@/components/skywrite/SkywriteComposeImmersiveVideoStage';
import { SkywriteVisibilityControl } from '@/components/skywrite/SkywriteVisibilityControl';
import { MySkywritesCopy } from '@/constants/mySkywritesCopy';
import { detectSkyAreaSuggestionFromHashtags } from '@/skyAreas/skyAreaHashtagSuggestion';
import { useSkyAreaPreferences } from '@/skyAreas/SkyAreaPreferencesProvider';
import { inferSkywriteIntentFromShowingUp } from '@/skywrite/skywriteIntent';
import {
  SKYWRITE_REFLECTION_PROMPTS,
  SKYWRITE_SHOWING_UP_OPTIONS,
  SkywriteCopy,
} from '@/constants/skywriteCopy';
import {
  getSkywriteTextStyleLabel,
  getSkywriteWriteInputStyle,
} from '@/constants/skywriteTextStyles';
import { HomeLayout, HomePalette, measureHomeAvatarSize, measureHomePadH } from '@/constants/homeLayout';
import { Fonts, Radius, Spacing, TabBarHeight } from '@/constants/theme';
import { useUserAvatar } from '@/identity/UserAvatarProvider';
import { useOnboarding } from '@/onboarding';
import { SKYWRITE_COMPOSE_REQUIRES_CANONICAL_BOTTOM_NAV } from '@/skywrite/skywriteComposerNavPolicy';
import { takeFocusedSkywriteComposeStars } from '@/skywrite/focusedSkyComposeSnapshot';
import { submitSkywriteToFocusedSky } from '@/skywrite/submitToFocusedSkywrite';
import {
  createEmptySkywriteDraft,
  getSkywriteMediaActionLabels,
  hasSkywriteContent,
  parseUserHashtags,
  pickSkywritePhotoFromLibrary,
  pickSkywriteVideoFromLibrary,
  recordSkywriteVideo,
  skywriteRecordToDraft,
  takeSkywritePhoto,
  useSkywriteVoice,
  type PhotoPickResult,
  type VideoPickResult,
} from '@/skywrite';
import type { SkywritePhotoMedia, SkywriteVideoMedia } from '@/skywrite/types';
import type { Privacy } from '@/types';

/** LOCKED NAV — /skywrite/compose must keep canonical BottomNav (Skywrite active). Do not remove or replace. */
void SKYWRITE_COMPOSE_REQUIRES_CANONICAL_BOTTOM_NAV;

type AccordionKey = 'showingUp' | 'textStyle' | 'hashtags' | 'more';

const MAX_HASHTAGS = 5;

function mergeHashtags(text: string, manual: string[]): string[] {
  const fromText = parseUserHashtags(text);
  const normalizedManual = manual.map((tag) => tag.replace(/^#/, '').trim().toLowerCase()).filter(Boolean);
  const seen = new Set<string>();
  const merged: string[] = [];
  for (const tag of [...fromText, ...normalizedManual]) {
    if (!seen.has(tag) && merged.length < MAX_HASHTAGS) {
      seen.add(tag);
      merged.push(tag);
    }
  }
  return merged;
}

export function SkywriteScreen() {
  const router = useRouter();
  const { editId } = useLocalSearchParams<{ editId?: string }>();
  const editingSkywriteId = typeof editId === 'string' && editId.length > 0 ? editId : null;
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const padH = measureHomePadH(screenWidth);
  const navContentInset = TabBarHeight + Math.max(insets.bottom, Spacing.sm);
  const avatarSize = Math.min(measureHomeAvatarSize(screenWidth), 88);
  const { publishSkywrite, replaceSkywrite, skywrites, mySkyView, setSkyArrivalHandoff, state } =
    useOnboarding();
  const { profilePhotoDisplayUri, profilePhotoRevision } = useUserAvatar();
  const composerPortraitSource = profilePhotoDisplayUri ? { uri: profilePhotoDisplayUri } : undefined;

  const [draft, setDraft] = useState<SkywriteDraft>(() =>
    createEmptySkywriteDraft({
      allowAIContext: state.aiPersonalizationEnabled,
      animateToSky: true,
      skyAreaId: 'growth',
    }),
  );
  const [promptIndex, setPromptIndex] = useState(0);
  const [manualHashtags, setManualHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState('');
  const [openAccordion, setOpenAccordion] = useState<AccordionKey | null>(null);
  const [visibilityExpanded, setVisibilityExpanded] = useState(false);
  const [validationHint, setValidationHint] = useState<string | null>(null);
  const [photoSourceOpen, setPhotoSourceOpen] = useState(false);
  const [videoSourceOpen, setVideoSourceOpen] = useState(false);
  const [voiceCaptureOpen, setVoiceCaptureOpen] = useState(false);
  const [mediaFeedback, setMediaFeedback] = useState<string | null>(null);
  const [dismissedSuggestionKey, setDismissedSuggestionKey] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [videoFramingAdjust, setVideoFramingAdjust] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [postingLabel, setPostingLabel] = useState<string | null>(null);
  const { catalog, addCustomArea, selectedIds } = useSkyAreaPreferences();

  const voice = useSkywriteVoice();

  useEffect(() => {
    if (!editingSkywriteId) return;
    const record = skywrites.find((entry) => entry.id === editingSkywriteId);
    if (!record) return;
    setDraft(skywriteRecordToDraft(record));
    setManualHashtags(record.userHashtags);
    if (record.media.audio) {
      voice.setExistingAudio(record.media.audio);
    }
  }, [editingSkywriteId, skywrites]);

  const reflectionPrompt = SKYWRITE_REFLECTION_PROMPTS[promptIndex] ?? SkywriteCopy.reflectionDefault;
  const showingUpOption = SKYWRITE_SHOWING_UP_OPTIONS.find((o) => o.id === draft.showingUp);
  const hasPhoto = Boolean(draft.media.photo?.uri);
  const hasVideo = Boolean(draft.media.video?.uri);
  const hasVoice = Boolean(draft.media.audio?.uri);
  const canShare = hasSkywriteContent(draft);
  const mediaActions = useMemo(
    () => getSkywriteMediaActionLabels(hasPhoto, hasVoice, hasVideo, draft.text.trim().length > 0),
    [draft.text, hasPhoto, hasVideo, hasVoice],
  );

  const textStyle = draft.textStyle ?? 'plain';
  const writeInputStyle = useMemo(() => getSkywriteWriteInputStyle(textStyle), [textStyle]);
  const charCount = draft.text.length;
  const mergedHashtags = useMemo(
    () => mergeHashtags(draft.text, manualHashtags),
    [draft.text, manualHashtags],
  );
  const hashtagCount = mergedHashtags.length;

  const areaSuggestion = useMemo(() => {
    if (draft.visibility === 'private') return null;
    return detectSkyAreaSuggestionFromHashtags(mergedHashtags, catalog, selectedIds);
  }, [catalog, draft.visibility, mergedHashtags, selectedIds]);

  const showAreaSuggestion =
    areaSuggestion != null &&
    dismissedSuggestionKey !== areaSuggestion.suggestedLabel.toLowerCase();

  const updateDraft = useCallback((patch: Partial<SkywriteDraft>) => {
    setDraft((current) => {
      const next = { ...current, ...patch };
      if (patch.showingUp !== undefined) {
        next.intent = inferSkywriteIntentFromShowingUp(patch.showingUp);
      }
      return next;
    });
    setValidationHint(null);
  }, []);

  const toggleAccordion = useCallback((key: AccordionKey) => {
    setOpenAccordion((current) => (current === key ? null : key));
  }, []);

  const refreshPrompt = useCallback(() => {
    setPromptIndex((i) => (i + 1) % SKYWRITE_REFLECTION_PROMPTS.length);
  }, []);

  const addHashtag = useCallback(
    (raw: string) => {
      const tag = raw.replace(/^#/, '').trim();
      if (!tag || hashtagCount >= MAX_HASHTAGS) return;
      const normalized = tag.toLowerCase();
      if (manualHashtags.map((t) => t.toLowerCase()).includes(normalized)) return;
      if (parseUserHashtags(draft.text).includes(normalized)) return;
      setManualHashtags((prev) => [...prev, normalized]);
      setHashtagInput('');
    },
    [draft.text, hashtagCount, manualHashtags],
  );

  const applyPhoto = useCallback((photo: SkywritePhotoMedia) => {
    setDraft((current) => ({
      ...current,
      media: {
        photo,
        video: null,
        audio: current.media.audio,
        originalVideoAudio: current.media.originalVideoAudio,
      },
    }));
    setValidationHint(null);
    setMediaFeedback(null);
  }, []);

  const handlePhotoPickResult = useCallback(
    (result: PhotoPickResult) => {
      if (result.ok) {
        applyPhoto(result.photo);
        return;
      }
      if (result.reason === 'denied' && result.message) {
        setMediaFeedback(result.message);
      }
    },
    [applyPhoto],
  );

  const applyVideo = useCallback((video: SkywriteVideoMedia) => {
    setDraft((current) => ({
      ...current,
      media: {
        photo: null,
        video,
        audio: current.media.audio,
        originalVideoAudio: current.media.originalVideoAudio ?? 'on',
        originalVideoVolume: current.media.originalVideoVolume ?? 1,
        voiceoverVolume: current.media.voiceoverVolume ?? 1,
      },
    }));
    setValidationHint(null);
    setMediaFeedback(null);
  }, []);

  const handleVideoPickResult = useCallback(
    (result: VideoPickResult) => {
      if (result.ok) {
        applyVideo(result.video);
        return;
      }
      if (result.message) {
        setMediaFeedback(result.message);
      }
    },
    [applyVideo],
  );

  const handlePhotoPress = useCallback(() => {
    setPhotoSourceOpen(true);
  }, []);

  const handleVideoPress = useCallback(() => {
    setVideoSourceOpen(true);
  }, []);

  const handleChooseLibrary = useCallback(async () => {
    setPhotoSourceOpen(false);
    handlePhotoPickResult(await pickSkywritePhotoFromLibrary());
  }, [handlePhotoPickResult]);

  const handleTakePhoto = useCallback(async () => {
    setPhotoSourceOpen(false);
    handlePhotoPickResult(await takeSkywritePhoto());
  }, [handlePhotoPickResult]);

  const handleChooseVideoLibrary = useCallback(async () => {
    setVideoSourceOpen(false);
    handleVideoPickResult(await pickSkywriteVideoFromLibrary());
  }, [handleVideoPickResult]);

  const handleRecordVideo = useCallback(async () => {
    setVideoSourceOpen(false);
    handleVideoPickResult(await recordSkywriteVideo());
  }, [handleVideoPickResult]);

  const handleReRecord = useCallback(async () => {
    await voice.removeAudio();
    setDraft((current) => ({
      ...current,
      media: {
        ...current.media,
        audio: null,
      },
    }));
    setVoiceCaptureOpen(true);
    setMediaFeedback(null);
  }, [voice]);

  const handleVoicePress = useCallback(async () => {
    if (voice.isRecording) return;
    if (draft.media.audio) {
      await handleReRecord();
      return;
    }
    setVoiceCaptureOpen(true);
    setMediaFeedback(null);
  }, [draft.media.audio, handleReRecord, voice.isRecording]);

  const handleStartRecord = useCallback(async () => {
    const started = await voice.startRecording();
    if (!started) {
      setMediaFeedback(`${SkywriteCopy.microphoneDenied} ${SkywriteCopy.microphoneDeniedHint}`);
      setVoiceCaptureOpen(false);
    }
  }, [voice]);

  const handleVoiceStop = useCallback(async () => {
    const audio = await voice.finishRecording();
    setVoiceCaptureOpen(false);
    if (!audio) return;
    setDraft((current) => ({
      ...current,
      media: {
        ...current.media,
        audio,
      },
    }));
    setMediaFeedback(null);
  }, [voice]);

  const handleVoiceCancel = useCallback(async () => {
    await voice.cancelRecording();
    if (!draft.media.audio) {
      setVoiceCaptureOpen(false);
    }
  }, [draft.media.audio, voice]);

  const handleRemovePhoto = useCallback(() => {
    setDraft((current) => ({
      ...current,
      media: {
        ...current.media,
        photo: null,
      },
    }));
  }, []);

  const handleRemoveVideo = useCallback(() => {
    setDraft((current) => ({
      ...current,
      media: {
        ...current.media,
        video: null,
        originalVideoAudio: undefined,
        originalVideoVolume: undefined,
      },
    }));
  }, []);

  const handleRemoveAudio = useCallback(async () => {
    await voice.removeAudio();
    setDraft((current) => ({
      ...current,
      media: {
        ...current.media,
        audio: null,
      },
    }));
    setVoiceCaptureOpen(false);
    setMediaFeedback(null);
  }, [voice]);

  const handleTogglePlayback = useCallback(async () => {
    if (!voice.audio && draft.media.audio) {
      voice.setExistingAudio(draft.media.audio);
    }
    await voice.togglePlayback();
  }, [draft.media.audio, voice]);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(tabs)/home' as never);
  }, [router]);

  const buildPublishDraft = useCallback((): SkywriteDraft | null => {
    if (!hasSkywriteContent(draft)) {
      setValidationHint(SkywriteCopy.emptyValidation);
      return null;
    }
    const trimmed = draft.text.trim();
    return {
      ...draft,
      text: trimmed,
      userHashtags: mergeHashtags(trimmed, manualHashtags),
    };
  }, [draft, manualHashtags]);

  const handleOpenPreview = useCallback(() => {
    if (!buildPublishDraft()) return;
    setPublishError(null);
    setPreviewOpen(true);
  }, [buildPublishDraft]);

  const handlePostSkywrite = useCallback(async () => {
    if (isPosting) return;
    const publishDraft = buildPublishDraft();
    if (!publishDraft) return;

    setIsPosting(true);
    setPublishError(null);
    setPostingLabel(SkywriteCopy.publishing);
    const starsBeforeSubmit = takeFocusedSkywriteComposeStars() ?? mySkyView.stars;
    const onProgress = (progress: { phase: string; elapsedMs: number }) => {
      const seconds = Math.max(1, Math.round(progress.elapsedMs / 1000));
      const phaseLabel =
        progress.phase === 'uploading_media'
          ? SkywriteCopy.publishingUploading
          : progress.phase === 'finalizing'
            ? SkywriteCopy.publishingFinalizing
            : SkywriteCopy.publishing;
      setPostingLabel(SkywriteCopy.publishingPhase(phaseLabel, seconds));
    };
    const result = editingSkywriteId
      ? await replaceSkywrite(editingSkywriteId, publishDraft, onProgress)
      : await publishSkywrite(publishDraft, onProgress);
    setIsPosting(false);
    setPostingLabel(null);

    if (!result.ok) {
      setPublishError(result.errorMessage);
      return;
    }

    setPreviewOpen(false);
    setPublishError(null);

    if (result.record.animateToSky) {
      submitSkywriteToFocusedSky(result.record, starsBeforeSubmit, setSkyArrivalHandoff, router);
      return;
    }

    router.replace(editingSkywriteId ? '/profile' as never : '/skywrite' as never);
  }, [
    buildPublishDraft,
    editingSkywriteId,
    isPosting,
    mySkyView.stars,
    publishSkywrite,
    replaceSkywrite,
    router,
    setSkyArrivalHandoff,
  ]);

  return (
    <View style={styles.root}>
      <HomeBackdrop />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={insets.top}>
          <ScrollView
            scrollEnabled={!videoFramingAdjust}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.scroll,
              { paddingHorizontal: padH, paddingBottom: navContentInset + 12 },
            ]}
            keyboardShouldPersistTaps="handled">
            <View style={styles.topNav}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Go back"
                onPress={handleBack}
                style={styles.iconCircle}>
                <Text style={styles.backArrow}>←</Text>
              </Pressable>
              <View style={styles.logoWrap} pointerEvents="none">
                <HomeHeaderLogo />
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Notifications"
                disabled
                accessibilityState={{ disabled: true }}
                style={styles.iconCircle}>
                <HomeBellIcon size={16} />
                <View style={styles.badge} accessibilityElementsHidden />
              </Pressable>
            </View>

            <View style={styles.heroRow}>
              <View style={styles.heroCopy}>
                <Text style={styles.heroTitle}>
                  {SkywriteCopy.title} <Text style={styles.sparkle}>✨</Text>
                </Text>
                <View style={styles.subtitlePill}>
                  <Text style={styles.subtitle}>{SkywriteCopy.subtitle}</Text>
                </View>
              </View>
              <View
                style={[
                  styles.avatarRing,
                  {
                    width: avatarSize + 10,
                    height: avatarSize + 10,
                    borderRadius: (avatarSize + 10) / 2,
                  },
                ]}>
                <View
                  style={[
                    styles.avatarInner,
                    { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 },
                  ]}>
                  <HomeProfilePortrait
                    size={avatarSize}
                    source={composerPortraitSource}
                    recyclingKey={profilePhotoRevision}
                  />
                </View>
              </View>
            </View>

            {hasVideo && draft.media.video ? (
              <SkywriteComposeImmersiveVideoStage
                video={draft.media.video}
                media={draft.media}
                edgeBleed={padH}
                onMediaChange={(media) => setDraft((current) => ({ ...current, media }))}
                onReplace={handleVideoPress}
                onRemove={handleRemoveVideo}
                onDimensionsResolved={(width, height) =>
                  setDraft((current) =>
                    current.media.video
                      ? {
                          ...current,
                          media: {
                            ...current.media,
                            video: { ...current.media.video, width, height },
                          },
                        }
                      : current,
                  )
                }
                onFramingAdjustChange={setVideoFramingAdjust}
              />
            ) : null}

            <View style={styles.promptCard}>
              <LinearGradient
                colors={['rgba(14, 12, 36, 0.92)', 'rgba(8, 8, 24, 0.94)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.promptRow}>
                <Text style={styles.promptIcon}>✨</Text>
                <View style={styles.promptCenter}>
                  <Text style={styles.promptLabel}>{SkywriteCopy.reflectionLabel}</Text>
                  <Text style={styles.promptQuestion}>{reflectionPrompt}</Text>
                </View>
                <Pressable
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={SkywriteCopy.refresh}
                  onPress={refreshPrompt}
                  style={styles.refreshBtn}>
                  <Text style={styles.refreshText}>↻ {SkywriteCopy.refresh}</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.writeCard}>
              <LinearGradient
                colors={['rgba(10, 10, 28, 0.88)', 'rgba(6, 8, 20, 0.92)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
                pointerEvents="none"
              />
              <View style={styles.writeCardContent}>
                <TextInput
                  style={[styles.writeInput, writeInputStyle]}
                  placeholder={SkywriteCopy.writePlaceholder}
                  placeholderTextColor="rgba(235, 228, 248, 0.38)"
                  multiline
                  editable
                  value={draft.text}
                  onChangeText={(value) => updateDraft({ text: value.slice(0, SkywriteCopy.charLimit) })}
                  textAlignVertical="top"
                />

                <SkywriteMediaAttachments
                  photo={draft.media.photo}
                  video={draft.media.video}
                  suppressVideoPreview={hasVideo}
                  hasText={draft.text.trim().length > 0}
                  audio={draft.media.audio}
                  onVideoDimensionsResolved={(width, height) =>
                    setDraft((current) =>
                      current.media.video
                        ? {
                            ...current,
                            media: {
                              ...current.media,
                              video: { ...current.media.video, width, height },
                            },
                          }
                        : current,
                    )
                  }
                  voiceCaptureOpen={voiceCaptureOpen}
                  isRecording={voice.isRecording}
                  elapsedMs={voice.elapsedMs}
                  elapsedLabel={voice.elapsedLabel}
                  isPlaying={voice.isPlaying}
                  onReplacePhoto={handlePhotoPress}
                  onRemovePhoto={handleRemovePhoto}
                  onReplaceVideo={handleVideoPress}
                  onRemoveVideo={handleRemoveVideo}
                  onRecord={handleStartRecord}
                  onStopRecording={handleVoiceStop}
                  onCancelRecording={handleVoiceCancel}
                  onTogglePlayback={handleTogglePlayback}
                  onReRecord={handleReRecord}
                  onRemoveAudio={handleRemoveAudio}
                />

                <SkywriteMediaRow
                  photoLabel={mediaActions.photoLabel}
                  videoLabel={hasVideo ? SkywriteCopy.mediaChangeVideo : SkywriteCopy.mediaVideo}
                  voiceLabel={mediaActions.voiceLabel}
                  photoA11y={mediaActions.photoA11y}
                  videoA11y="Add or change video"
                  voiceA11y={mediaActions.voiceA11y}
                  photoActive={hasPhoto}
                  videoActive={hasVideo}
                  voiceActive={hasVoice}
                  showPhoto={!hasVideo}
                  showVideo={!hasPhoto}
                  onPhotoPress={handlePhotoPress}
                  onVideoPress={handleVideoPress}
                  onVoicePress={handleVoicePress}
                />

                {mediaFeedback ? <Text style={styles.mediaFeedback}>{mediaFeedback}</Text> : null}

                <Text style={styles.charCount}>
                  {charCount}/{SkywriteCopy.charLimit}
                </Text>
              </View>
            </View>

            <View style={styles.accordionStack}>
              <SkywriteAccordionRow
                icon="✨"
                title={SkywriteCopy.showingUpTitle}
                expanded={openAccordion === 'showingUp'}
                onToggle={() => toggleAccordion('showingUp')}
                accessibilityLabel="How are you showing up optional"
                selectedChip={
                  showingUpOption && openAccordion !== 'showingUp' ? (
                    <View style={[styles.typeChip, { borderColor: `${showingUpOption.color}55` }]}>
                      <Text style={[styles.typeChipText, { color: showingUpOption.color }]}>
                        {showingUpOption.emoji} {showingUpOption.label}
                      </Text>
                    </View>
                  ) : undefined
                }>
                <View style={styles.optionGrid}>
                  {SKYWRITE_SHOWING_UP_OPTIONS.map((option) => {
                    const active = draft.showingUp === option.id;
                    return (
                      <Pressable
                        key={option.id}
                        accessibilityRole="button"
                        accessibilityLabel={option.label}
                        onPress={() => {
                          updateDraft({ showingUp: option.id });
                          setOpenAccordion(null);
                        }}
                        style={[styles.optionTile, active && { borderColor: option.color }]}>
                        <Text style={styles.optionEmoji}>{option.emoji}</Text>
                        <Text style={[styles.optionLabel, active && { color: option.color }]}>
                          {option.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                {draft.showingUp ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={SkywriteCopy.clearExpression}
                    onPress={() => updateDraft({ showingUp: null })}
                    style={styles.clearExpression}>
                    <Text style={styles.clearExpressionText}>{SkywriteCopy.clearExpression}</Text>
                  </Pressable>
                ) : null}
              </SkywriteAccordionRow>

              <SkywriteAccordionRow
                icon="Aa"
                title={SkywriteCopy.textStyleTitle}
                badge={SkywriteCopy.textStyleOptional}
                expanded={openAccordion === 'textStyle'}
                onToggle={() => toggleAccordion('textStyle')}
                accessibilityLabel="Text style optional"
                selectedChip={
                  textStyle !== 'plain' && openAccordion !== 'textStyle' ? (
                    <View style={styles.typeChip}>
                      <Text style={styles.typeChipText}>{getSkywriteTextStyleLabel(textStyle)}</Text>
                    </View>
                  ) : undefined
                }>
                <SkywriteTextStylePicker
                  value={textStyle}
                  onSelect={(next) => updateDraft({ textStyle: next })}
                />
              </SkywriteAccordionRow>

              <SkywriteAccordionRow
                icon="#"
                title={SkywriteCopy.hashtagsTitle}
                badge={SkywriteCopy.hashtagsOptional}
                expanded={openAccordion === 'hashtags'}
                onToggle={() => toggleAccordion('hashtags')}
                accessibilityLabel="Add hashtags optional">
                <View style={styles.hashtagInputRow}>
                  <Text style={styles.hashtagPrefix}>#</Text>
                  <TextInput
                    style={styles.hashtagInput}
                    placeholder={SkywriteCopy.hashtagsPlaceholder}
                    placeholderTextColor="rgba(235, 228, 248, 0.38)"
                    value={hashtagInput}
                    onChangeText={setHashtagInput}
                    onSubmitEditing={() => addHashtag(hashtagInput)}
                    returnKeyType="done"
                  />
                  <Text style={styles.hashtagCounter}>
                    {hashtagCount}/{MAX_HASHTAGS}
                  </Text>
                </View>
                {manualHashtags.length > 0 ? (
                  <View style={styles.chipRow}>
                    {manualHashtags.map((tag) => (
                      <Pressable
                        key={tag}
                        accessibilityRole="button"
                        accessibilityLabel={`Remove hashtag ${tag}`}
                        onPress={() => setManualHashtags((prev) => prev.filter((item) => item !== tag))}
                        style={styles.manualChip}>
                        <Text style={styles.manualChipText}>#{tag} ×</Text>
                      </Pressable>
                    ))}
                  </View>
                ) : null}
              </SkywriteAccordionRow>

              <SkywriteAccordionRow
                title={SkywriteCopy.moreOptionsTitle}
                expanded={openAccordion === 'more'}
                onToggle={() => toggleAccordion('more')}
                accessibilityLabel="More options">
                <SkywriteToggleRow
                  title={SkywriteCopy.aiPermissionTitle}
                  description={SkywriteCopy.aiPermissionDescription}
                  value={draft.allowAIContext ?? true}
                  onValueChange={(allowAIContext) => updateDraft({ allowAIContext })}
                  accessibilityLabel="Help personalize my REELYOU experience"
                />
                <SkywriteToggleRow
                  title={MySkywritesCopy.publishAddToYourJourney}
                  description={MySkywritesCopy.publishAddToYourJourneyHint}
                  value={draft.addToYourJourney === true}
                  onValueChange={(addToYourJourney) => updateDraft({ addToYourJourney })}
                  accessibilityLabel={MySkywritesCopy.publishAddToYourJourney}
                />
              </SkywriteAccordionRow>
            </View>

            <SkywriteSkyAreaPicker
              value={draft.skyAreaId}
              recentIds={selectedIds}
              onChange={(skyAreaId) => updateDraft({ skyAreaId })}
            />
            {showAreaSuggestion && areaSuggestion ? (
              <SkyAreaSuggestionBanner
                suggestion={areaSuggestion}
                onDismiss={() => setDismissedSuggestionKey(areaSuggestion.suggestedLabel.toLowerCase())}
                onAdd={() => {
                  const result = addCustomArea(areaSuggestion.suggestedLabel);
                  if (!result.error && result.areaId) {
                    updateDraft({ skyAreaId: result.areaId });
                  }
                  setDismissedSuggestionKey(areaSuggestion.suggestedLabel.toLowerCase());
                }}
              />
            ) : null}

            <SkywriteVisibilityControl
              value={draft.visibility}
              expanded={visibilityExpanded}
              onToggleExpanded={() => setVisibilityExpanded((open) => !open)}
              onSelect={(visibility: Privacy) => {
                updateDraft({ visibility });
                setVisibilityExpanded(false);
              }}
            />

            <View style={styles.shareSection}>
              <SkywriteToggleRow
                title={SkywriteCopy.animateTitle}
                description={SkywriteCopy.animateDescription}
                value={draft.animateToSky ?? true}
                onValueChange={(animateToSky) => updateDraft({ animateToSky })}
                accessibilityLabel="Watch this become a star"
              />
              <SkywriteShootingStar width={Math.min(screenWidth - padH * 2, 340)} />
              <Text style={styles.shareHint}>{SkywriteCopy.shareHint}</Text>
              {validationHint ? <Text style={styles.validationHint}>{validationHint}</Text> : null}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={SkywriteCopy.previewButton}
                disabled={!canShare || isPosting}
                onPress={handleOpenPreview}
                style={[styles.shareBtn, (!canShare || isPosting) && styles.shareBtnDisabled]}>
                <Text style={styles.shareBtnText}>{SkywriteCopy.previewButton}</Text>
              </Pressable>
              {publishError && !previewOpen ? (
                <Text style={styles.validationHint}>{publishError}</Text>
              ) : null}
              <Text style={styles.shareFooter}>{SkywriteCopy.shareFooter}</Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <SkywritePhotoSourceSheet
        visible={photoSourceOpen}
        onChooseLibrary={handleChooseLibrary}
        onTakePhoto={handleTakePhoto}
        onCancel={() => setPhotoSourceOpen(false)}
      />

      <SkywriteVideoSourceSheet
        visible={videoSourceOpen}
        onChooseLibrary={handleChooseVideoLibrary}
        onRecordVideo={handleRecordVideo}
        onCancel={() => setVideoSourceOpen(false)}
      />

      <SkywriteComposePreviewOverlay
        visible={previewOpen}
        draft={draft}
        mergedHashtags={mergedHashtags}
        isPosting={isPosting}
        postingLabel={postingLabel}
        publishError={publishError}
        onClose={() => {
          if (isPosting) return;
          setPreviewOpen(false);
          setPublishError(null);
        }}
        onPost={() => void handlePostSkywrite()}
        onDraftMediaChange={(media) => setDraft((current) => ({ ...current, media }))}
      />

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#05070A',
  },
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    gap: 14,
    paddingTop: 4,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: HomeLayout.headerHeight,
  },
  iconCircle: {
    width: HomeLayout.iconCircleSm,
    height: HomeLayout.iconCircleSm,
    borderRadius: HomeLayout.iconCircleSm / 2,
    borderWidth: 1,
    borderColor: 'rgba(232, 200, 114, 0.42)',
    backgroundColor: 'rgba(6, 8, 22, 0.48)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    color: HomePalette.gold,
    fontWeight: '600',
  },
  logoWrap: {
    flex: 1,
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 9,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: HomePalette.goldBright,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  heroCopy: {
    flex: 1,
    gap: 8,
  },
  heroTitle: {
    fontFamily: Fonts.serif,
    fontSize: 32,
    fontWeight: '700',
    color: HomePalette.textPrimary,
    letterSpacing: -0.4,
  },
  sparkle: {
    color: HomePalette.gold,
    fontSize: 22,
  },
  subtitlePill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderRadius: Radius.full,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(167, 139, 250, 0.18)',
  },
  subtitle: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: 'rgba(235, 228, 248, 0.88)',
  },
  avatarRing: {
    borderWidth: 1.5,
    borderColor: 'rgba(245, 214, 110, 0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(245, 214, 110, 0.04)',
  },
  avatarInner: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 248, 220, 0.58)',
  },
  promptCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(167, 139, 250, 0.28)',
    overflow: 'hidden',
    padding: 14,
  },
  promptRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  promptIcon: {
    fontSize: 16,
    color: HomePalette.purple,
    marginTop: 2,
  },
  promptCenter: {
    flex: 1,
    gap: 4,
  },
  promptLabel: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '600',
    color: HomePalette.purple,
  },
  promptQuestion: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    lineHeight: 21,
    color: HomePalette.textPrimary,
    fontWeight: '500',
  },
  refreshBtn: {
    minHeight: 44,
    justifyContent: 'center',
  },
  refreshText: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '600',
    color: HomePalette.purple,
  },
  writeCard: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(167, 139, 250, 0.32)',
    minHeight: 260,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: { elevation: 3 },
      default: {},
    }),
  },
  writeCardContent: {
    position: 'relative',
    zIndex: 1,
    padding: 16,
    gap: 0,
  },
  writeInput: {
    width: '100%',
    minHeight: 180,
    padding: 0,
    fontFamily: Fonts.sans,
    fontSize: 16,
    lineHeight: 24,
    color: HomePalette.textPrimary,
  },
  charCount: {
    alignSelf: 'flex-end',
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: 'rgba(235, 228, 248, 0.45)',
    marginTop: 8,
  },
  mediaFeedback: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    lineHeight: 17,
    color: 'rgba(235, 228, 248, 0.62)',
    marginTop: 4,
  },
  accordionStack: {
    gap: 10,
  },
  typeChip: {
    borderRadius: Radius.full,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: 'rgba(8, 8, 24, 0.6)',
  },
  typeChipText: {
    fontFamily: Fonts.sans,
    fontSize: 10,
    fontWeight: '600',
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionTile: {
    width: '23%',
    minWidth: 68,
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(167, 139, 250, 0.2)',
    backgroundColor: 'rgba(8, 8, 24, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    padding: 4,
  },
  optionEmoji: {
    fontSize: 18,
  },
  optionLabel: {
    fontFamily: Fonts.sans,
    fontSize: 9,
    fontWeight: '600',
    color: 'rgba(235, 228, 248, 0.78)',
    textAlign: 'center',
  },
  clearExpression: {
    alignSelf: 'flex-start',
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  clearExpressionText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: 'rgba(235, 228, 248, 0.55)',
  },
  hashtagInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(167, 139, 250, 0.22)',
    backgroundColor: 'rgba(6, 8, 22, 0.65)',
    paddingHorizontal: 12,
    minHeight: 44,
    gap: 6,
  },
  hashtagPrefix: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    color: HomePalette.purple,
    fontWeight: '600',
  },
  hashtagInput: {
    flex: 1,
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: HomePalette.textPrimary,
    paddingVertical: 8,
  },
  hashtagCounter: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: 'rgba(235, 228, 248, 0.45)',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  manualChip: {
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(167, 139, 250, 0.28)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(8, 8, 24, 0.5)',
  },
  manualChipText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: 'rgba(235, 228, 248, 0.82)',
  },
  shareSection: {
    alignItems: 'stretch',
    gap: 12,
    paddingTop: 4,
    paddingBottom: 8,
  },
  shareHint: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: 'rgba(235, 228, 248, 0.78)',
    textAlign: 'center',
  },
  validationHint: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: 'rgba(235, 228, 248, 0.68)',
    textAlign: 'center',
  },
  shareBtn: {
    width: '100%',
    minHeight: 52,
    borderRadius: Radius.full,
    backgroundColor: HomePalette.goldDeep,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(245, 214, 110, 0.55)',
    ...Platform.select({
      ios: {
        shadowColor: '#F5A623',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.35,
        shadowRadius: 14,
      },
      android: { elevation: 6 },
      default: {},
    }),
  },
  shareBtnDisabled: {
    opacity: 0.45,
  },
  shareBtnText: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1208',
  },
  shareFooter: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: 'rgba(235, 228, 248, 0.55)',
    textAlign: 'center',
  },
  success: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  successStar: {
    fontSize: 40,
    color: HomePalette.gold,
  },
  successTitle: {
    fontFamily: Fonts.serif,
    fontSize: 22,
    lineHeight: 30,
    textAlign: 'center',
    color: HomePalette.textPrimary,
    paddingHorizontal: 20,
  },
  successHint: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    color: 'rgba(235, 228, 248, 0.72)',
    paddingHorizontal: 24,
  },
  successBtn: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  successBtnText: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    fontWeight: '600',
    color: HomePalette.gold,
  },
});
