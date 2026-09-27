import { memo } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { HomePalette } from '@/constants/homeLayout';
import { SkywriteCopy } from '@/constants/skywriteCopy';
import { Fonts } from '@/constants/theme';

interface SkywriteVideoSourceSheetProps {
  visible: boolean;
  onChooseLibrary: () => void;
  onRecordVideo: () => void;
  onCancel: () => void;
}

function SkywriteVideoSourceSheetComponent({
  visible,
  onChooseLibrary,
  onRecordVideo,
  onCancel,
}: SkywriteVideoSourceSheetProps) {
  const showCamera = Platform.OS !== 'web';

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <Pressable
          style={styles.backdropDismiss}
          accessibilityRole="button"
          accessibilityLabel="Cancel"
          onPress={onCancel}
        />
        <View style={styles.sheet} accessibilityViewIsModal>
          <Text style={styles.title}>{SkywriteCopy.videoSourceTitle}</Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Choose video from library"
            onPress={onChooseLibrary}
            style={styles.option}>
            <Text style={styles.optionText}>{SkywriteCopy.videoChooseLibrary}</Text>
          </Pressable>

          {showCamera ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Record video"
              onPress={onRecordVideo}
              style={styles.option}>
              <Text style={styles.optionText}>{SkywriteCopy.videoRecord}</Text>
            </Pressable>
          ) : null}

          <Pressable accessibilityRole="button" accessibilityLabel="Cancel" onPress={onCancel} style={styles.cancel}>
            <Text style={styles.cancelText}>{SkywriteCopy.cancel}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export const SkywriteVideoSourceSheet = memo(SkywriteVideoSourceSheetComponent);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(4, 6, 18, 0.72)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  backdropDismiss: {
    ...StyleSheet.absoluteFill,
  },
  sheet: {
    zIndex: 1,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(167, 139, 250, 0.28)',
    backgroundColor: 'rgba(10, 10, 28, 0.96)',
    padding: 16,
    gap: 8,
  },
  title: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '600',
    color: HomePalette.textPrimary,
    marginBottom: 4,
  },
  option: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(167, 139, 250, 0.22)',
    backgroundColor: 'rgba(8, 8, 24, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  optionText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(235, 228, 248, 0.88)',
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
