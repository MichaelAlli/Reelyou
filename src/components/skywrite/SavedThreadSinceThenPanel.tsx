import { Audio } from 'expo-av';
import { memo, useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { SavedThreadsCopy } from '@/constants/savedThreadsCopy';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { suggestEvidenceOffer } from '@/humanPotential/humanPotentialEvidenceLogic';
import type { HumanPotentialEvidenceType } from '@/humanPotential/humanPotentialEvidenceTypes';
import type { SavedThreadRecord, ThreadReflectionRecord } from '@/skywrite/savedThreads/savedThreadTypes';
import {
  bodyForMicroChoice,
  momentKindForPrompt,
  pickRevisitPrompt,
  promptCopy,
  shouldOfferGrowthMicroPrompt,
  type GrowthPromptId,
} from '@/skywrite/savedThreads/savedThreadGrowthLogic';
import type { GrowthMicroChoice } from '@/skywrite/savedThreads/savedThreadTypes';
import { useSkywriteVoice } from '@/skywrite/useSkywriteVoice';
import { useThemedStyles } from '@/theme/useTheme';

interface SavedThreadSinceThenPanelProps {
  saved: SavedThreadRecord;
  reflections: ThreadReflectionRecord[];
  sourceSkywriteId?: string;
  onConfirmGrowthEvidence: (input: {
    evidenceType: HumanPotentialEvidenceType;
    reflection: ThreadReflectionRecord;
  }) => void;
  onAddGrowthMoment: (input: {
    body: string;
    momentKind: ThreadReflectionRecord['momentKind'];
    microChoice?: GrowthMicroChoice;
    audioUri?: string | null;
    audioDurationMs?: number | null;
    emotionalTags?: ThreadReflectionRecord['emotionalTags'];
  }) => ThreadReflectionRecord | null;
  onEditReflection: (reflectionId: string, body: string) => void;
  onRemoveReflection: (reflectionId: string) => void;
}

function formatWhen(ms: number): string {
  try {
    return new Date(ms).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

function SavedThreadSinceThenPanelComponent({
  saved,
  reflections,
  sourceSkywriteId,
  onConfirmGrowthEvidence,
  onAddGrowthMoment,
  onEditReflection,
  onRemoveReflection,
}: SavedThreadSinceThenPanelProps) {
  const now = Date.now();
  const showMicro = shouldOfferGrowthMicroPrompt(saved, now);
  const promptId = pickRevisitPrompt(saved, now);
  const [microStep, setMicroStep] = useState<'choice' | 'followup' | 'hidden'>(
    showMicro ? 'choice' : 'hidden',
  );
  const [followupText, setFollowupText] = useState('');
  const [pendingChoice, setPendingChoice] = useState<GrowthMicroChoice | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const voice = useSkywriteVoice();

  const styles = useThemedStyles((tokens) =>
    StyleSheet.create({
      shell: {
        marginTop: Spacing.lg,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: 'rgba(232, 200, 114, 0.22)',
        paddingTop: Spacing.md,
        gap: Spacing.sm,
      },
      label: {
        fontFamily: Fonts.sans,
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.35,
        textTransform: 'uppercase',
        color: tokens.gold,
      },
      prompt: { fontFamily: Fonts.sans, fontSize: 14, lineHeight: 20, color: tokens.primaryText },
      chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
      chip: {
        borderRadius: Radius.full,
        borderWidth: 1,
        borderColor: 'rgba(167, 139, 250, 0.28)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        minHeight: 40,
        justifyContent: 'center',
      },
      chipText: { fontFamily: Fonts.sans, fontSize: 12.5, fontWeight: '600', color: tokens.primaryText },
      skipText: { fontFamily: Fonts.sans, fontSize: 12, color: tokens.mutedText },
      followupInput: {
        borderRadius: Radius.md,
        borderWidth: 1,
        borderColor: 'rgba(167, 139, 250, 0.25)',
        padding: Spacing.sm,
        minHeight: 44,
        maxHeight: 96,
        fontFamily: Fonts.sans,
        fontSize: 14,
        color: tokens.primaryText,
      },
      entry: {
        borderRadius: Radius.md,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(232, 200, 114, 0.18)',
        padding: Spacing.sm,
        gap: 6,
      },
      when: { fontFamily: Fonts.sans, fontSize: 10, color: tokens.mutedText },
      body: { fontFamily: Fonts.sans, fontSize: 13.5, lineHeight: 19, color: tokens.primaryText },
      rowActions: { flexDirection: 'row', gap: 12 },
      action: { fontFamily: Fonts.sans, fontSize: 12, fontWeight: '600', color: tokens.gold },
      voiceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
      subtle: { fontFamily: Fonts.sans, fontSize: 12, color: tokens.secondaryText },
    }),
  );

  const offerEvidence = useCallback(
    (reflection: ThreadReflectionRecord) => {
      const offer = suggestEvidenceOffer(reflection);
      if (!offer) return;
      Alert.alert(offer.title, `${offer.body}\n\n${SavedThreadsCopy.evidenceSuggestionFooter}`, [
        {
          text: SavedThreadsCopy.evidenceAdd,
          onPress: () => {
            onConfirmGrowthEvidence({
              evidenceType: offer.evidenceType,
              reflection,
            });
          },
        },
        { text: SavedThreadsCopy.evidenceNotNow, style: 'cancel' },
      ]);
    },
    [onConfirmGrowthEvidence],
  );

  const commitMoment = useCallback(
    (body: string, choice?: GrowthMicroChoice, prompt?: GrowthPromptId) => {
      if (!body.trim() && choice === 'skip') {
        setMicroStep('hidden');
        return;
      }
      const momentKind = prompt ? momentKindForPrompt(prompt) : 'perspective';
      const reflection = onAddGrowthMoment({
        body: body.trim() || bodyForMicroChoice(choice ?? 'skip'),
        momentKind,
        microChoice: choice,
        emotionalTags:
          momentKind === 'less_alone'
            ? ['less_alone']
            : momentKind === 'hope'
              ? ['hope']
              : undefined,
      });
      setMicroStep('hidden');
      setFollowupText('');
      setPendingChoice(null);
      if (reflection) offerEvidence(reflection);
    },
    [offerEvidence, onAddGrowthMoment],
  );

  const handleMicroChoice = useCallback(
    (choice: GrowthMicroChoice) => {
      if (choice === 'not_really' || choice === 'skip') {
        commitMoment(bodyForMicroChoice(choice), choice, promptId);
        return;
      }
      setPendingChoice(choice);
      setMicroStep('followup');
    },
    [commitMoment, promptId],
  );

  const handleFollowupSave = useCallback(() => {
    const base = bodyForMicroChoice(pendingChoice ?? 'yes');
    const body = followupText.trim() ? `${base} ${followupText.trim()}` : base;
    commitMoment(body, pendingChoice ?? 'yes', promptId);
  }, [commitMoment, followupText, pendingChoice, promptId]);

  const handleVoiceSave = useCallback(async () => {
    const audio = voice.audio ?? (await voice.finishRecording());
    if (!audio?.uri) return;
    const reflection = onAddGrowthMoment({
      body: SavedThreadsCopy.voiceMomentLabel,
      momentKind: momentKindForPrompt(promptId),
      audioUri: audio.uri,
      audioDurationMs: audio.durationMs ?? null,
    });
    if (reflection) offerEvidence(reflection);
    setMicroStep('hidden');
  }, [offerEvidence, onAddGrowthMoment, promptId, voice]);

  const timeline = useMemo(
    () => [...reflections].sort((a, b) => a.createdAt - b.createdAt),
    [reflections],
  );

  return (
    <View style={styles.shell}>
      <Text style={styles.label}>{SavedThreadsCopy.sectionSinceThen}</Text>

      {microStep === 'choice' ? (
        <View style={{ gap: 10 }}>
          <Text style={styles.prompt}>{promptCopy(promptId)}</Text>
          <View style={styles.chipRow}>
            <Pressable style={styles.chip} onPress={() => handleMicroChoice('yes')}>
              <Text style={styles.chipText}>{SavedThreadsCopy.choiceYes}</Text>
            </Pressable>
            <Pressable style={styles.chip} onPress={() => handleMicroChoice('a_little')}>
              <Text style={styles.chipText}>{SavedThreadsCopy.choiceALittle}</Text>
            </Pressable>
            <Pressable style={styles.chip} onPress={() => handleMicroChoice('not_really')}>
              <Text style={styles.chipText}>{SavedThreadsCopy.choiceNotReally}</Text>
            </Pressable>
          </View>
          <Pressable onPress={() => handleMicroChoice('skip')} hitSlop={8}>
            <Text style={styles.skipText}>{SavedThreadsCopy.skipForNow}</Text>
          </Pressable>
        </View>
      ) : null}

      {microStep === 'followup' ? (
        <View style={{ gap: 8 }}>
          <Text style={styles.subtle}>{SavedThreadsCopy.optionalFollowUp}</Text>
          <TextInput
            value={followupText}
            onChangeText={setFollowupText}
            placeholder={SavedThreadsCopy.followUpPlaceholder}
            placeholderTextColor="rgba(235,228,248,0.45)"
            multiline
            style={styles.followupInput}
          />
          <View style={styles.voiceRow}>
            <Pressable style={styles.chip} onPress={handleFollowupSave}>
              <Text style={styles.chipText}>{SavedThreadsCopy.saveMoment}</Text>
            </Pressable>
            {!voice.isRecording ? (
              <Pressable style={styles.chip} onPress={() => void voice.startRecording()}>
                <Text style={styles.chipText}>{SavedThreadsCopy.recordVoice}</Text>
              </Pressable>
            ) : (
              <Pressable style={styles.chip} onPress={() => void handleVoiceSave()}>
                <Text style={styles.chipText}>{SavedThreadsCopy.saveVoice}</Text>
              </Pressable>
            )}
            <Pressable onPress={() => setMicroStep('hidden')} hitSlop={8}>
              <Text style={styles.skipText}>{SavedThreadsCopy.skipForNow}</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {timeline.map((reflection) => (
        <View key={reflection.reflectionId} style={styles.entry}>
          <Text style={styles.when}>{formatWhen(reflection.createdAt)}</Text>
          <Text style={styles.body}>{reflection.body}</Text>
          {reflection.audioUri ? (
            <Pressable
              onPress={async () => {
                if (!reflection.audioUri) return;
                try {
                  const { sound } = await Audio.Sound.createAsync({ uri: reflection.audioUri });
                  await sound.playAsync();
                } catch {
                  /* quiet */
                }
              }}>
              <Text style={styles.action}>{SavedThreadsCopy.playVoice}</Text>
            </Pressable>
          ) : null}
          {editingId === reflection.reflectionId ? (
            <>
              <TextInput
                value={editDraft}
                onChangeText={setEditDraft}
                style={styles.followupInput}
                multiline
              />
              <Pressable
                onPress={() => {
                  onEditReflection(reflection.reflectionId, editDraft);
                  setEditingId(null);
                  setEditDraft('');
                }}>
                <Text style={styles.action}>{SavedThreadsCopy.saveMoment}</Text>
              </Pressable>
            </>
          ) : (
            <View style={styles.rowActions}>
              <Pressable
                onPress={() => {
                  setEditingId(reflection.reflectionId);
                  setEditDraft(reflection.body);
                }}>
                <Text style={styles.action}>{SavedThreadsCopy.editMoment}</Text>
              </Pressable>
              <Pressable onPress={() => onRemoveReflection(reflection.reflectionId)}>
                <Text style={styles.action}>{SavedThreadsCopy.deleteMoment}</Text>
              </Pressable>
            </View>
          )}
        </View>
      ))}

      {microStep === 'hidden' ? (
        <Pressable onPress={() => setMicroStep('choice')} hitSlop={8}>
          <Text style={styles.subtle}>{SavedThreadsCopy.addMomentLink}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export const SavedThreadSinceThenPanel = memo(SavedThreadSinceThenPanelComponent);
