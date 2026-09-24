import { useRouter } from 'expo-router';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { rippleGlass } from '@/components/legacy/ripple/rippleGlass';
import { Fonts, Spacing } from '@/constants/theme';
import type { RippleMetricDetailView } from '@/legacy/buildRippleMetricDetails';

interface RippleMetricDetailSheetProps {
  visible: boolean;
  view: RippleMetricDetailView | null;
  onClose: () => void;
}

export function RippleMetricDetailSheet({ visible, view, onClose }: RippleMetricDetailSheetProps) {
  const router = useRouter();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button">
        <Pressable style={[rippleGlass.panel, styles.sheet]} onPress={(e) => e.stopPropagation()}>
          {view ? (
            <>
              <View style={styles.headerRow}>
                <Text style={styles.title}>{view.title}</Text>
                <Pressable
                  onPress={onClose}
                  style={styles.closeX}
                  accessibilityRole="button"
                  accessibilityLabel="Close">
                  <Text style={styles.closeXText}>✕</Text>
                </Pressable>
              </View>
              <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                {view.rows.length === 0 ? (
                  <View style={styles.empty}>
                    <Text style={styles.emptyTitle}>{view.emptyTitle}</Text>
                    <Text style={styles.emptyBody}>{view.emptyBody}</Text>
                  </View>
                ) : (
                  view.rows.map((row) => (
                    <Pressable
                      key={row.id}
                      style={styles.row}
                      disabled={!row.personUserId}
                      onPress={() => {
                        if (!row.personUserId) return;
                        onClose();
                        router.push(
                          `/legacy/ripple/${encodeURIComponent(row.personUserId)}` as never,
                        );
                      }}>
                      <Text style={styles.rowTitle} numberOfLines={2}>
                        {row.title}
                      </Text>
                      {row.subtitle ? (
                        <Text style={styles.rowSubtitle} numberOfLines={3}>
                          {row.subtitle}
                        </Text>
                      ) : null}
                      {row.meta ? (
                        <Text style={styles.rowMeta} numberOfLines={2}>
                          {row.meta}
                        </Text>
                      ) : null}
                    </Pressable>
                  ))
                )}
              </ScrollView>
              <Pressable onPress={onClose} style={styles.close} accessibilityRole="button">
                <Text style={styles.closeText}>Close</Text>
              </Pressable>
            </>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.42)',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '82%',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    padding: Spacing.lg,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    flex: 1,
    fontFamily: Fonts.serif,
    fontSize: 22,
    fontWeight: '600',
    color: '#2D3748',
  },
  closeX: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: 'rgba(45, 55, 72, 0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(45, 55, 72, 0.18)',
  },
  closeXText: {
    fontFamily: Fonts.sans,
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3748',
  },
  scroll: { maxHeight: 420 },
  row: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(167, 139, 250, 0.2)',
    gap: 4,
  },
  rowTitle: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    fontWeight: '700',
    color: '#2D3748',
  },
  rowSubtitle: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(45, 55, 72, 0.88)',
  },
  rowMeta: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: 'rgba(45, 55, 72, 0.65)',
  },
  empty: { paddingVertical: 28, gap: 8, paddingHorizontal: 8 },
  emptyTitle: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3748',
    textAlign: 'center',
  },
  emptyBody: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(45, 55, 72, 0.78)',
    textAlign: 'center',
  },
  close: {
    alignSelf: 'center',
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  closeText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '600',
    color: '#7A5A12',
  },
});
