import { memo, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Text as SvgText } from 'react-native-svg';

import { Fonts } from '@/constants/theme';

interface ConstellationPeoplePreviewProps {
  names: readonly string[];
  peopleLine?: string | null;
}

function initialFor(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '?';
  return trimmed.charAt(0).toUpperCase();
}

function ConstellationPeoplePreviewComponent({ names, peopleLine }: ConstellationPeoplePreviewProps) {
  const stars = useMemo(() => {
    const slice = names.slice(0, 5);
    const positions = [
      { x: 42, y: 38 },
      { x: 78, y: 52 },
      { x: 118, y: 34 },
      { x: 156, y: 48 },
      { x: 98, y: 72 },
    ];
    return slice.map((name, index) => ({
      name,
      initial: initialFor(name),
      ...positions[index],
    }));
  }, [names]);

  const edges = useMemo(() => {
    if (stars.length < 2) return [];
    const pairs: [number, number][] = [];
    for (let i = 0; i < stars.length - 1; i += 1) {
      pairs.push([i, i + 1]);
    }
    if (stars.length >= 4) pairs.push([0, 2]);
    return pairs;
  }, [stars]);

  return (
    <View
      style={styles.wrap}
      accessibilityRole="image"
      accessibilityLabel={peopleLine ?? 'People in this constellation'}>
      <Svg width="100%" height={96} viewBox="0 0 200 96">
        {edges.map(([a, b]) => (
          <Line
            key={`${a}-${b}`}
            x1={stars[a].x}
            y1={stars[a].y}
            x2={stars[b].x}
            y2={stars[b].y}
            stroke="rgba(196, 168, 255, 0.35)"
            strokeWidth={1}
          />
        ))}
        {stars.map((star, index) => (
          <Circle
            key={`${star.name}-${index}`}
            cx={star.x}
            cy={star.y}
            r={14}
            fill="rgba(232, 200, 114, 0.22)"
            stroke="rgba(248, 244, 236, 0.55)"
            strokeWidth={1}
          />
        ))}
        {stars.map((star, index) => (
          <SvgText
            key={`t-${star.name}-${index}`}
            x={star.x}
            y={star.y + 4}
            fill="rgba(248, 244, 236, 0.88)"
            fontSize={11}
            textAnchor="middle">
            {star.initial}
          </SvgText>
        ))}
      </Svg>
      {peopleLine ? <Text style={styles.peopleLine}>{peopleLine}</Text> : null}
    </View>
  );
}

export const ConstellationPeoplePreview = memo(ConstellationPeoplePreviewComponent);

const styles = StyleSheet.create({
  wrap: {
    marginTop: 20,
    marginBottom: 8,
    minHeight: 110,
  },
  peopleLine: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: 'rgba(248, 244, 236, 0.55)',
    textAlign: 'center',
    marginTop: 4,
  },
});
