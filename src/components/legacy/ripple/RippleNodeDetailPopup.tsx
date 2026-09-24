import { useRouter } from 'expo-router';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { rippleGlass } from '@/components/legacy/ripple/rippleGlass';
import { RippleCopy } from '@/constants/rippleCopy';
import { Fonts, Spacing } from '@/constants/theme';
import type { RippleConnectionDetail } from '@/legacy/buildRippleConnectionDetail';

interface RippleNodeDetailPopupProps {
  visible: boolean;
  detail: RippleConnectionDetail | null;
  onClose: () => void;
  /** When set, offer full connection story route (owner flow). */
  fullStoryHref?: string | null;
}

function formatDate(ms: number): string {
  try {
    return new Date(ms).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

export function RippleNodeDetailPopup({
  visible,
  detail,
  onClose,
  fullStoryHref,
}: RippleNodeDetailPopupProps) {
  const router = useRouter();

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button">
        <Pressable
          style={[rippleGlass.panel, styles.sheet]}
          onPress={(event) => event.stopPropagation()}>
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {detail?.displayName ?? RippleCopy.connectionTitle}
            </Text>
            <Pressable
              onPress={onClose}
              style={styles.closeX}
              accessibilityRole="button"
              accessibilityLabel="Close">
              <Text style={styles.closeXText}>✕</Text>
            </Pressable>
          </View>
          {detail ? (
            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
              {detail.isDirectImpact ? (
                <Text style={styles.tag}>Direct impact — counts toward Lives Impacted</Text>
              ) : null}
              {detail.isDownstreamRipple ? (
                <Text style={styles.tagRipple}>Downstream ripple — extended relationship</Text>
              ) : null}
              {detail.impactEvents.slice(0, 4).map((event) => (
                <View key={event.impactEventId} style={styles.row}>
                  <Text style={styles.rowTitle}>Meaningful impact</Text>
                  <Text style={styles.rowBody}>
                    {event.context?.trim() || 'Meaningful impact recorded.'}
                  </Text>
                  <Text style={styles.rowMeta}>{formatDate(event.createdAt)}</Text>
                </View>
              ))}
              {fullStoryHref ? (
                <Pressable
                  style={styles.storyLink}
                  onPress={() => {
                    onClose();
                    router.push(fullStoryHref as never);
                  }}>
                  <Text style={styles.storyLinkText}>View connection story</Text>
                </Pressable>
              ) : null}
            </ScrollView>
          ) : (
            <Text style={styles.unavailable}>Connection details are unavailable.</Text>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: 88,
  },
  sheet: {
    maxHeight: '72%',
    padding: Spacing.md,
    gap: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    minHeight: 44,
  },
  headerTitle: {
    flex: 1,
    fontFamily: Fonts.serif,
    fontSize: 20,
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
  scroll: { maxHeight: 360 },
  tag: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '600',
    color: '#8B5A2B',
    marginBottom: 4,
  },
  tagRipple: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '600',
    color: '#6B5A9E',
    marginBottom: 4,
  },
  row: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(167, 139, 250, 0.2)',
    gap: 4,
  },
  rowTitle: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(45, 55, 72, 0.65)',
  },
  rowBody: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 19,
    color: '#2D3748',
  },
  rowMeta: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: 'rgba(45, 55, 72, 0.55)',
  },
  storyLink: {
    marginTop: 12,
    alignSelf: 'center',
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },
  storyLinkText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '600',
    color: '#7A5A12',
  },
  unavailable: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: 'rgba(45, 55, 72, 0.78)',
    paddingVertical: 12,
  },
});
