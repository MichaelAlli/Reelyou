import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Fonts } from '@/constants/theme';
import type { SkyAreaHashtagSuggestion } from '@/skyAreas/skyAreaHashtagSuggestion';

interface SkyAreaSuggestionBannerProps {
  suggestion: SkyAreaHashtagSuggestion;
  onAdd: () => void;
  onDismiss: () => void;
}

export function SkyAreaSuggestionBanner({
  suggestion,
  onAdd,
  onDismiss,
}: SkyAreaSuggestionBannerProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.body}>{suggestion.reason}</Text>
      <Text style={styles.prompt}>
        Add {suggestion.suggestedLabel} to where you live in the Sky?
      </Text>
      <Text style={styles.note}>This is only a suggestion — you&apos;re always in control.</Text>
      <View style={styles.row}>
        <Pressable onPress={onDismiss} style={styles.secondary} accessibilityRole="button">
          <Text style={styles.secondaryText}>Not now</Text>
        </Pressable>
        <Pressable onPress={onAdd} style={styles.primary} accessibilityRole="button">
          <Text style={styles.primaryText}>Add</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(167, 139, 250, 0.35)',
    backgroundColor: 'rgba(167, 139, 250, 0.1)',
    gap: 6,
  },
  body: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    lineHeight: 17,
    color: 'rgba(235,228,248,0.88)',
  },
  prompt: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '600',
    color: '#F5F0FF',
  },
  note: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: 'rgba(235,228,248,0.55)',
  },
  row: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 4 },
  secondary: { minHeight: 40, justifyContent: 'center', paddingHorizontal: 8 },
  secondaryText: { fontFamily: Fonts.sans, fontSize: 13, color: 'rgba(235,228,248,0.65)' },
  primary: {
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(232,200,114,0.45)',
  },
  primaryText: { fontFamily: Fonts.sans, fontSize: 13, fontWeight: '600', color: '#E8C872' },
});
