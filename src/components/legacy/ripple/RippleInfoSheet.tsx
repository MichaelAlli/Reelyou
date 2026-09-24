import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { rippleGlass } from '@/components/legacy/ripple/rippleGlass';
import { RippleCopy } from '@/constants/rippleCopy';
import { Fonts, Spacing } from '@/constants/theme';

interface RippleInfoSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function RippleInfoSheet({ visible, onClose }: RippleInfoSheetProps) {
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button">
        <Pressable style={[rippleGlass.panel, styles.sheet]} onPress={(event) => event.stopPropagation()}>
          <Text style={styles.title}>{RippleCopy.infoTitle}</Text>
          <Text style={styles.lead}>{RippleCopy.infoLead}</Text>
          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            {RippleCopy.infoSections.map((section) => (
              <View key={section.heading} style={styles.section}>
                <Text style={styles.heading}>{section.heading}</Text>
                <Text style={styles.body}>{section.body}</Text>
              </View>
            ))}
          </ScrollView>
          <Pressable style={styles.closeBtn} onPress={onClose} accessibilityRole="button">
            <Text style={styles.closeText}>{RippleCopy.infoClose}</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  sheet: {
    maxHeight: '78%',
    padding: Spacing.lg,
    gap: 10,
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 22,
    fontWeight: '600',
    color: '#2D3748',
  },
  lead: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(45, 55, 72, 0.82)',
  },
  scroll: {
    maxHeight: 360,
  },
  section: {
    marginTop: 12,
    gap: 4,
  },
  heading: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '700',
    color: '#4A5568',
  },
  body: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(45, 55, 72, 0.88)',
  },
  closeBtn: {
    alignSelf: 'center',
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    marginTop: 4,
  },
  closeText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '600',
    color: '#7A5A12',
  },
});
