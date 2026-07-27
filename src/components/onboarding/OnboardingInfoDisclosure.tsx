import { memo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { OnboardingPrivacyCopy } from '@/constants/onboardingProfileCopy';
import { OnboardingProfileLayout } from '@/constants/onboardingProfileLayout';
import { Fonts } from '@/constants/theme';

interface OnboardingInfoDisclosureProps {
  linkLabel: string;
}

function OnboardingInfoDisclosureComponent({ linkLabel }: OnboardingInfoDisclosureProps) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={linkLabel}
        onPress={() => setVisible(true)}
        hitSlop={8}>
        <Text style={styles.link}>{linkLabel}</Text>
      </Pressable>

      <Modal
        animationType="fade"
        transparent
        visible={visible}
        onRequestClose={() => setVisible(false)}>
        <View style={styles.backdrop}>
          <View style={styles.panel}>
            <Text style={styles.title}>{OnboardingPrivacyCopy.title}</Text>
            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
              {OnboardingPrivacyCopy.body.map((paragraph) => (
                <Text key={paragraph} style={styles.body}>
                  {paragraph}
                </Text>
              ))}
            </ScrollView>
            <Pressable
              accessibilityRole="button"
              onPress={() => setVisible(false)}
              style={({ pressed }) => [styles.closeButton, pressed && { opacity: 0.88 }]}>
              <Text style={styles.closeLabel}>{OnboardingPrivacyCopy.close}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

export const OnboardingInfoDisclosure = memo(OnboardingInfoDisclosureComponent);

const styles = StyleSheet.create({
  link: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '600',
    color: OnboardingProfileLayout.infoLinkColor,
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(2, 4, 14, 0.72)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  panel: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    backgroundColor: 'rgba(8, 12, 36, 0.96)',
    padding: 20,
    gap: 12,
    maxHeight: '78%',
  },
  title: {
    fontFamily: Fonts.sans,
    fontSize: 18,
    fontWeight: '700',
    color: OnboardingProfileLayout.titleColor,
    textAlign: 'center',
  },
  scroll: {
    maxHeight: 320,
  },
  body: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 21,
    color: OnboardingProfileLayout.subtitleColor,
    marginBottom: 10,
  },
  closeButton: {
    alignSelf: 'center',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: OnboardingProfileLayout.goldAccent,
    paddingHorizontal: 18,
    paddingVertical: 10,
    minWidth: 120,
  },
  closeLabel: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '700',
    color: OnboardingProfileLayout.goldAccent,
    textAlign: 'center',
  },
});
