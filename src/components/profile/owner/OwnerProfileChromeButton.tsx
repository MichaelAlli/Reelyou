import { memo, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface OwnerProfileChromeButtonProps {
  onPress?: () => void;
  accessibilityLabel: string;
  children?: ReactNode;
  glyph?: string;
}

function OwnerProfileChromeButtonComponent({
  onPress,
  accessibilityLabel,
  children,
  glyph,
}: OwnerProfileChromeButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
      {children ?? (glyph ? <Text style={styles.glyph}>{glyph}</Text> : null)}
    </Pressable>
  );
}

export const OwnerProfileChromeButton = memo(OwnerProfileChromeButtonComponent);

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(8, 12, 28, 0.82)',
    borderWidth: 1,
    borderColor: 'rgba(232, 200, 114, 0.42)',
  },
  pressed: {
    opacity: 0.88,
  },
  glyph: {
    color: '#F8F4EC',
    fontSize: 17,
    lineHeight: 19,
  },
});
