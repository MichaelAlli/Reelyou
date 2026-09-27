import { memo } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { HomePalette } from '@/constants/homeLayout';
import { Fonts } from '@/constants/theme';

interface HomeProfileAvatarActionSheetProps {
  visible: boolean;
  onClose: () => void;
  onChangePhoto: () => void;
  onViewProfile: () => void;
}

function HomeProfileAvatarActionSheetComponent({
  visible,
  onClose,
  onChangePhoto,
  onViewProfile,
}: HomeProfileAvatarActionSheetProps) {
  const run = (action: () => void) => {
    onClose();
    action();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable
          style={styles.backdropDismiss}
          accessibilityRole="button"
          accessibilityLabel="Close profile options"
          onPress={onClose}
        />
        <View style={styles.sheet}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Change profile picture"
            onPress={() => run(onChangePhoto)}
            style={styles.row}>
            <Text style={styles.rowText}>Change profile picture</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="View profile"
            onPress={() => run(onViewProfile)}
            style={styles.row}>
            <Text style={styles.rowText}>View profile</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Cancel" onPress={onClose} style={styles.cancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export const HomeProfileAvatarActionSheet = memo(HomeProfileAvatarActionSheetComponent);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(4, 6, 18, 0.72)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  backdropDismiss: { ...StyleSheet.absoluteFill },
  sheet: {
    zIndex: 1,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(167, 139, 250, 0.28)',
    backgroundColor: 'rgba(10, 10, 28, 0.96)',
    paddingVertical: 8,
  },
  row: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  rowText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '600',
    color: HomePalette.textPrimary,
  },
  cancel: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  cancelText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: 'rgba(235, 228, 248, 0.55)',
  },
});
