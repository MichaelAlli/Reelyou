import { useRouter } from 'expo-router';
import { memo } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { HomePalette } from '@/constants/homeLayout';
import { Fonts } from '@/constants/theme';
import { useReelyouConnect } from '@/connect/ReelyouConnectProvider';
import { navigateReelyouSignal } from '@/signals/navigateReelyouSignal';

interface HomeSignalCenterSheetProps {
  visible: boolean;
  onClose: () => void;
}

function HomeSignalCenterSheetComponent({ visible, onClose }: HomeSignalCenterSheetProps) {
  const router = useRouter();
  const { signals, dismissSignal, presentHomeSignal } = useReelyouConnect();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close signal center" />
      <View style={styles.sheet} testID="home-signal-center">
        <Text style={styles.title}>Signals</Text>
        <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
          {signals.length === 0 ? (
            <Text style={styles.peace}>You&apos;re caught up ✨</Text>
          ) : (
            signals.map((signal) => (
              <Pressable
                key={signal.signalId}
                style={({ pressed }) => [styles.row, pressed && styles.pressed]}
                onPress={() => {
                  presentHomeSignal(signal);
                  navigateReelyouSignal(router, signal);
                  onClose();
                }}
                accessibilityRole="button"
                accessibilityLabel={`${signal.title}. ${signal.description}`}
              >
                <Text style={styles.rowTitle}>{signal.title}</Text>
                <Text style={styles.rowBody} numberOfLines={2}>
                  {signal.description}
                </Text>
                {signal.dismissible ? (
                  <Pressable
                    onPress={(event) => {
                      event.stopPropagation();
                      dismissSignal(signal.signalId);
                    }}
                    accessibilityLabel="Dismiss signal"
                    hitSlop={8}
                  >
                    <Text style={styles.dismiss}>Dismiss</Text>
                  </Pressable>
                ) : null}
              </Pressable>
            ))
          )}
        </ScrollView>
        <Pressable onPress={onClose} style={styles.closeBtn} accessibilityLabel="Done">
          <Text style={styles.closeText}>Done</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(2, 4, 12, 0.55)' },
  sheet: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: '18%',
    maxHeight: '62%',
    borderRadius: 18,
    backgroundColor: 'rgba(8, 10, 28, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(232, 200, 114, 0.22)',
    padding: 16,
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 20,
    color: HomePalette.textPrimary,
    marginBottom: 10,
    textAlign: 'center',
  },
  list: { flexGrow: 0 },
  listContent: { gap: 10, paddingBottom: 8 },
  peace: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: 'rgba(235, 228, 248, 0.78)',
    textAlign: 'center',
    paddingVertical: 24,
  },
  row: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(167, 139, 250, 0.2)',
    padding: 12,
    gap: 4,
  },
  rowTitle: { fontFamily: Fonts.sans, fontSize: 14, fontWeight: '600', color: HomePalette.textPrimary },
  rowBody: { fontFamily: Fonts.sans, fontSize: 12.5, lineHeight: 17, color: 'rgba(235, 228, 248, 0.72)' },
  dismiss: { fontFamily: Fonts.sans, fontSize: 11, color: 'rgba(232, 200, 114, 0.85)', marginTop: 4 },
  pressed: { opacity: 0.9 },
  closeBtn: { alignSelf: 'center', paddingVertical: 10 },
  closeText: { fontFamily: Fonts.sans, fontSize: 14, fontWeight: '600', color: HomePalette.goldBright },
});

export const HomeSignalCenterSheet = memo(HomeSignalCenterSheetComponent);
