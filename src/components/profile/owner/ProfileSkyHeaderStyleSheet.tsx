import { memo, useCallback, useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { HomePalette } from '@/constants/homeLayout';
import { Fonts } from '@/constants/theme';
import { currentUser } from '@/data/mockData';
import {
  loadSkyHeaderStyleId,
  saveSkyHeaderStyleId,
} from '@/profile/skyHeaderStylePersistence';
import {
  SKY_HEADER_STYLE_OPTIONS,
  type SkyHeaderStyleId,
} from '@/profile/skyHeaderStyleTypes';
import { SkywriteSkyOwnerHeader } from '@/components/skywrite/SkywriteSkyOwnerHeader';

interface ProfileSkyHeaderStyleSheetProps {
  visible: boolean;
  displayName: string;
  onClose: () => void;
  onSaved?: (styleId: SkyHeaderStyleId) => void;
}

function ProfileSkyHeaderStyleSheetComponent({
  visible,
  displayName,
  onClose,
  onSaved,
}: ProfileSkyHeaderStyleSheetProps) {
  const [selected, setSelected] = useState<SkyHeaderStyleId>('starlight');

  useEffect(() => {
    if (!visible) return;
    void loadSkyHeaderStyleId(currentUser.id).then(setSelected);
  }, [visible]);

  const save = useCallback(
    (styleId: SkyHeaderStyleId) => {
      setSelected(styleId);
      void saveSkyHeaderStyleId(currentUser.id, styleId);
      onSaved?.(styleId);
    },
    [onSaved],
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close" />
      <View style={styles.sheet}>
        <Text style={styles.title}>Sky header style</Text>
        <Text style={styles.subtitle}>How your name appears on Skywrite Sky and Explore.</Text>
        <View style={styles.preview}>
          <SkywriteSkyOwnerHeader
            displayName={displayName}
            headerStyleId={selected}
            onPressProfile={() => {}}
          />
        </View>
        {SKY_HEADER_STYLE_OPTIONS.map((option) => {
          const active = option.id === selected;
          return (
            <Pressable
              key={option.id}
              onPress={() => save(option.id)}
              style={({ pressed }) => [
                styles.row,
                active && styles.rowActive,
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}>
              <Text style={styles.rowLabel}>{option.label}</Text>
              <Text style={styles.rowHint}>{option.description}</Text>
            </Pressable>
          );
        })}
        <Pressable onPress={onClose} style={styles.done}>
          <Text style={styles.doneText}>Done</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

export const ProfileSkyHeaderStyleSheet = memo(ProfileSkyHeaderStyleSheetComponent);

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(2, 4, 12, 0.55)' },
  sheet: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(8, 10, 28, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(232, 200, 114, 0.22)',
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 8,
  },
  title: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    fontWeight: '700',
    color: HomePalette.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    lineHeight: 17,
    color: 'rgba(235, 228, 248, 0.62)',
    textAlign: 'center',
    marginBottom: 4,
  },
  preview: {
    paddingVertical: 8,
    marginBottom: 4,
  },
  row: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(167, 139, 250, 0.18)',
    gap: 2,
  },
  rowActive: {
    borderColor: 'rgba(232, 200, 114, 0.45)',
    backgroundColor: 'rgba(232, 200, 114, 0.08)',
  },
  rowLabel: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '600',
    color: '#F5F0FF',
  },
  rowHint: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    lineHeight: 15,
    color: 'rgba(235, 228, 248, 0.55)',
  },
  pressed: { opacity: 0.9 },
  done: { alignItems: 'center', paddingVertical: 10 },
  doneText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '600',
    color: '#E8C872',
  },
});
