import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Fonts } from '@/constants/theme';

export function useTransientToast(durationMs = 3200) {
  const [message, setMessage] = useState<string | null>(null);

  const show = (text: string) => setMessage(text);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), durationMs);
    return () => clearTimeout(timer);
  }, [durationMs, message]);

  const Toast = message ? (
    <View style={styles.wrap} accessibilityLiveRegion="polite" accessibilityRole="alert">
      <Text style={styles.text}>{message}</Text>
    </View>
  ) : null;

  return { show, Toast };
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
    zIndex: 100,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(20, 16, 28, 0.92)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232, 200, 114, 0.45)',
  },
  text: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF8F0',
    textAlign: 'center',
  },
});
