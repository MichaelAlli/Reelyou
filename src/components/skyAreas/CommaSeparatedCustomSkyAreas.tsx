import { useMemo } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { MAX_CUSTOM_SKY_AREAS } from '@/skyAreas/skyAreaBetaConfig';
import { parseCommaSeparatedSkyAreas } from '@/skyAreas/parseCommaSeparatedSkyAreas';
import { Fonts } from '@/constants/theme';

interface CommaSeparatedCustomSkyAreasProps {
  value: string;
  onChangeText: (text: string) => void;
  error?: string | null;
  title?: string;
  placeholder?: string;
}

export function CommaSeparatedCustomSkyAreas({
  value,
  onChangeText,
  error,
  title = 'Create a new Sky Area',
  placeholder = 'Dance choreography, Voice acting, Stage direction',
}: CommaSeparatedCustomSkyAreasProps) {
  const preview = useMemo(() => parseCommaSeparatedSkyAreas(value), [value]);
  const overLimit = preview.length > MAX_CUSTOM_SKY_AREAS;
  const validationMessage =
    error ??
    (overLimit ? 'You can add up to 5 new Sky Areas.' : null);

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.helper}>
        Add up to 5 new Sky Areas. Separate each area with a comma.
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(235,228,248,0.45)"
        style={styles.input}
        multiline
        accessibilityLabel={title}
      />
      {preview.length > 0 && !overLimit ? (
        <View style={styles.previewRow}>
          {preview.map((label) => (
            <View key={label} style={styles.previewChip}>
              <Text style={styles.previewText}>{label}</Text>
            </View>
          ))}
        </View>
      ) : null}
      {validationMessage ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {validationMessage}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8, marginTop: 4 },
  title: { fontFamily: Fonts.sans, fontSize: 12, fontWeight: '600', color: 'rgba(235,228,248,0.72)' },
  helper: { fontFamily: Fonts.sans, fontSize: 12, lineHeight: 16, color: 'rgba(235,228,248,0.55)' },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(235,228,248,0.18)',
    backgroundColor: 'rgba(8,12,22,0.55)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 44,
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: '#F5F0FF',
  },
  previewRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  previewChip: {
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232,200,114,0.35)',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  previewText: { fontFamily: Fonts.sans, fontSize: 11, color: 'rgba(235,228,248,0.78)' },
  error: { fontFamily: Fonts.sans, fontSize: 12, color: '#F4A4A4' },
});
