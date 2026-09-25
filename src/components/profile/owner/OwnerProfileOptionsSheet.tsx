import { memo } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { isDevRuntime } from '@/constants/devFlags';
import { HomePalette } from '@/constants/homeLayout';
import { Fonts } from '@/constants/theme';

interface OwnerProfileOptionsSheetProps {
  visible: boolean;
  onClose: () => void;
  onPreviewProfile: () => void;
  onPreviewProfileConnectedSky?: () => void;
  onPreviewDemoVisitor?: () => void;
}

function OwnerProfileOptionsSheetComponent({
  visible,
  onClose,
  onPreviewProfile,
  onPreviewProfileConnectedSky,
  onPreviewDemoVisitor,
}: OwnerProfileOptionsSheetProps) {
  const run = (action: () => void) => {
    onClose();
    action();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close menu" />
      <View style={styles.sheet} testID="owner-profile-options">
        <MenuRow
          label="Preview profile"
          hint="Public visitor"
          onPress={() => run(onPreviewProfile)}
        />
        {isDevRuntime() && onPreviewProfileConnectedSky ? (
          <MenuRow
            label="Preview as Connected Sky"
            onPress={() => run(onPreviewProfileConnectedSky)}
          />
        ) : null}
        {isDevRuntime() && onPreviewDemoVisitor ? (
          <MenuRow
            label="Open demo visitor profile"
            hint="Jordan"
            onPress={() => run(onPreviewDemoVisitor)}
          />
        ) : null}
        <Pressable onPress={onClose} accessibilityLabel="Close menu" style={styles.done}>
          <Text style={styles.doneText}>Close</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

function MenuRow({
  label,
  hint,
  onPress,
}: {
  label: string;
  hint?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={hint ? `${label}. ${hint}` : label}
    >
      <Text style={styles.rowText}>{label}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </Pressable>
  );
}

export const OwnerProfileOptionsSheet = memo(OwnerProfileOptionsSheetComponent);

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(2, 4, 12, 0.55)' },
  sheet: {
    position: 'absolute',
    right: 16,
    top: 72,
    width: 260,
    borderRadius: 16,
    backgroundColor: 'rgba(8, 10, 28, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(232, 200, 114, 0.22)',
    paddingVertical: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
    gap: 8,
  },
  rowText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '600',
    color: HomePalette.textPrimary,
    flex: 1,
  },
  hint: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: 'rgba(235, 228, 248, 0.55)',
  },
  pressed: { opacity: 0.88 },
  done: { alignItems: 'center', paddingVertical: 10 },
  doneText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(235, 228, 248, 0.65)',
  },
});
