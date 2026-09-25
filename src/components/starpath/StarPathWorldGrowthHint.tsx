import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { WorldSignalCopy } from '@/constants/worldSignalCopy';
import { Fonts } from '@/constants/theme';

interface StarPathWorldGrowthHintProps {
  body: string;
  onView: () => void;
  onDismiss: () => void;
}

function StarPathWorldGrowthHintComponent({ body, onView, onDismiss }: StarPathWorldGrowthHintProps) {
  return (
    <View style={styles.wrap} pointerEvents="box-none" testID="starpath-world-growth-hint">
      <View style={styles.card}>
        <View style={styles.accent} accessibilityElementsHidden importantForAccessibility="no" />
        <Text style={styles.body}>{body}</Text>
        <View style={styles.actions}>
          <Pressable onPress={onView} accessibilityRole="button" accessibilityLabel={WorldSignalCopy.view}>
            <Text style={styles.view}>{WorldSignalCopy.view}</Text>
          </Pressable>
          <Pressable onPress={onDismiss} accessibilityRole="button" accessibilityLabel={WorldSignalCopy.notNow}>
            <Text style={styles.dismiss}>{WorldSignalCopy.notNow}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: 118,
    zIndex: 24,
  },
  card: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 196, 140, 0.35)',
    backgroundColor: 'rgba(8, 10, 26, 0.92)',
    padding: 12,
    gap: 8,
  },
  accent: {
    position: 'absolute',
    left: 12,
    top: 14,
    width: 3,
    height: '70%',
    borderRadius: 2,
    backgroundColor: 'rgba(255, 196, 140, 0.55)',
  },
  body: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(235, 228, 248, 0.82)',
    paddingLeft: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
    paddingLeft: 8,
  },
  view: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 220, 170, 0.9)',
  },
  dismiss: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: 'rgba(235, 228, 248, 0.55)',
  },
});

export const StarPathWorldGrowthHint = memo(StarPathWorldGrowthHintComponent);
