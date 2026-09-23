import { useRouter } from 'expo-router';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CalmOverlaySheet } from '@/components/focused-sky/CalmOverlaySheet';
import { SkywriteMediaPreview } from '@/components/skywrite/SkywriteMediaPreview';
import { ContributionBeaconCopy } from '@/constants/contributionBeaconCopy';
import { useOverlayAudioPreviewScope } from '@/skywrite/media/useOverlayAudioPreviewScope';
import { useReelyouConnect } from '@/connect/ReelyouConnectProvider';
import { Fonts, Radius } from '@/constants/theme';
import { CONTRIBUTION_BEACON_BATCH_SIZE } from '@/skywrite/beacon/beaconLifecycleConfig';
import { beaconSignalIdForSkywrite } from '@/skywrite/beacon/skywriteBeaconEligibility';
import type { BeaconEligibleSkywrite } from '@/skywrite/beacon/beaconMatchEngine';
import { resolveSkywriteIntent, SKYWRITE_INTENT_OPTIONS } from '@/skywrite/skywriteIntent';
import { useSkywriteThreads } from '@/skywrite/threads/SkywriteThreadProvider';

type SheetMode = 'card' | 'list';

interface ContributionBeaconQueueSheetProps {
  visible: boolean;
  queue: BeaconEligibleSkywrite[];
  initialIndex?: number;
  onClose: () => void;
  onIndexChange?: (index: number) => void;
  responseSentAck?: boolean;
  onClearResponseSentAck?: () => void;
}

function previewText(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return ContributionBeaconCopy.previewFallback;
  if (trimmed.length <= 140) return trimmed;
  return `${trimmed.slice(0, 137)}…`;
}

function intentChipLabel(entry: BeaconEligibleSkywrite): string {
  const intent = resolveSkywriteIntent(entry.skywrite);
  const found = SKYWRITE_INTENT_OPTIONS.find((option) => option.id === intent);
  return found?.label ?? 'Skywrite';
}

