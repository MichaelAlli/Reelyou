import { memo } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SkywritePlaybackAudioMixControls } from '@/components/skywrite/SkywritePlaybackAudioMixControls';
import { Fonts, Radius } from '@/constants/theme';
import type { SkywriteMedia } from '@/skywrite/types';

interface SkywriteAudioMixBottomSheetProps {
  visible: boolean;
  media: SkywriteMedia;
  onChange: (media: SkywriteMedia) => void;
  onClose: () => void;
}

function SkywriteAudioMixBottomSheetComponent({
  visible,
  media,
  onChange,
  onClose,
}: SkywriteAudioMixBottomSheetProps) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const maxSheetHeight = Math.min(height * 0.55, 420);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close audio mix" />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 12), maxHeight: maxSheetHeight }]}>
        <View style={styles.handleRow}>
          <View style={styles.handle} />
          <Pressable onPress={onClose} hitSlop={12} accessibilityRole="button" accessibilityLabel="Done">
            <Text style={styles.done}>Done</Text>
          </Pressable>
        </View>
        <Text style={styles.title}>Audio mix</Text>
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <SkywritePlaybackAudioMixControls media={media} onChange={onChange} compact />
        </ScrollView>
      </View>
    </Modal>
  );
}

export const SkywriteAudioMixBottomSheet = memo(SkywriteAudioMixBottomSheetComponent);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 5, 8, 0.55)',
  },
  sheet: {
    backgroundColor: 'rgba(12, 10, 32, 0.98)',
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(167, 139, 250, 0.28)',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  handleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(248, 244, 236, 0.28)',
    position: 'absolute',
    left: '50%',
    marginLeft: -18,
  },
  done: {
    marginLeft: 'auto',
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '700',
    color: '#E8C872',
    minHeight: 44,
    textAlignVertical: 'center',
  },
  title: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF8F0',
    marginBottom: 8,
  },
});
