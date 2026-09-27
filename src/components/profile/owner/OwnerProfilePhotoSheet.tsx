import { memo } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { ProfilePhotoCropEditor } from '@/components/profile/owner/ProfilePhotoCropEditor';
import { HomePalette } from '@/constants/homeLayout';
import { Fonts } from '@/constants/theme';
import type {
  ProfilePhotoCropImageSize,
  ProfilePhotoCropTransform,
} from '@/identity/profilePhotoCropTypes';

interface OwnerProfilePhotoSheetProps {
  visible: boolean;
  displayName: string;
  hasPhoto: boolean;
  previewUri: string | null;
  imageSize: ProfilePhotoCropImageSize | null;
  cropTransform: ProfilePhotoCropTransform;
  feedback: string | null;
  saving?: boolean;
  onClose: () => void;
  onChooseLibrary: () => void;
  onTakePhoto: () => void;
  onSavePreview: () => void;
  onDiscardPreview: () => void;
  onRemovePhoto: () => void;
  onImageSize: (size: ProfilePhotoCropImageSize) => void;
  onCropTransformChange: (next: ProfilePhotoCropTransform) => void;
  onResetCrop: () => void;
}

function OwnerProfilePhotoSheetComponent({
  visible,
  displayName,
  hasPhoto,
  previewUri,
  imageSize,
  cropTransform,
  feedback,
  saving = false,
  onClose,
  onChooseLibrary,
  onTakePhoto,
  onSavePreview,
  onDiscardPreview,
  onRemovePhoto,
  onImageSize,
  onCropTransformChange,
  onResetCrop,
}: OwnerProfilePhotoSheetProps) {
  const showCamera = Platform.OS !== 'web';
  const inPreview = Boolean(previewUri);

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable
          style={styles.backdropDismiss}
          accessibilityRole="button"
          accessibilityLabel="Close profile picture options"
          onPress={onClose}
        />
        <View style={styles.sheet} accessibilityViewIsModal>
          <Text style={styles.title}>
            {inPreview ? 'Adjust profile picture' : hasPhoto ? 'Change profile picture' : 'Add profile picture'}
          </Text>
          {!inPreview ? (
            <Text style={styles.subtitle}>Profile picture for {displayName}</Text>
          ) : (
            <Text style={styles.subtitle}>Drag to reposition · use +/− to zoom</Text>
          )}

          {inPreview && previewUri ? (
            <ProfilePhotoCropEditor
              sourceUri={previewUri}
              imageSize={imageSize}
              transform={cropTransform}
              onImageSize={onImageSize}
              onTransformChange={onCropTransformChange}
              onReset={onResetCrop}
              accessibilityLabel={`Adjust profile picture for ${displayName}`}
            />
          ) : null}

          {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}

          {inPreview ? (
            <>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Save profile picture"
                onPress={onSavePreview}
                disabled={saving}
                style={[styles.primary, saving ? styles.primaryDisabled : null]}>
                <Text style={styles.primaryText}>{saving ? 'Saving…' : 'Save'}</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Choose a different photo"
                onPress={onDiscardPreview}
                style={styles.option}>
                <Text style={styles.optionText}>Choose different photo</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Choose photo from library"
                onPress={onChooseLibrary}
                style={styles.option}>
                <Text style={styles.optionText}>Choose from library</Text>
              </Pressable>
              {showCamera ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Take photo"
                  onPress={onTakePhoto}
                  style={styles.option}>
                  <Text style={styles.optionText}>Take photo</Text>
                </Pressable>
              ) : null}
              {hasPhoto ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Remove profile picture"
                  onPress={onRemovePhoto}
                  style={styles.destructive}>
                  <Text style={styles.destructiveText}>Remove photo</Text>
                </Pressable>
              ) : null}
            </>
          )}

          <Pressable accessibilityRole="button" accessibilityLabel="Cancel" onPress={onClose} style={styles.cancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export const OwnerProfilePhotoSheet = memo(OwnerProfilePhotoSheetComponent);

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
    fontSize: 15,
    fontWeight: '600',
    color: HomePalette.textPrimary,
  },
  subtitle: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: 'rgba(235, 228, 248, 0.62)',
    marginBottom: 4,
  },
  feedback: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    lineHeight: 17,
    color: '#F4A4A4',
    textAlign: 'center',
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
  primary: {
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(232, 200, 114, 0.14)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232, 200, 114, 0.42)',
  },
  primaryDisabled: {
    opacity: 0.55,
  },
  primaryText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '700',
    color: HomePalette.gold,
  },
  destructive: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  destructiveText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(244, 164, 164, 0.92)',
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