function ContributionBeaconQueueSheetComponent({
  visible,
  queue,
  initialIndex = 0,
  onClose,
  onIndexChange,
  responseSentAck = false,
  onClearResponseSentAck,
}: ContributionBeaconQueueSheetProps) {
  const router = useRouter();
  const { dismissSignal } = useReelyouConnect();
  const { ignoreBeacon } = useSkywriteThreads();
  const [mode, setMode] = useState<SheetMode>('card');
  const [globalIndex, setGlobalIndex] = useState(initialIndex);
  const [batchStart, setBatchStart] = useState(0);
  const audioPreview = useOverlayAudioPreviewScope(visible);

  useEffect(() => {
    if (visible) {
      const clamped = Math.min(Math.max(0, initialIndex), Math.max(0, queue.length - 1));
      setGlobalIndex(clamped);
      setBatchStart(Math.floor(clamped / CONTRIBUTION_BEACON_BATCH_SIZE) * CONTRIBUTION_BEACON_BATCH_SIZE);
      if (responseSentAck) {
        const timer = setTimeout(() => onClearResponseSentAck?.(), 2200);
        return () => clearTimeout(timer);
      }
    }
  }, [initialIndex, onClearResponseSentAck, queue.length, responseSentAck, visible]);

  useEffect(() => {
    if (globalIndex >= queue.length && queue.length > 0) {
      setGlobalIndex(queue.length - 1);
    }
  }, [globalIndex, queue.length]);

  const totalCanonical = queue.length;
  const batchEnd = Math.min(batchStart + CONTRIBUTION_BEACON_BATCH_SIZE, totalCanonical);
  const batchQueue = useMemo(
    () => queue.slice(batchStart, batchEnd),
    [batchEnd, batchStart, queue],
  );
  const indexInBatch = Math.min(Math.max(0, globalIndex - batchStart), Math.max(0, batchQueue.length - 1));
  const current = batchQueue.length > 0 ? batchQueue[indexInBatch] : null;
  const remainingAfterBatch = Math.max(0, totalCanonical - batchEnd);

  const progressLabel = useMemo(
    () =>
      totalCanonical > 0
        ? ContributionBeaconCopy.batchProgress(globalIndex + 1, totalCanonical)
        : '',
    [globalIndex, totalCanonical],
  );

  const notifyIndex = useCallback(
    (next: number) => {
      setGlobalIndex(next);
      onIndexChange?.(next);
    },
    [onIndexChange],
  );

  const handleIgnore = useCallback(
    (skywriteId: string) => {
      ignoreBeacon(skywriteId);
      dismissSignal(beaconSignalIdForSkywrite(skywriteId));
    },
    [dismissSignal, ignoreBeacon],
  );

  const loadNextBatch = useCallback(() => {
    const nextStart = batchEnd;
    if (nextStart >= totalCanonical) return;
    setBatchStart(nextStart);
    notifyIndex(nextStart);
  }, [batchEnd, notifyIndex, totalCanonical]);

  const handleClose = useCallback(() => {
    void audioPreview.stopAll();
    onClose();
  }, [audioPreview, onClose]);

  const handleRespond = useCallback(
    (skywriteId: string) => {
      void audioPreview.stopAll();
      onClose();
      router.push(`/skywrite/${skywriteId}?source=beacon&returnTo=invitations` as never);
    },
    [audioPreview, onClose, router],
  );

  const handleSelectFromList = useCallback(
    (listIndex: number) => {
      notifyIndex(listIndex);
      setMode('card');
    },
    [notifyIndex],
  );

  return (
    <CalmOverlaySheet visible={visible} onClose={handleClose} backdropLabel={ContributionBeaconCopy.close}>
      <View style={styles.sheet}>
        <Text style={styles.title}>{ContributionBeaconCopy.sheetTitle}</Text>
        <Text style={styles.subtitle}>{ContributionBeaconCopy.sheetSubtitle}</Text>
        {responseSentAck ? (
          <Text style={styles.sentAck}>{ContributionBeaconCopy.responseSentAck}</Text>
        ) : null}

        {totalCanonical === 0 ? (
          <View style={styles.caughtUpBlock}>
            <Text style={styles.caughtUpTitle}>{ContributionBeaconCopy.caughtUp}</Text>
            <Text style={styles.caughtUpHint}>{ContributionBeaconCopy.caughtUpHint}</Text>
          </View>
        ) : mode === 'list' ? (
          <>
            <Pressable onPress={() => setMode('card')} style={styles.viewAllLink}>
              <Text style={styles.viewAllText}>{ContributionBeaconCopy.backToCard}</Text>
            </Pressable>
            <ScrollView style={styles.listScroll} contentContainerStyle={styles.listContent}>
              {batchQueue.map((entry, listIndex) => (
                <Pressable
                  key={entry.skywrite.id}
                  style={({ pressed }) => [styles.listRow, pressed && styles.pressed]}
                  onPress={() => handleSelectFromList(batchStart + listIndex)}>
                  <Text style={styles.listArea}>{entry.areaLabel}</Text>
                  <SkywriteMediaPreview
                    skywrite={entry.skywrite}
                    variant="invitationList"
                    excerpt={previewText(entry.skywrite.text)}
                    previewIdPrefix="sky-inv-list"
                    onToggleAudio={audioPreview.togglePreview}
                    isAudioPlaying={audioPreview.isPreviewPlaying}
                  />
                </Pressable>
              ))}
              {remainingAfterBatch > 0 ? (
                <Pressable onPress={loadNextBatch} style={styles.viewAllLink}>
                  <Text style={styles.viewAllText}>
                    {ContributionBeaconCopy.nextBatch(remainingAfterBatch)}
                  </Text>
                </Pressable>
              ) : null}
            </ScrollView>
          </>
        ) : (
          <>
            <View style={styles.progressRow}>
              <Text style={styles.progress}>{progressLabel}</Text>
              {totalCanonical > 1 ? (
                <Pressable onPress={() => setMode('list')} hitSlop={8}>
                  <Text style={styles.viewAllText}>{ContributionBeaconCopy.viewAll}</Text>
                </Pressable>
              ) : null}
            </View>

            {current ? (
              <View style={styles.card}>
                <Text style={styles.areaLabel}>{current.areaLabel}</Text>
                <Text style={styles.contextLine}>
                  {ContributionBeaconCopy.invitationContext(current.areaLabel)}
                </Text>
                <Text style={styles.intentChip}>{intentChipLabel(current)}</Text>
                <SkywriteMediaPreview
                  skywrite={current.skywrite}
                  variant="invitationCard"
                  excerpt={previewText(current.skywrite.text)}
                  previewIdPrefix="sky-inv-card"
                  onToggleAudio={audioPreview.togglePreview}
                  isAudioPlaying={audioPreview.isPreviewPlaying}
                />
                <View style={styles.actions}>
                  <Pressable
                    style={[styles.actionBtn, styles.actionPrimary]}
                    onPress={() => handleRespond(current.skywrite.id)}
                    accessibilityLabel={ContributionBeaconCopy.respond}>
                    <Text style={styles.actionPrimaryText}>{ContributionBeaconCopy.respond}</Text>
                  </Pressable>
                  <Pressable
                    style={styles.actionBtn}
                    onPress={() => handleIgnore(current.skywrite.id)}
                    accessibilityLabel={ContributionBeaconCopy.notForMe}>
                    <Text style={styles.actionText}>{ContributionBeaconCopy.notForMe}</Text>
                  </Pressable>
                </View>
                {totalCanonical > 1 ? (
                  <View style={styles.navRow}>
                    <Pressable
                      disabled={globalIndex <= 0}
                      onPress={() => notifyIndex(Math.max(0, globalIndex - 1))}
                      style={[styles.navBtn, globalIndex <= 0 && styles.navDisabled]}>
                      <Text style={styles.navText}>Previous</Text>
                    </Pressable>
                    {globalIndex < batchEnd - 1 ? (
                      <Pressable
                        onPress={() => notifyIndex(globalIndex + 1)}
                        style={styles.navBtn}>
                        <Text style={styles.navText}>Next</Text>
                      </Pressable>
                    ) : remainingAfterBatch > 0 ? (
                      <Pressable onPress={loadNextBatch} style={styles.navBtn}>
                        <Text style={styles.navText}>
                          {ContributionBeaconCopy.nextBatch(remainingAfterBatch)}
                        </Text>
                      </Pressable>
                    ) : (
                      <Pressable
                        disabled={globalIndex >= totalCanonical - 1}
                        onPress={() => notifyIndex(Math.min(totalCanonical - 1, globalIndex + 1))}
                        style={[
                          styles.navBtn,
                          globalIndex >= totalCanonical - 1 && styles.navDisabled,
                        ]}>
                        <Text style={styles.navText}>Next</Text>
                      </Pressable>
                    )}
                  </View>
                ) : null}
              </View>
            ) : null}
          </>
        )}

        <Pressable onPress={handleClose} style={styles.closeBtn} accessibilityLabel={ContributionBeaconCopy.close}>
          <Text style={styles.closeText}>{ContributionBeaconCopy.close}</Text>
        </Pressable>
      </View>
    </CalmOverlaySheet>
  );
}

