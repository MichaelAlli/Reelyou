import { memo } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Fonts, Radius, Spacing } from '@/constants/theme';
import type { EmergingGroup } from '@/sharedSky/sharedSkyTypes';

interface EmergingGroupSheetProps {
  visible: boolean;
  group: EmergingGroup | null;
  onClose: () => void;
  onJoin?: (group: EmergingGroup) => void;
  onDismiss?: (group: EmergingGroup) => void;
}

function EmergingGroupSheetComponent({
  visible,
  group,
  onClose,
  onJoin,
  onDismiss,
}: EmergingGroupSheetProps) {
  if (!group) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <SafeAreaView style={styles.safe} edges={['bottom']}>
          <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
            <Text style={styles.eyebrow}>{group.joined ? 'Your place' : 'Emerging possibility'}</Text>
            <Text style={styles.title}>{group.title}</Text>
            <Text style={styles.whyTitle}>Why this?</Text>
            <Text style={styles.whyBody}>{group.whyThis}</Text>
            <View style={styles.actions}>
              {!group.joined && onJoin ? (
                <Pressable accessibilityRole="button" style={styles.primary} onPress={() => onJoin(group)}>
                  <Text style={styles.primaryText}>Explore</Text>
                </Pressable>
              ) : null}
              {!group.joined && onDismiss ? (
                <Pressable accessibilityRole="button" style={styles.secondary} onPress={() => onDismiss(group)}>
                  <Text style={styles.secondaryText}>Not now</Text>
                </Pressable>
              ) : null}
              <Pressable accessibilityRole="button" style={styles.secondary} onPress={onClose}>
                <Text style={styles.secondaryText}>Close</Text>
              </Pressable>
            </View>
          </Pressable>
        </SafeAreaView>
      </Pressable>
    </Modal>
  );
}

export const EmergingGroupSheet = memo(EmergingGroupSheetComponent);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(4, 6, 14, 0.62)',
    justifyContent: 'flex-end',
  },
  safe: {
    width: '100%',
  },
  sheet: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
    borderRadius: Radius.lg,
    backgroundColor: 'rgba(10, 12, 26, 0.96)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232, 200, 114, 0.28)',
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  eyebrow: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: 'rgba(232, 200, 114, 0.85)',
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 22,
    color: '#FFF8F0',
  },
  whyTitle: {
    marginTop: Spacing.sm,
    fontFamily: Fonts.sans,
    fontWeight: '600',
    fontSize: 13,
    color: 'rgba(245, 240, 255, 0.9)',
  },
  whyBody: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(235, 228, 248, 0.78)',
  },
  actions: {
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  primary: {
    borderRadius: Radius.md,
    backgroundColor: 'rgba(232, 200, 114, 0.22)',
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryText: {
    fontFamily: Fonts.sans,
    fontWeight: '600',
    color: '#FFF4D6',
  },
  secondary: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  secondaryText: {
    fontFamily: Fonts.sans,
    color: 'rgba(235, 228, 248, 0.75)',
  },
});
