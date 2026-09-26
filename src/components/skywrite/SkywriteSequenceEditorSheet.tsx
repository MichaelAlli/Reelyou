import { memo, useCallback, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CalmOverlaySheet } from '@/components/focused-sky/CalmOverlaySheet';
import { SkywritePlayCopy } from '@/constants/skywritePlayCopy';
import { Fonts, Radius } from '@/constants/theme';
import { useOnboarding } from '@/onboarding';
import {
  defaultFocusedSkywriteIds,
  ensureFocusedOrder,
  reorderIds,
  toggleExcluded,
} from '@/skywrite/play/skywritePlayLogic';
import type { FocusedSkyPlaySequenceConfig } from '@/skywrite/play/skywritePlayTypes';

interface SkywriteSequenceEditorSheetProps {
  visible: boolean;
  config: FocusedSkyPlaySequenceConfig;
  onClose: () => void;
  onChange: (next: FocusedSkyPlaySequenceConfig) => void;
}

function SkywriteSequenceEditorSheetComponent({
  visible,
  config,
  onClose,
  onChange,
}: SkywriteSequenceEditorSheetProps) {
  const { skywrites, mySkyView } = useOnboarding();

  const orderedIds = useMemo(() => {
    const defaults = defaultFocusedSkywriteIds(mySkyView.stars, skywrites);
    return ensureFocusedOrder(config, defaults);
  }, [config, mySkyView.stars, skywrites]);

  const excluded = useMemo(() => new Set(config.excludedSkywriteIds), [config.excludedSkywriteIds]);

  const titleFor = useCallback(
    (skywriteId: string) => {
      const post = skywrites.find((entry) => entry.id === skywriteId);
      const trimmed = post?.text.trim();
      if (trimmed) return trimmed.slice(0, 64);
      return post?.mediaMode === 'voice' ? 'Voice moment' : 'Skywrite moment';
    },
    [skywrites],
  );

  return (
    <CalmOverlaySheet visible={visible} onClose={onClose} backdropLabel={SkywritePlayCopy.close}>
      <View style={styles.panel}>
        <Text style={styles.title}>{SkywritePlayCopy.sequenceTitle}</Text>
        <Text style={styles.hint}>{SkywritePlayCopy.sequenceHint}</Text>
        <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
          {orderedIds.map((skywriteId) => {
            const included = !excluded.has(skywriteId);
            return (
              <View key={skywriteId} style={styles.row}>
                <View style={styles.rowMain}>
                  <Text style={[styles.rowTitle, !included && styles.rowMuted]} numberOfLines={2}>
                    {titleFor(skywriteId)}
                  </Text>
                  <Text style={styles.rowState}>{included ? 'In play' : 'Skipped'}</Text>
                </View>
                <View style={styles.actions}>
                  <Pressable
                    onPress={() =>
                      onChange({
                        ...config,
                        orderedSkywriteIds: reorderIds(orderedIds, skywriteId, 'up'),
                      })
                    }
                    style={styles.actionBtn}>
                    <Text style={styles.actionText}>{SkywritePlayCopy.moveUp}</Text>
                  </Pressable>
                  <Pressable
                    onPress={() =>
                      onChange({
                        ...config,
                        orderedSkywriteIds: reorderIds(orderedIds, skywriteId, 'down'),
                      })
                    }
                    style={styles.actionBtn}>
                    <Text style={styles.actionText}>{SkywritePlayCopy.moveDown}</Text>
                  </Pressable>
                  <Pressable
                    onPress={() =>
                      onChange({
                        ...config,
                        excludedSkywriteIds: toggleExcluded(config.excludedSkywriteIds, skywriteId),
                      })
                    }
                    style={styles.actionBtn}>
                    <Text style={styles.actionText}>
                      {included ? SkywritePlayCopy.exclude : SkywritePlayCopy.include}
                    </Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </ScrollView>
        <Pressable onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeText}>{SkywritePlayCopy.close}</Text>
        </Pressable>
      </View>
    </CalmOverlaySheet>
  );
}

export const SkywriteSequenceEditorSheet = memo(SkywriteSequenceEditorSheetComponent);

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
    lineHeight: 17,
    color: 'rgba(235,228,248,0.62)',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 12,
  },
  list: { maxHeight: 340 },
  listContent: { gap: 10 },
  row: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(167, 139, 250, 0.22)',
    padding: 10,
    gap: 8,
  },
  rowMain: { gap: 4 },
  rowTitle: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 19,
    color: '#FFF8F0',
  },
  rowMuted: { color: 'rgba(248,244,236,0.45)' },
  rowState: {
    fontFamily: Fonts.sans,
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(232, 200, 114, 0.75)',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  actionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(232, 200, 114, 0.25)',
  },
  actionText: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '600',
    color: '#E8C872',
  },
  closeBtn: {
    marginTop: 12,
    alignSelf: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  closeText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '600',
    color: '#E8C872',
  },
});
