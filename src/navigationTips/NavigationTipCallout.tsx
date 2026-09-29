import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { NavigationTipsCopy } from '@/navigationTips/navigationTipsCopy';
import { Fonts } from '@/constants/theme';

interface NavigationTipCalloutProps {
  message: string;
  onDismiss: () => void;
  /** Tighter placement under a control row. */
  compact?: boolean;
  testID?: string;
}

function NavigationTipCalloutComponent({
  message,
  onDismiss,
  compact = false,
  testID,
}: NavigationTipCalloutProps) {
  return (
    <View
      style={[styles.wrap, compact && styles.wrapCompact]}
      pointerEvents="box-none"
      testID={testID}>
      <View style={styles.card}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={NavigationTipsCopy.dismissA11y}
          onPress={onDismiss}
          hitSlop={10}
          style={({ pressed }) => [styles.close, pressed && styles.pressed]}>
          <Text style={styles.closeGlyph} accessibilityElementsHidden>
            ×
          </Text>
        </Pressable>
        <Text style={styles.message} maxFontSizeMultiplier={1.35}>
          {message}
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={onDismiss}
          style={({ pressed }) => [styles.gotIt, pressed && styles.pressed]}>
          <Text style={styles.gotItText}>{NavigationTipsCopy.gotIt}</Text>
        </Pressable>
      </View>
    </View>
  );
}

export const NavigationTipCallout = memo(NavigationTipCalloutComponent);

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    zIndex: 12,
  },
  wrapCompact: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(10, 14, 30, 0.94)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232, 200, 114, 0.32)',
    gap: 8,
  },
  close: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  closeGlyph: {
    fontFamily: Fonts.sans,
    fontSize: 20,
    lineHeight: 22,
    color: 'rgba(248, 244, 236, 0.72)',
  },
  message: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(248, 244, 236, 0.9)',
    paddingRight: 28,
  },
  gotIt: {
    alignSelf: 'flex-start',
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  gotItText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '700',
    color: '#E8C872',
  },
  pressed: { opacity: 0.86 },
});
