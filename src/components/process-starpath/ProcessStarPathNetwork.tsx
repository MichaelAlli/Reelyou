import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { LayoutChangeEvent, Platform, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useDerivedValue,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Circle, G, Line } from 'react-native-svg';
import { SymbolView } from 'expo-symbols';

import { ProcessHeroStar } from '@/components/process-starpath/ProcessHeroStar';
import { buildConstellationLayout } from '@/components/process-starpath/processStarPathGeometry';
import {
  useLinkReveal,
  useNodeReveal,
  useProcessClock,
  useStarBreath,
  useStarReveal,
} from '@/components/process-starpath/processStarPathMotion';
import {
  ProcessPalette,
  scaleProcessNetwork,
  type ProcessNodeSpec,
} from '@/components/process-starpath/processStarPathSpec';
import type { ProcessStarPathPoint } from '@/components/process-starpath/types';
import { Fonts } from '@/constants/theme';

const AnimatedLine = Animated.createAnimatedComponent(Line);
const P = ProcessPalette;

export interface ProcessStarPathNetworkProps {
  progress: SharedValue<number>;
  energyPulse: SharedValue<number>;
  reduceMotion?: boolean;
  height: number;
  width: number;
  onAnchorPoint?: (pt: ProcessStarPathPoint) => void;
}

