import { memo } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import { Fonts } from '@/constants/theme';

export const SYMBOLIC_NODE_SIZE_MD = 52;
export const SYMBOLIC_NODE_SIZE_LG = 58;

interface SymbolicJourneyNodeProps {
  id: string;
  x: number;
  y: number;
  ringColor: string;
  icon: string;
  size?: 'md' | 'lg';
  visualOpacity?: number;
  revealPulse?: boolean;
  showSelectionRing?: boolean;
  softPulse?: boolean;
  onPress?: (id: string) => void;
}

function SymbolicJourneyNodeComponent({
  id,
  x,
  y,
  ringColor,
  icon,
  size = 'md',
  visualOpacity = 1,
  revealPulse = false,
  showSelectionRing = false,
  softPulse = false,
  onPress,
}: SymbolicJourneyNodeProps) {
  const dim = size === 'lg' ? SYMBOLIC_NODE_SIZE_LG : SYMBOLIC_NODE_SIZE_MD;
  const iconSize = size === 'lg' ? 21 : 18;

  return (
    <Pressable
      onPress={() => onPress?.(id)}
      style={({ pressed }) => [
        styles.root,
        { left: x - dim / 2, top: y - dim / 2, width: dim, height: dim, opacity: visualOpacity },
        revealPulse && styles.revealPulse,
        softPulse && styles.softPulse,
        showSelectionRing && styles.selectionRing,
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      testID={`path-node-${id}`}
    >
      <Svg width={dim + 8} height={dim + 8} style={styles.halo}>
        <Defs>
          <RadialGradient id={`symHalo-${id}`} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={ringColor} stopOpacity={0.36} />
            <Stop offset="70%" stopColor={ringColor} stopOpacity={0.08} />
            <Stop offset="100%" stopColor={ringColor} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={(dim + 8) / 2} cy={(dim + 8) / 2} r={dim / 2 + 3} fill={`url(#symHalo-${id})`} />
      </Svg>
      <View style={[styles.orbShell, { width: dim, height: dim, borderRadius: dim / 2, borderColor: ringColor }]}>
        <Svg width={dim - 4} height={dim - 4}>
          <Defs>
            <RadialGradient id={`symOrb-${id}`} cx="42%" cy="38%" r="58%">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.14} />
              <Stop offset="35%" stopColor={ringColor} stopOpacity={0.32} />
              <Stop offset="100%" stopColor="rgba(3, 5, 14, 0.94)" stopOpacity={1} />
            </RadialGradient>
          </Defs>
          <Circle cx={(dim - 4) / 2} cy={(dim - 4) / 2} r={(dim - 4) / 2 - 1} fill={`url(#symOrb-${id})`} />
        </Svg>
        <Text style={[styles.icon, { color: ringColor, fontSize: iconSize, lineHeight: iconSize + 2 }]}>{icon}</Text>
      </View>
    </Pressable>
  );
}

export const SymbolicJourneyNode = memo(SymbolicJourneyNodeComponent);
export const CategoryNode = SymbolicJourneyNode;

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    position: 'absolute',
  },
  revealPulse: {
    shadowColor: '#FFE8A8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 7,
    elevation: 5,
  },
  softPulse: {
    shadowColor: '#FFE8A8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.26,
    shadowRadius: 6,
    elevation: 4,
  },
  selectionRing: {
    borderWidth: 2,
    borderColor: 'rgba(255, 232, 168, 0.72)',
    borderRadius: 999,
  },
  pressed: {
    opacity: 0.93,
    transform: [{ scale: 0.97 }],
  },
  orbShell: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    backgroundColor: 'rgba(2, 4, 12, 0.92)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  icon: {
    position: 'absolute',
    fontFamily: Fonts.sans,
    fontWeight: '700',
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : null),
  },
});
