import { memo, useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CalmOverlaySheet } from '@/components/focused-sky/CalmOverlaySheet';
import { SkywriteLibraryMediaCard } from '@/components/skywrite/SkywriteLibraryMediaCard';
import { SkywritePlayCopy } from '@/constants/skywritePlayCopy';
import { MySkywritesCopy } from '@/constants/mySkywritesCopy';
import { Fonts, Radius } from '@/constants/theme';
import { usePersonalJourney } from '@/journey/PersonalJourneyProvider';
import { useOnboarding } from '@/onboarding';
import { buildYourJourneyLibraryRows } from '@/skywrite/library/buildMySkywritesLibrary';
import { useSkywriteLibrary } from '@/skywrite/library/SkywriteLibraryProvider';
import { reorderIds } from '@/skywrite/play/skywritePlayLogic';

interface JourneySequenceEditorSheetProps {
  visible: boolean;
  onClose: () => void;
}

function JourneySequenceEditorSheetComponent({ visible, onClose }: JourneySequenceEditorSheetProps) {
  const { skywrites } = useOnboarding();
  const { library } = useSkywriteLibrary();
  const { settings, saveOrderedSkywriteIds } = usePersonalJourney();
  const [saving, setSaving] = useState(false);
  const [localOrder, setLocalOrder] = useState<string[]>([]);

  const journeyRows = useMemo(
    () => buildYourJourneyLibraryRows({ localPosts: skywrites, library }),
    [library, skywrites],
  );

  const defaultIds = useMemo(() => journeyRows.map((row) => row.skywriteId), [journeyRows]);

  const orderedIds = useMemo(() => {
    if (localOrder.length > 0) return localOrder;
    if (settings.orderedSkywriteIds.length > 0) {
      return [
        ...settings.orderedSkywriteIds.filter((id) => defaultIds.includes(id)),
        ...defaultIds.filter((id) => !settings.orderedSkywriteIds.includes(id)),
      ];
    }
    return defaultIds;
  }, [defaultIds, localOrder, settings.orderedSkywriteIds]);

  const titleFor = useCallback(
    (skywriteId: string) => {
      const row = journeyRows.find((entry) => entry.skywriteId === skywriteId);
      return row?.excerpt ?? 'Skywrite moment';
    },
    [journeyRows],
  );

  const applyOrder = useCallback((next: string[]) => {
    setLocalOrder(next);
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    const ok = await saveOrderedSkywriteIds(orderedIds);
    setSaving(false);
    if (ok) {
      setLocalOrder([]);
      onClose();
    }
  }, [onClose, orderedIds, saveOrderedSkywriteIds]);

  return (
    <CalmOverlaySheet visible={visible} onClose={onClose} backdropLabel={SkywritePlayCopy.close}>
      <View style={styles.panel}>
        <Text style={styles.title}>{MySkywritesCopy.editJourneyTitle}</Text>
        <Text style={styles.hint}>{MySkywritesCopy.editJourneyHint}</Text>
        {journeyRows.length === 0 ? (
          <Text style={styles.empty}>{MySkywritesCopy.journeyLibraryEmpty}</Text>
        ) : (
          <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
            {orderedIds.map((skywriteId) => {
              const row = journeyRows.find((entry) => entry.skywriteId === skywriteId);
              if (!row) return null;
              return (
                <View key={skywriteId} style={styles.row}>
                  <SkywriteLibraryMediaCard
                    skywrite={row.skywrite}
                    caption={titleFor(skywriteId)}
                    onPressMedia={() => undefined}
                    style={styles.mediaCard}
                  />
                  <View style={styles.actions}>
                    <Pressable
                      onPress={() => applyOrder(reorderIds(orderedIds, skywriteId, 'up'))}
                      style={styles.actionBtn}>
                      <Text style={styles.actionText}>{SkywritePlayCopy.moveUp}</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => applyOrder(reorderIds(orderedIds, skywriteId, 'down'))}
                      style={styles.actionBtn}>
                      <Text style={styles.actionText}>{SkywritePlayCopy.moveDown}</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}
        <View style={styles.footer}>
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>{SkywritePlayCopy.close}</Text>
          </Pressable>
          {journeyRows.length > 0 ? (
            <Pressable onPress={() => void handleSave()} disabled={saving} style={styles.saveBtn}>
              {saving ? (
                <ActivityIndicator color="#F5E6B8" />
              ) : (
                <Text style={styles.saveText}>{MySkywritesCopy.saveJourneyOrder}</Text>
              )}
            </Pressable>
          ) : null}
        </View>
      </View>
    </CalmOverlaySheet>
  );
}

export const JourneySequenceEditorSheet = memo(JourneySequenceEditorSheetComponent);

const styles = StyleSheet.create({
  panel: {
    borderRadius: 18,
    backgroundColor: 'rgba(8, 10, 28, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(232, 200, 114, 0.22)',
    padding: 16,
    maxHeight: '100%',
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 19,
    color: '#F5F0FF',
    textAlign: 'center',
  },
  hint: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: 'rgba(248, 244, 236, 0.65)',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 12,
  },
  empty: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: 'rgba(248, 244, 236, 0.7)',
    textAlign: 'center',
    paddingVertical: 24,
  },
  list: { maxHeight: 420 },
  listContent: { gap: 12, paddingBottom: 8 },
  row: { gap: 8 },
  mediaCard: { minHeight: 72 },
  actions: { flexDirection: 'row', gap: 8, justifyContent: 'flex-end' },
  actionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(232, 200, 114, 0.25)',
  },
  actionText: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '600',
    color: '#E8C872',
  },
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, gap: 12 },
  closeBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(196, 168, 255, 0.35)',
  },
  closeText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '600',
    color: '#C4A8FF',
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: Radius.md,
    backgroundColor: 'rgba(232, 200, 114, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(232, 200, 114, 0.45)',
  },
  saveText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '700',
    color: '#F5E6B8',
  },
});
