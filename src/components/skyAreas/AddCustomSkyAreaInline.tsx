import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Fonts } from '@/constants/theme';

interface AddCustomSkyAreaInlineProps {
  placeholder?: string;
  buttonLabel?: string;
  inputLabel?: string;
  onAdd: (label: string) => string | null;
  variant?: 'dark' | 'light';
}

export function AddCustomSkyAreaInline({
  placeholder = 'Name this part of your Sky',
  buttonLabel = '+ Add your own area',
  inputLabel = 'Create a new Sky Area',
  onAdd,
  variant = 'dark',
}: AddCustomSkyAreaInlineProps) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [error, setError] = useState<string | null>(null);
  const isLight = variant === 'light';

  if (!open) {
    return (
      <Pressable
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.toggle,
          isLight ? styles.toggleLight : styles.toggleDark,
          pressed && { opacity: 0.88 },
        ]}
        accessibilityRole="button">
        <Text style={[styles.toggleText, isLight ? styles.toggleTextLight : styles.toggleTextDark]}>
          {buttonLabel}
        </Text>
      </Pressable>
    );
  }

  return (
    <View style={[styles.panel, isLight ? styles.panelLight : styles.panelDark]}>
      <Text style={[styles.title, isLight ? styles.titleLight : styles.titleDark]}>{inputLabel}</Text>
      <TextInput
        value={label}
        onChangeText={(text) => {
          setLabel(text);
          setError(null);
        }}
        placeholder={placeholder}
        placeholderTextColor={isLight ? 'rgba(45,55,72,0.45)' : 'rgba(235,228,248,0.45)'}
        style={[styles.input, isLight ? styles.inputLight : styles.inputDark]}
        accessibilityLabel={placeholder}
      />
      {error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}
      <View style={styles.actions}>
        <Pressable
          onPress={() => {
            setOpen(false);
            setLabel('');
            setError(null);
          }}
          style={styles.secondary}>
          <Text style={styles.secondaryText}>Cancel</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            const result = onAdd(label);
            if (result) {
              setError(result);
              return;
            }
            setOpen(false);
            setLabel('');
            setError(null);
          }}
          style={styles.primary}>
          <Text style={styles.primaryText}>Save area</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  toggle: {
    minHeight: 44,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  toggleDark: {
    borderColor: 'rgba(232, 200, 114, 0.45)',
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
  },
  toggleLight: {
    borderColor: 'rgba(232, 200, 114, 0.55)',
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
  },
  toggleText: { fontFamily: Fonts.sans, fontSize: 13, fontWeight: '600' },
  toggleTextDark: { color: '#E8C872' },
  toggleTextLight: { color: '#7A5A12' },
  panel: { gap: 8, marginTop: 4 },
  panelDark: {},
  panelLight: {},
  title: { fontFamily: Fonts.sans, fontSize: 12, fontWeight: '600' },
  titleDark: { color: 'rgba(235,228,248,0.72)' },
  titleLight: { color: 'rgba(45,55,72,0.78)' },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 44,
    fontFamily: Fonts.sans,
    fontSize: 14,
  },
  inputDark: {
    borderColor: 'rgba(235,228,248,0.18)',
    backgroundColor: 'rgba(8,12,22,0.55)',
    color: '#F5F0FF',
  },
  inputLight: {
    borderColor: 'rgba(45,55,72,0.15)',
    backgroundColor: 'rgba(255,255,255,0.85)',
    color: '#2D3748',
  },
  error: { fontFamily: Fonts.sans, fontSize: 12, color: '#F4A4A4' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  secondary: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 8 },
  secondaryText: { fontFamily: Fonts.sans, fontSize: 13, color: 'rgba(235,228,248,0.65)' },
  primary: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(232,200,114,0.45)',
  },
  primaryText: { fontFamily: Fonts.sans, fontSize: 13, fontWeight: '600', color: '#E8C872' },
});