export const ContributionBeaconQueueSheet = memo(ContributionBeaconQueueSheetComponent);

const styles = StyleSheet.create({
  sheet: {
    borderRadius: 18,
    backgroundColor: 'rgba(8, 10, 28, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(232, 200, 114, 0.22)',
    padding: 16,
    maxHeight: '100%',
  },
  sentAck: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    lineHeight: 17,
    color: 'rgba(167, 239, 180, 0.82)',
    textAlign: 'center',
    marginBottom: 8,
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 19,
    color: '#F5F0FF',
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: Fonts.sans,
    fontSize: 12.5,
    lineHeight: 18,
    color: 'rgba(235,228,248,0.65)',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  progress: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: 'rgba(235,228,248,0.55)',
    textTransform: 'uppercase',
  },
  viewAllLink: { marginBottom: 8 },
  viewAllText: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: 'rgba(232, 200, 114, 0.75)',
    textDecorationLine: 'underline',
  },
  card: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(167, 139, 250, 0.28)',
    backgroundColor: 'rgba(12, 10, 28, 0.55)',
    padding: 14,
    gap: 8,
  },
  areaLabel: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: '#E8C872',
  },
  contextLine: {
    fontFamily: Fonts.sans,
    fontSize: 12.5,
    lineHeight: 18,
    color: 'rgba(235,228,248,0.72)',
  },
  intentChip: {
    alignSelf: 'flex-start',
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: 'rgba(235,228,248,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.25)',
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  preview: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    color: '#F5F0FF',
  },
  actions: { flexDirection: 'row', gap: 10, marginTop: 6 },
  actionBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(232, 200, 114, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionPrimary: {
    backgroundColor: 'rgba(232, 200, 114, 0.14)',
  },
  actionPrimaryText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '700',
    color: '#E8C872',
  },
  actionText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(235,228,248,0.78)',
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  navBtn: {
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  navDisabled: { opacity: 0.35 },
  navText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: 'rgba(232, 200, 114, 0.8)',
  },
  listScroll: { maxHeight: 280 },
  listContent: { gap: 8 },
  listRow: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(167, 139, 250, 0.22)',
    padding: 10,
    gap: 4,
  },
  listArea: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '700',
    color: '#E8C872',
    textTransform: 'uppercase',
  },
  listPreview: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(235,228,248,0.85)',
  },
  pressed: { opacity: 0.88 },
  caughtUpBlock: { paddingVertical: 28, gap: 8 },
  caughtUpTitle: {
    fontFamily: Fonts.serif,
    fontSize: 18,
    color: '#F5F0FF',
    textAlign: 'center',
  },
  caughtUpHint: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(235,228,248,0.62)',
    textAlign: 'center',
  },
  closeBtn: {
    marginTop: 14,
    alignSelf: 'center',
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  closeText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '600',
    color: '#E8C872',
  },
});