function ProcessStarPathNetworkComponent({
  progress,
  energyPulse,
  reduceMotion = false,
  height,
  width,
  onAnchorPoint,
}: ProcessStarPathNetworkProps) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const clock = useProcessClock(reduceMotion);
  const starIn = useStarReveal(clock, reduceMotion);
  const breath = useStarBreath(reduceMotion);
  const net = useMemo(() => scaleProcessNetwork(width), [width]);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width: w, height: h } = e.nativeEvent.layout;
    setSize({ w, h });
  }, []);

  const layout = useMemo(() => {
    if (size.w <= 0 || size.h <= 0) return null;
    return buildConstellationLayout(size.w, size.h, net.nodeSize / 2, net.starSize / 2);
  }, [net.nodeSize, net.starSize, size.h, size.w]);

  useEffect(() => {
    if (!onAnchorPoint || !layout) return;
    onAnchorPoint(layout.anchorPoint);
  }, [layout, onAnchorPoint]);

  return (
    <View style={[styles.wrap, { height, width }]} onLayout={onLayout}>
      {layout ? (
        <View style={[styles.stage, { width: size.w, height: size.h }]}>
          <Svg width={size.w} height={size.h} style={StyleSheet.absoluteFill} pointerEvents="none">
            {layout.links.map((link) => (
              <ConnectorLine
                key={link.order}
                link={link}
                clock={clock}
                reduceMotion={reduceMotion}
                progress={progress}
              />
            ))}

            {layout.nodes.map(({ spec, cx, cy, radius }) => (
              <Circle
                key={spec.id}
                cx={cx}
                cy={cy}
                r={radius}
                fill="rgba(6, 5, 14, 0.82)"
                stroke="rgba(232, 200, 114, 0.36)"
                strokeWidth={1}
              />
            ))}

            <G transform={`translate(${layout.cx}, ${layout.cy})`}>
              <ProcessHeroStar
                size={net.starSize}
                breath={breath}
                reveal={starIn}
                energyPulse={energyPulse}
              />
            </G>
          </Svg>

          {layout.nodes.map(({ spec, cx, cy, radius }) => (
            <SatelliteOverlay
              key={spec.id}
              spec={spec}
              cx={cx}
              cy={cy}
              radius={radius}
              iconSize={net.nodeIcon}
              labelW={net.labelW}
              clock={clock}
              reduceMotion={reduceMotion}
              progress={progress}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

function ConnectorLine({
  link,
  clock,
  reduceMotion,
  progress,
}: {
  link: { x1: number; y1: number; x2: number; y2: number; len: number; order: number };
  clock: SharedValue<number>;
  reduceMotion: boolean;
  progress: SharedValue<number>;
}) {
  const reveal = useLinkReveal(clock, link.order, reduceMotion);

  const glowProps = useAnimatedProps(() => ({
    opacity: (0.08 + reveal.value * 0.1) * (0.92 + progress.value * 0.08),
  }));

  const baseProps = useAnimatedProps(() => ({
    opacity: (0.18 + reveal.value * 0.32) * (0.94 + progress.value * 0.06),
  }));

  const shimmerProps = useAnimatedProps(() => {
    if (reveal.value < 0.98) return { opacity: 0, strokeDashoffset: link.len };
    const phase = (progress.value * 0.6 + link.order * 0.08) % 1;
    return {
      opacity: 0.14 + Math.sin(phase * Math.PI * 2) * 0.08,
      strokeDashoffset: link.len * (1 - phase),
    };
  });

  return (
    <>
      <AnimatedLine
        x1={link.x1}
        y1={link.y1}
        x2={link.x2}
        y2={link.y2}
        stroke="rgba(232, 200, 114, 0.35)"
        strokeWidth={2.2}
        strokeLinecap="round"
        animatedProps={glowProps}
      />
      <AnimatedLine
        x1={link.x1}
        y1={link.y1}
        x2={link.x2}
        y2={link.y2}
        stroke={P.goldLine}
        strokeWidth={1}
        strokeLinecap="round"
        animatedProps={baseProps}
      />
      {!reduceMotion ? (
        <AnimatedLine
          x1={link.x1}
          y1={link.y1}
          x2={link.x2}
          y2={link.y2}
          stroke={P.goldBright}
          strokeWidth={1}
          strokeLinecap="round"
          strokeDasharray={`${10} ${link.len}`}
          animatedProps={shimmerProps}
        />
      ) : null}
    </>
  );
}

function SatelliteOverlay({
  spec,
  cx,
  cy,
  radius,
  iconSize,
  labelW,
  clock,
  reduceMotion,
  progress,
}: {
  spec: ProcessNodeSpec;
  cx: number;
  cy: number;
  radius: number;
  iconSize: number;
  labelW: number;
  clock: SharedValue<number>;
  reduceMotion: boolean;
  progress: SharedValue<number>;
}) {
  const reveal = useNodeReveal(clock, spec.order, reduceMotion);
  const polish = useDerivedValue(() => 0.94 + progress.value * 0.06);

  const wrap = useAnimatedStyle(() => ({
    opacity: reveal.value * polish.value,
    transform: [{ scale: 0.86 + reveal.value * 0.14 }],
  }));

  const label = useAnimatedStyle(() => ({
    opacity: reveal.value * (0.88 + progress.value * 0.12),
    transform: [{ translateY: (1 - reveal.value) * 6 }],
  }));

  return (
    <>
      <Animated.View
        style={[
          styles.iconSlot,
          {
            left: cx - radius,
            top: cy - radius,
            width: radius * 2,
            height: radius * 2,
            borderRadius: radius,
          },
          wrap,
        ]}>
        <SymbolView
          name={spec.icon}
          size={iconSize}
          tintColor={P.gold}
          weight="light"
          style={{ width: iconSize, height: iconSize }}
        />
      </Animated.View>
      <Animated.Text
        style={[
          styles.label,
          {
            left: cx - labelW / 2,
            top: cy + radius + 8,
            width: labelW,
          },
          label,
        ]}
        numberOfLines={2}>
        {spec.label}
      </Animated.Text>
    </>
  );
}

export const ProcessStarPathNetwork = memo(ProcessStarPathNetworkComponent);

const styles = StyleSheet.create({
  wrap: { alignSelf: 'center', overflow: 'visible' },
  stage: { position: 'relative', overflow: 'visible' },
  iconSlot: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.22,
        shadowRadius: 8,
      },
      android: { elevation: 6 },
      default: {},
    }),
  },
  label: {
    position: 'absolute',
    fontFamily: Fonts.sans,
    fontSize: 9.5,
    fontWeight: '600',
    letterSpacing: 1.08,
    color: P.label,
    textAlign: 'center',
    lineHeight: 12.5,
    textTransform: 'uppercase',
  },
});
