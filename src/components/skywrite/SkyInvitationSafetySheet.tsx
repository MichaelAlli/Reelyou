import { memo } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { SkyInvitationSafetyCopy } from '@/constants/skyInvitationSafetyCopy';
import { Fonts, Radius, Spacing } from '@/constants/theme';

interface SkyInvitationSafetySheetProps {
  visible: boolean;
  learnMoreOpen?: boolean;
  onLearnMoreToggle?: () => void;
  onUnderstand: () => void;
  onClose?: () => void;
  /** When true, sheet is informational only (no gate). */
  readOnly?: boolean;
}

function SkyInvitationSafetySheetComponent({
  visible,
  learnMoreOpen = false,
  onLearnMoreToggle,
  onUnderstand,
  onClose,
  readOnly = false,
}: SkyInvitationSafetySheetProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose ?? onUnderstand}>
      <View style={styles.backdrop}>
        <View style={styles.sheet} accessibilityViewIsModal>
          <ScrollView contentContainerStyle={styles.scroll}>
            <Text style={styles.title}>{SkyInvitationSafetyCopy.title}</Text>
            <Text style={styles.body}>{SkyInvitationSafetyCopy.body}</Text>
            {learnMoreOpen ? (
              <>
                <Text style={styles.learnTitle}>{SkyInvitationSafetyCopy.aboutTitle}</Text>
                <Text style={styles.body}>{SkyInvitationSafetyCopy.aboutBody}</Text>
              </>
            ) : null}
          </ScrollView>
          {!readOnly ? (
            <Pressable
              style={styles.primary}
              accessibilityRole="button"
              accessibilityLabel={SkyInvitationSafetyCopy.primaryCta}
              onPress={onUnderstand}>
              <Text style={styles.primaryText}>{SkyInvitationSafetyCopy.primaryCta}</Text>
            </Pressable>
          ) : null}
          {onLearnMoreToggle ? (
            <Pressable
              style={styles.secondary}
              accessibilityRole="button"
              accessibilityLabel={SkyInvitationSafetyCopy.learnMore}
              onPress={onLearnMoreToggle}>
              <Text style={styles.secondaryText}>
                {learnMoreOpen ? 'Close details' : SkyInvitationSafetyCopy.learnMore}
              </Text>
            </Pressable>
          ) : null}
          {readOnly && onClose ? (
            <Pressable style={styles.secondary} onPress={onClose} accessibilityLabel="Close">
              <Text style={styles.secondaryText}>Close</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

export const SkyInvitationSafetySheet = memo(SkyInvitationSafetySheetComponent);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(4, 6, 18, 0.78)',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  sheet: {
    maxHeight: '82%',
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(167, 139, 250, 0.32)',
    backgroundColor: 'rgba(10, 10, 28, 0.96)',
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  scroll: {
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  title: {
    fontFamily: Fonts.sans,
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF8F0',
    textAlign: 'center',
  },
  body: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(248,244,236,0.88)',
    textAlign: 'center',
  },
  learnTitle: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '600',
    color: '#E8C872',
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  primary: {
    minHeight: 48,
    borderRadius: 999,
    backgroundColor: 'rgba(232, 200, 114, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(232, 200, 114, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  primaryText: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    fontWeight: '700',
    color: '#E8C872',
  },
  secondary: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(248,244,236,0.65)',
  },
});
