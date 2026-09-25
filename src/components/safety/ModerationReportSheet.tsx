import { memo, useCallback, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { MODERATION_REASON_OPTIONS } from '@/moderation/moderationReasons';
import type { ModerationReportReason } from '@/moderation/moderationTypes';
import type { SubmitModerationReportInput } from '@/moderation/moderationTypes';
import type { SubmitModerationReportResult } from '@/moderation/moderationTypes';
import { Fonts } from '@/constants/theme';

export interface ModerationReportFollowUpActions {
  showBlock?: boolean;
  showLimit?: boolean;
  showMuteThread?: boolean;
  showLeaveCommunity?: boolean;
  blockUserId?: string;
  limitUserId?: string;
  threadId?: string;
  communityId?: string;
  onBlock?: () => void;
  onLimit?: () => void;
  onMuteThread?: () => void;
  onLeaveCommunity?: () => void;
}

interface ModerationReportSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  reportInput: Omit<SubmitModerationReportInput, 'reporterUserId' | 'reason' | 'optionalNote'>;
  onSubmit: (
    input: Omit<SubmitModerationReportInput, 'reporterUserId'>,
  ) => Promise<SubmitModerationReportResult>;
  followUp?: ModerationReportFollowUpActions;
}

function ModerationReportSheetComponent({
  visible,
  onClose,
  title = 'Report',
  reportInput,
  onSubmit,
  followUp,
}: ModerationReportSheetProps) {
  const [step, setStep] = useState<'reason' | 'note' | 'done'>('reason');
  const [reason, setReason] = useState<ModerationReportReason | null>(null);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [duplicate, setDuplicate] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setStep('reason');
    setReason(null);
    setNote('');
    setSubmitting(false);
    setDuplicate(false);
    setError(null);
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [onClose, reset]);

  const handleSubmit = useCallback(async () => {
    if (!reason || submitting) return;
    setSubmitting(true);
    setError(null);
    const result = await onSubmit({
      ...reportInput,
      reason,
      optionalNote: note.trim() || undefined,
    });
    setSubmitting(false);
    if (!result.ok) {
      setError('We couldn’t save that yet. Try again.');
      return;
    }
    setDuplicate(result.duplicate);
    setStep('done');
  }, [note, onSubmit, reason, reportInput, submitting]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <Pressable style={styles.backdrop} onPress={handleClose} accessibilityLabel="Close report" />
      <View style={styles.sheet} accessibilityViewIsModal>
        {step === 'reason' ? (
          <>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.sub}>Choose the closest reason.</Text>
            <ScrollView style={styles.list}>
              {MODERATION_REASON_OPTIONS.map((option) => (
                <Pressable
                  key={option.id}
                  style={styles.reasonRow}
                  accessibilityRole="button"
                  accessibilityLabel={option.label}
                  onPress={() => {
                    setReason(option.id);
                    setStep('note');
                  }}>
                  <Text style={styles.reasonText}>{option.label}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </>
        ) : null}

        {step === 'note' ? (
          <>
            <Text style={styles.title}>Tell us more</Text>
            <Text style={styles.sub}>Optional — a sentence is enough.</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="What happened?"
              placeholderTextColor="rgba(248,244,236,0.4)"
              style={styles.noteInput}
              multiline
              accessibilityLabel="Optional report details"
            />
            <Pressable
              style={[styles.primaryBtn, submitting && styles.primaryDisabled]}
              disabled={submitting || !reason}
              accessibilityRole="button"
              accessibilityLabel="Submit report"
              onPress={() => void handleSubmit()}>
              <Text style={styles.primaryText}>{submitting ? 'Submitting…' : 'Submit'}</Text>
            </Pressable>
            <Pressable onPress={() => setStep('reason')} accessibilityLabel="Back to reasons">
              <Text style={styles.link}>Back</Text>
            </Pressable>
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </>
        ) : null}

        {step === 'done' ? (
          <>
            <Text style={styles.title}>
              {duplicate ? 'Already reported' : 'Thanks for letting us know'}
            </Text>
            <Text style={styles.sub}>
              {duplicate
                ? 'You’ve already reported this recently. We’re reviewing it.'
                : 'Your report was submitted. We’ll review it with care.'}
            </Text>
            {followUp?.showBlock && followUp.onBlock ? (
              <Pressable
                style={styles.secondaryBtn}
                accessibilityRole="button"
                accessibilityLabel="Block this person"
                onPress={() => {
                  followUp.onBlock?.();
                  handleClose();
                }}>
                <Text style={styles.secondaryText}>Block this person</Text>
              </Pressable>
            ) : null}
            {followUp?.showLimit && followUp.onLimit ? (
              <Pressable
                style={styles.secondaryBtn}
                accessibilityRole="button"
                accessibilityLabel="Limit this person"
                onPress={() => {
                  followUp.onLimit?.();
                  handleClose();
                }}>
                <Text style={styles.secondaryText}>Limit this person</Text>
              </Pressable>
            ) : null}
            {followUp?.showMuteThread && followUp.onMuteThread ? (
              <Pressable
                style={styles.secondaryBtn}
                onPress={() => {
                  followUp.onMuteThread?.();
                  handleClose();
                }}>
                <Text style={styles.secondaryText}>Mute this conversation</Text>
              </Pressable>
            ) : null}
            {followUp?.showLeaveCommunity && followUp.onLeaveCommunity ? (
              <Pressable
                style={styles.secondaryBtn}
                onPress={() => {
                  followUp.onLeaveCommunity?.();
                  handleClose();
                }}>
                <Text style={styles.secondaryText}>Leave community</Text>
              </Pressable>
            ) : null}
            <Pressable style={styles.primaryBtn} onPress={handleClose} accessibilityLabel="Done">
              <Text style={styles.primaryText}>Done</Text>
            </Pressable>
          </>
        ) : null}
      </View>
    </Modal>
  );
}

export const ModerationReportSheet = memo(ModerationReportSheetComponent);

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' },
  sheet: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 32,
    maxHeight: '78%',
    backgroundColor: '#1A2240',
    borderRadius: 16,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232,200,114,0.25)',
  },
  title: { fontFamily: Fonts.serif, fontSize: 22, color: '#FFF8F0' },
  sub: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(248,244,236,0.65)',
    marginTop: 6,
    marginBottom: 12,
  },
  list: { maxHeight: 320 },
  reasonRow: {
    minHeight: 48,
    justifyContent: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(232,200,114,0.12)',
  },
  reasonText: { fontFamily: Fonts.sans, fontSize: 14, color: '#FFF8F0' },
  noteInput: {
    minHeight: 88,
    fontFamily: Fonts.sans,
    fontSize: 15,
    color: '#FFF8F0',
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  primaryBtn: {
    minHeight: 48,
    borderRadius: 999,
    backgroundColor: 'rgba(232, 200, 114, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  primaryDisabled: { opacity: 0.5 },
  primaryText: { fontFamily: Fonts.sans, fontSize: 15, fontWeight: '700', color: '#F5E6B8' },
  secondaryBtn: {
    minHeight: 44,
    justifyContent: 'center',
    marginTop: 6,
  },
  secondaryText: { fontFamily: Fonts.sans, fontSize: 13, fontWeight: '600', color: '#C4B5FD' },
  link: {
    textAlign: 'center',
    marginTop: 10,
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: 'rgba(248,244,236,0.55)',
  },
  error: {
    marginTop: 8,
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: 'rgba(248,120,120,0.9)',
  },
});
