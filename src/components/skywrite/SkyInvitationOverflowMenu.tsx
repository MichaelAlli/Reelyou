import { memo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { Fonts } from '@/constants/theme';

interface SkyInvitationOverflowMenuProps {
  onAboutSafety: () => void;
}

function SkyInvitationOverflowMenuComponent({ onAboutSafety }: SkyInvitationOverflowMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        style={styles.trigger}
        accessibilityRole="button"
        accessibilityLabel="Sky Invitation options"
        onPress={() => setOpen(true)}>
        <Text style={styles.icon}>⋮</Text>
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} accessibilityLabel="Close menu" />
        <View style={styles.sheet}>
          <Pressable
            style={styles.row}
            accessibilityRole="button"
            accessibilityLabel="About perspectives and safety"
            onPress={() => {
              setOpen(false);
              onAboutSafety();
            }}>
            <Text style={styles.rowText}>About perspectives & safety</Text>
          </Pressable>
          <Pressable style={styles.cancel} onPress={() => setOpen(false)} accessibilityLabel="Cancel">
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </View>
      </Modal>
    </>
  );
}

export const SkyInvitationOverflowMenu = memo(SkyInvitationOverflowMenuComponent);

const styles = StyleSheet.create({
  trigger: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
  },
  icon: {
    fontSize: 22,
    fontWeight: '700',
    color: 'rgba(248,244,236,0.78)',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(4, 6, 18, 0.55)',
  },
  sheet: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: 72,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(167, 139, 250, 0.28)',
    backgroundColor: 'rgba(10, 10, 28, 0.96)',
    padding: 12,
    gap: 4,
  },
  row: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  rowText: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(248,244,236,0.9)',
  },
  cancel: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: 'rgba(248,244,236,0.55)',
  },
});
