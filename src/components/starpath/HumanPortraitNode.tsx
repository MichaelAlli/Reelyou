import { Image } from 'expo-image';
import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg';

/** Reference-scale portrait nodes @ 393×852. */
export const HUMAN_PORTRAIT_NODE_SIZE = 44;

interface HumanPortraitNodeProps {
  id: string;
  x: number;
  y: number;
  ringColor: string;
  portraitSeed: number;
  visualOpacity?: number;
  revealPulse?: boolean;
  onPress?: (id: string) => void;
}

function HumanPortraitNodeComponent({
  id,
  x,
  y,
  ringColor,
  portraitSeed,
  visualOpacity = 1,
  revealPulse = false,
  onPress,
}: HumanPortraitNodeProps) {
  const size = HUMAN_PORTRAIT_NODE_SIZE;
  const halo = size + 12;

  return (
    <Pressable
      onPress={() => onPress?.(id)}
      style={({ pressed }) => [
        styles.root,
        { left: x - size / 2, top: y - size / 2, width: size, height: size, opacity: visualOpacity },
        revealPulse && styles.revealPulse,
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel="Connection on your path"
      testID={`human-node-${id}`}
    >
      <Svg width={halo} height={halo + 3} style={styles.glow}>
        <Defs>
          <RadialGradient id={`portraitGlow-${id}`} cx="50%" cy="48%" r="50%">
            <Stop offset="0%" stopColor={ringColor} stopOpacity={0.3} />
            <Stop offset="72%" stopColor={ringColor} stopOpacity={0.1} />
            <Stop offset="100%" stopColor={ringColor} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={halo / 2} cy={halo / 2 - 1} r={halo / 2 - 2} fill={`url(#portraitGlow-${id})`} />
        <Ellipse cx={halo / 2} cy={size + 1} rx={size * 0.3} ry={2.2} fill={ringColor} opacity={0.28} />
      </Svg>
      <View
        style={[
          styles.ringOuter,
          {
            borderColor: ringColor,
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
      >
        <View style={[styles.ringInner, { borderRadius: (size - 6) / 2 }]}>
          <Image
            source={{ uri: `https://i.pravatar.cc/256?img=${portraitSeed}` }}
            style={styles.photo}
            contentFit="cover"
            transition={0}
            cachePolicy="memory-disk"
          />
        </View>
      </View>
    </Pressable>
  );
}

export const HumanPortraitNode = memo(HumanPortraitNodeComponent);
export const HumanNode = HumanPortraitNode;

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    top: -4,
  },
  revealPulse: {
    shadowColor: '#FFE8A8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 5,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.97 }],
  },
  ringOuter: {
    borderWidth: 2,
    padding: 1,
    backgroundColor: 'rgba(2, 4, 12, 0.94)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.28,
    shadowRadius: 2.5,
    elevation: 3,
  },
  ringInner: {
    flex: 1,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.28)',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
});
