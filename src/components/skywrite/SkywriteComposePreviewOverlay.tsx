import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SkywriteImmersiveMomentView } from '@/components/skywrite/SkywriteImmersiveMomentView';
import { SkywriteCopy } from '@/constants/skywriteCopy';
import { Fonts, Radius } from '@/constants/theme';
import { useReelyouAuth } from '@/auth/ReelyouAuthProvider';
import { resolveActiveUserId } from '@/auth/resolveActiveUserId';
import { buildSkywritePreviewRecord } from '@/skywrite/draft';
import { useOverlayAudioPreviewScope } from '@/skywrite/media/useOverlayAudioPreviewScope';
import { defaultStepsForSkywrite } from '@/skywrite/play/skywritePlayLogic';
import type { SkywriteDraft } from '@/skywrite/types';

interface SkywriteComposePreviewOverlayProps {
  visible: boolean;
  draft: SkywriteDraft;
  mergedHashtags: string[];
  isPosting: boolean;
  postingLabel: string | null;
  publishError: string | null;
  onClose: () => void;
  onPost: () => void;
  onDraftMediaChange: (media: SkywriteDraft['media']) => void;
}

export function SkywriteComposePreviewOverlay({
  visible,
  draft,
  mergedHashtags,
  isPosting,
  postingLabel,
  publishError,
  onClose,
  onPost,
  onDraftMediaChange,
}: SkywriteComposePreviewOverlayProps) {
  const { user: authUser } = useReelyouAuth();
  const authorId = resolveActiveUserId(authUser);
  const audioPreview = useOverlayAudioPreviewScope(visible);
  const [stepIndex, setStepIndex] = useState(0);

  const previewRecord = useMemo(
    () =>
      buildSkywritePreviewRecord(
        { ...draft, text: draft.text.trim(), userHashtags: mergedHashtags },
        authorId,
        mergedHashtags,
      ),
    [authorId, draft, mergedHashtags],
  );

  const steps = useMemo(() => defaultStepsForSkywrite(previewRecord), [previewRecord]);
  const step = steps[stepIndex] ?? steps[0];
  const previewId = `compose-preview-${step?.kind ?? 'text'}`;

  const handleClose = useCallback(() => {
    void audioPreview.stopAll();
    setStepIndex(0);
    onClose();
  }, [audioPreview, onClose]);

  const [mediaStartNonce, setMediaStartNonce] = useState(0);

  const handlePrevious = useCallback(() => {
    void audioPreview.stopAll();
    setMediaStartNonce((n) => n + 1);
    setStepIndex((index) => Math.max(0, index - 1));
  }, [audioPreview]);

  const handleNext = useCallback(() => {
    void audioPreview.stopAll();
    setMediaStartNonce((n) => n + 1);
    setStepIndex((index) => Math.min(steps.length - 1, index + 1));
  }, [audioPreview, steps.length]);

  if (!visible || !step) return null;

  const postActions = (
    <View style={styles.actions}>
      {publishError ? <Text style={styles.error}>{publishError}</Text> : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={SkywriteCopy.previewBackToEdit}
        disabled={isPosting}
        onPress={handleClose}
        style={[styles.secondaryBtn, isPosting && styles.disabled]}>
        <Text style={styles.secondaryText}>{SkywriteCopy.previewBackToEdit}</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={SkywriteCopy.previewPost}
        disabled={isPosting}
        onPress={onPost}
        style={[styles.primaryBtn, isPosting && styles.disabled]}>
        {isPosting ? (
          <View style={styles.postingRow}>
            <ActivityIndicator color="#1a1028" />
            {postingLabel ? <Text style={styles.postingText}>{postingLabel}</Text> : null}
          </View>
        ) : (
          <Text style={styles.primaryText}>{SkywriteCopy.previewPost}</Text>
        )}
      </Pressable>
    </View>
  );

  return (
    <Modal visible animationType="slide" presentationStyle="fullScreen" onRequestClose={handleClose}>
      <View style={styles.root}>
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <SkywriteImmersiveMomentView
            record={previewRecord}
            stepKind={step.kind}
            stepIndex={stepIndex}
            stepCount={steps.length}
            previewId={previewId}
            audioPlaying={audioPreview.isPreviewPlaying(previewId)}
            onToggleAudio={(pid, uri) => void audioPreview.togglePreview(pid, uri)}
            onExit={handleClose}
            onPrevious={handlePrevious}
            onNext={handleNext}
            canPrevious={stepIndex > 0}
            canNext={stepIndex < steps.length - 1}
            onBeforeStepChange={() => void audioPreview.stopAll()}
            layoutMode="viewport"
            mediaStartNonce={mediaStartNonce}
            mediaMix={draft.media}
            onMediaMixChange={onDraftMediaChange}
            showAudioMixControls
            allowVideoFramingEdit
            navigationMode="buttons"
            bottomSlot={postActions}
          />
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#050508' },
  safe: { flex: 1 },
  actions: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  error: {
    width: '100%',
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: '#F87171',
    textAlign: 'center',
    marginBottom: 4,
  },
  secondaryBtn: {
    flex: 1,
    minHeight: 48,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(232, 200, 114, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    backgroundColor: 'rgba(8, 10, 28, 0.45)',
  },
  secondaryText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '600',
    color: '#E8C872',
  },
  primaryBtn: {
    flex: 1,
    minHeight: 48,
    borderRadius: Radius.full,
    backgroundColor: '#E8C872',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  primaryText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1028',
  },
  disabled: { opacity: 0.55 },
  postingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  postingText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1028',
  },
});
