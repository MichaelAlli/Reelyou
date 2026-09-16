import { useRouter } from 'expo-router';
import { memo, useCallback, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, Line, RadialGradient, Stop } from 'react-native-svg';

import { Fonts, Radius } from '@/constants/theme';
import type { MySkyStarDisplay } from '@/mySky/types';
import { useThemedStyles } from '@/theme/useTheme';

interface MySkyStarCanvasProps {
  stars: MySkyStarDisplay[];
}

function MySkyStarCanvasComponent({ stars }: MySkyStarCanvasProps) {
  const router = useRouter();
  const [size, setSize] = useState({ w: 320, h: 200 });

  const styles = useThemedStyles((tokens) =>
    StyleSheet.create({
      wrap: {
        width: '100%',
        aspectRatio: 1.6,
        minHeight: 180,
        borderRadius: Radius.lg,
        overflow: 'hidden',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(167, 139, 250, 0.22)',
        backgroundColor: 'rgba(5, 7, 20, 0.85)',
      },
      starHit: {
        position: 'absolute',
        width: 44,
        height: 44,
        marginLeft: -22,
        marginTop: -22,
        alignItems: 'center',
        justifyContent: 'center',
      },
      starDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
      },
      tooltip: {
        position: 'absolute',
        bottom: 8,
        left: 8,
        right: 8,
        padding: 8,
        borderRadius: Radius.md,
        backgroundColor: 'rgba(12, 10, 28, 0.88)',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: tokens.border,
      },
      tooltipText: {
        fontFamily: Fonts.sans,
        fontSize: 12,
        lineHeight: 16,
        color: tokens.primaryText,
      },
    }),
  );

  const [activeId, setActiveId] = useState<string | null>(null);
  const active = stars.find((s) => s.id === activeId);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setSize({ w: width, h: height });
    }
  }, []);

  const handleStarPress = useCallback(
    (star: MySkyStarDisplay) => {
      setActiveId(star.id);
      if (!star.destination) return;
      if (star.destination === 'skywrite') {
        router.push('/skywrite' as never);
        return;
      }
      if (star.destination === 'public-sky' && star.destinationParam) {
        router.push(`/public-sky?id=${star.destinationParam}` as never);
      }
    },
    [router],
  );

  const linkPairs: Array<[number, number, number, number]> = [];
  for (let i = 0; i < stars.length - 1; i += 1) {
    const a = stars[i];
    const b = stars[i + 1];
    if (a.constellationId && a.constellationId === b.constellationId) {
      linkPairs.push([a.x * size.w, a.y * size.h, b.x * size.w, b.y * size.h]);
    }
  }

  return (
    <View style={styles.wrap} onLayout={onLayout}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${size.w} ${size.h}`}>
        <Defs>
          <RadialGradient id="horizonGlow" cx="50%" cy="100%" rx="60%" ry="40%">
            <Stop offset="0%" stopColor="#482838" stopOpacity={0.45} />
            <Stop offset="100%" stopColor="#040610" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={size.w / 2} cy={size.h * 0.92} r={size.w * 0.55} fill="url(#horizonGlow)" />
        {linkPairs.map(([x1, y1, x2, y2], index) => (
          <Line
            key={`link-${index}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="rgba(167, 139, 250, 0.28)"
            strokeWidth={1}
          />
        ))}
      </Svg>

      {stars.map((star) => (
        <Pressable
          key={star.id}
          accessibilityRole="button"
          accessibilityLabel={star.title ?? 'Sky moment'}
          onPress={() => handleStarPress(star)}
          style={[
            styles.starHit,
            { left: `${star.x * 100}%`, top: `${star.y * 100}%` },
          ]}>
          <View style={[styles.starDot, { backgroundColor: star.color }]} />
        </Pressable>
      ))}

      {active?.title ? (
        <View style={styles.tooltip} pointerEvents="none">
          <Text style={styles.tooltipText}>{active.title}</Text>
        </View>
      ) : null}
    </View>
  );
}

export const MySkyStarCanvas = memo(MySkyStarCanvasComponent);
