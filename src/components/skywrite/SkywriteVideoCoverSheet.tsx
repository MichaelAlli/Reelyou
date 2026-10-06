import { Image } from 'expo-image';
import { memo, useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Fonts, Radius } from '@/constants/theme';
import { MySkywritesCopy } from '@/constants/mySkywritesCopy';
import { parseRemoteAssetIdFromUri } from '@/social/sharedMediaConstants';
import { resolveMediaAccessUrl } from '@/social/sharedMediaApi';
import { captureSkywriteVideoPosterAtMs } from '@/skywrite/publish/captureSkywriteVideoPoster';
import type { SkywriteRecord } from '@/skywrite/types';

interface SkywriteVideoCoverSheetProps {
  visible: boolean;
  record: SkywriteRecord | null;
  onClose: () => void;
  onSave: (seekMs: number) => Promise<boolean>;
}

function SkywriteVideoCoverSheetComponent({
  visible,
  record,
  onClose,
  onSave,
}: SkywriteVideoCoverSheetProps) {
  const [seekMs, setSeekMs] = useState(800);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [playableUri, setPlayableUri] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible || !record?.media.video) {
      setPreviewUri(null);
      setPlayableUri(null);
      return;
    }
    let cancelled = false;
    void (async () => {
      const video = record.media.video!;
      let uri = video.uri ?? null;
      const assetId = video.remoteAssetId ?? parseRemoteAssetIdFromUri(uri ?? undefined);
      if (assetId) {
        const resolved = await resolveMediaAccessUrl(assetId);
        if (resolved) uri = resolved;
      }
      if (!cancelled) setPlayableUri(uri);
    })();
    return () => {
      cancelled = true;
    };
  }, [record, visible]);

  useEffect(() => {
    if (!visible || !playableUri) return;
    let cancelled = false;
    setLoadingPreview(true);
    const timer = setTimeout(() => {
      void captureSkywriteVideoPosterAtMs(playableUri, seekMs).then((uri) => {
        if (cancelled) return;
        setPreviewUri(uri);
        setLoadingPreview(false);
      });
    }, 180);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [playableUri, seekMs, visible]);

  const handleSave = useCallback(async () => {
    if (saving) return;
    setSaving(true);
    const ok = await onSave(seekMs);
    setSaving(false);
    if (ok) onClose();
  }, [onClose, onSave, saving, seekMs]);

  const durationGuessMs = 60_000;
  const sliderMax = durationGuessMs;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>{MySkywritesCopy.editCoverTitle}</Text>
          <Text style={styles.hint}>{MySkywritesCopy.editCoverHint}</Text>
          <View style={styles.previewBox}>
            {loadingPreview || !previewUri ? (
              <ActivityIndicator color="#E8C872" />
            ) : (
              <Image source={{ uri: previewUri }} style={styles.previewImage} contentFit="cover" />
            )}
          </View>
          <View style={styles.sliderRow}>
            <Text style={styles.sliderLabel}>Earlier</Text>
            <View style={styles.sliderTrack}>
              {[0, 0.25, 0.5, 0.75, 1].map((fraction) => (
                <Pressable
                  key={fraction}
                  onPress={() => setSeekMs(Math.round(fraction * sliderMax))}
                  style={[
                    styles.sliderTick,
                    Math.abs(seekMs - fraction * sliderMax) < sliderMax * 0.12 && styles.sliderTickActive,
                  ]}
                />
              ))}
            </View>
            <Text style={styles.sliderLabel}>Later</Text>
          </View>
          <View style={styles.actions}>
            <Pressable onPress={onClose} style={styles.secondaryBtn}>
              <Text style={styles.secondaryText}>Cancel</Text>
            </Pressable>
            <Pressable onPress={() => void handleSave()} disabled={saving} style={styles.primaryBtn}>
              <Text style={styles.primaryText}>{saving ? 'Saving…' : 'Save cover'}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export const SkywriteVideoCoverSheet = memo(SkywriteVideoCoverSheetComponent);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    margin: 12,
    borderRadius: 16,
    padding: 16,
    backgroundColor: 'rgba(8, 10, 28, 0.98)',
    borderWidth: 1,
    borderColor: 'rgba(232, 200, 114, 0.25)',
    gap: 10,
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 18,
    color: '#FFF8F0',
  },
  hint: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255,248,240,0.78)',
  },
  previewBox: {
    width: '100%',
    aspectRatio: 3 / 4,
    maxHeight: 280,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    backgroundColor: 'rgba(12, 14, 28, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImage: { width: '100%', height: '100%' },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sliderLabel: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: 'rgba(255,248,240,0.55)',
  },
  sliderTrack: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  sliderTick: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(255,248,240,0.25)',
  },
  sliderTickActive: {
    backgroundColor: '#E8C872',
    transform: [{ scale: 1.15 }],
  },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 4 },
  secondaryBtn: { paddingHorizontal: 12, paddingVertical: 10 },
  secondaryText: { fontFamily: Fonts.sans, fontSize: 14, color: 'rgba(255,248,240,0.7)' },
  primaryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232, 200, 114, 0.45)',
  },
  primaryText: { fontFamily: Fonts.sans, fontSize: 14, fontWeight: '700', color: '#E8C872' },
});
