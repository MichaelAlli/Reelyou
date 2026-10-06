import { LinearGradient } from 'expo-linear-gradient';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Fonts } from '@/constants/theme';
import type { SkywriteStarMeaning } from '@/mySky/getSkywriteStarColor';

interface FirstStarReinforcementCardProps {
  meaning: SkywriteStarMeaning;
  onDismiss: () => void;
}

function meaningLine(meaning: SkywriteStarMeaning): string {
  if (meaning === 'motion') return 'Gold marks Motion.';
  if (meaning === 'memory') return 'Blue marks Memory.';
  return 'Purple marks Reflection.';
}

function FirstStarReinforcementCardComponent({ meaning, onDismiss }: FirstStarReinforcementCardProps) {
  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <LinearGradient colors={['rgba(10, 14, 32, 0.96)', 'rgba(8, 12, 28, 0.92)']} style={styles.card}>
        <Text style={styles.title}>Your first star is here.</Text>
        <Text style={styles.body}>{meaningLine(meaning)}</Text>
        <Pressable accessibilityRole="button" onPress={onDismiss} style={styles.gotIt}>
          <Text style={styles.gotItText}>Got it</Text>
        </Pressable>
      </LinearGradient>
    </View>
  );
}

export const FirstStarReinforcementCard = memo(FirstStarReinforcementCardComponent);

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    zIndex: 30,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232, 200, 114, 0.35)',
    gap: 6,
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 16,
    color: '#FFF8F0',
  },
  body: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: 'rgba(255,248,240,0.85)',
  },
  gotIt: {
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  gotItText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '700',
    color: '#E8C872',
  },
});
