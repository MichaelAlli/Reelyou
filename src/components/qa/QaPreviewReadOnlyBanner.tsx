import { StyleSheet, Text, View } from 'react-native';

import { Fonts } from '@/constants/theme';
import { useQaPreviewMode } from '@/qa/QaPreviewContext';
import { spacing } from '@/theme';

/** Shown on auth/recovery screens during internal QA preview — blocks are enforced in handlers. */
export function QaPreviewReadOnlyBanner() {
  const { active, readOnly } = useQaPreviewMode();
  if (!active || !readOnly) {
    return null;
  }

  return (
    <View style={styles.banner} accessibilityRole="text">
      <Text style={styles.text}>QA preview — read-only. Submits, emails, and resets are disabled.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.45)',
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    paddingHorizontal: spacing.Spacing12,
    paddingVertical: spacing.Spacing8,
    marginBottom: spacing.Spacing8,
  },
  text: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    lineHeight: 17,
    color: '#F8F9FC',
    textAlign: 'center',
  },
});
