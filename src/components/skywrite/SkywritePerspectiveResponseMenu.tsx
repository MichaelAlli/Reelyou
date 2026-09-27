import { memo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { Fonts } from '@/constants/theme';

interface SkywritePerspectiveResponseMenuProps {
  onReport: () => void;
}

function SkywritePerspectiveResponseMenuComponent({ onReport }: SkywritePerspectiveResponseMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        style={styles.menuBtn}
        accessibilityRole="button"
        accessibilityLabel="Response options"
        onPress={() => setOpen(true)}>
        <Text style={styles.menuIcon}>⋮</Text>
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} accessibilityLabel="Close menu" />
        <View style={styles.sheet}>
          <Pressable
            style={styles.row}
            accessibilityRole="button"
            accessibilityLabel="Report response"
            onPress={() => {
              setOpen(false);
              onReport();
            }}>
            <Text style={styles.rowText}>Report response</Text>
          </Pressable>
          <Pressable style={styles.cancel} onPress={() => setOpen(false)} accessibilityLabel="Cancel">
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </View>
      </Modal>
    </>
  );
}

export const SkywritePerspectiveResponseMenu = memo(SkywritePerspectiveResponseMenuComponent);

const styles = StyleSheet.create({
  menuBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: {
    fontSize: 20,
    color: 'rgba(248,244,236,0.75)',
    fontWeight: '700',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(4, 6, 18, 0.55)',
  },
  sheet: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 32,
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
