import { LinearGradient } from 'expo-linear-gradient';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { LayoutChangeEvent, Platform, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient as SvgGrad, Path, Stop } from 'react-native-svg';

import { fivePointStarCompact } from '@/components/process-starpath/processStarPathGeometry';
import { ProcessCopy, ProcessMetrics, ProcessPalette } from '@/components/process-starpath/processStarPathSpec';
import type { ProcessStarPathPoint } from '@/components/process-starpath/types';
import { ReelyouEasing } from '@/constants/animation';
import { Fonts } from '@/constants/theme';

const M = ProcessMetrics;
const P = ProcessPalette;

interface ProcessStarPathCardProps {
  progress: SharedValue<number>;
  statusLabel: string;
  reduceMotion?: boolean;
  onTrailOrigin?: (pt: ProcessStarPathPoint) => void;
}

function ProcessStarPathCardComponent({
  progress,
  statusLabel,
  reduceMotion = false,
  onTrailOrigin,
}: ProcessStarPathCardProps) {
  const [trackW, setTrackW] = useState(0);
  const trackWShared = useSharedValue(0);
  const [displayStatus, setDisplayStatus] = useState(statusLabel);
  const [displayPct, setDisplayPct] = useState('0%');
  const statusOp = useSharedValue(1);
  const pctOp = useSharedValue(1);
  const shimmer = useSharedValue(0);
  const prev = useRef(statusLabel);
  const iconSvg = fivePointStarCompact(M.cardIconSvg);

  const applyStatus = useCallback(
    (s: string) => {
      setDisplayStatus(s);
      statusOp.value = withTiming(1, { duration: 460, easing: ReelyouEasing.out });
    },
    [statusOp],
  );

  useAnimatedReaction(
    () => Math.round(Math.max(0, Math.min(1, progress.value)) * 100),
    (c, p) => {
      if (c !== p) runOnJS(setDisplayPct)(`${c}%`);
    },
    [progress],
  );

  useEffect(() => {
    if (reduceMotion) {
      shimmer.value = 0;
      return;
    }
    shimmer.value = withRepeat(
      withTiming(1, { duration: 4200, easing: Easing.linear }),
      -1,
      false,
    );
  }, [reduceMotion, shimmer]);

  useEffect(() => {
    if (prev.current === statusLabel) return;
    prev.current = statusLabel;
    if (reduceMotion) {
      setDisplayStatus(statusLabel);
      return;
    }
    statusOp.value = withTiming(0, { duration: 230, easing: ReelyouEasing.out }, (done) => {
      if (done) runOnJS(applyStatus)(statusLabel);
    });
  }, [applyStatus, reduceMotion, statusLabel, statusOp]);

  useEffect(() => {
    if (reduceMotion) return;
    pctOp.value = withSequence(
      withTiming(0.85, { duration: 85, easing: ReelyouEasing.out }),
      withTiming(1, { duration: 290, easing: ReelyouEasing.out }),
    );
  }, [displayPct, pctOp, reduceMotion]);

  const fill = useAnimatedStyle(() => ({
    width: trackWShared.value * Math.max(0, Math.min(1, progress.value)),
  }));

  const highlight = useAnimatedStyle(() => {
    const r = Math.max(0, Math.min(1, progress.value));
    return {
      opacity: r > 0.02 ? 0.5 : 0,
      transform: [{ translateX: r * Math.max(trackW - 28, 0) }],
    };
  });

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: 0.1,
    transform: [{ translateX: shimmer.value * Math.max(trackW, 1) - 30 }],
  }));

  const statusStyle = useAnimatedStyle(() => ({
    opacity: statusOp.value,
    transform: [{ translateY: (1 - statusOp.value) * 3 }],
  }));

  const pctStyle = useAnimatedStyle(() => ({ opacity: pctOp.value }));

  const onIconLayout = useCallback(
    (e: LayoutChangeEvent) => {
      if (!onTrailOrigin) return;
      const { x, y, width, height } = e.nativeEvent.layout;
      onTrailOrigin({
        x: M.cardPad + x + width / 2,
        y: M.cardPadTop + y + height / 2,
      });
    },
    [onTrailOrigin],
  );

  return (
    <View style={styles.shell}>
      <View style={styles.card}>
        <LinearGradient
          colors={['rgba(168, 144, 254, 0.07)', 'rgba(6, 5, 16, 0.9)', 'rgba(232, 200, 114, 0.06)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        <View style={styles.row}>
          <View style={styles.iconSlot} onLayout={onIconLayout}>
            <LinearGradient
              colors={['rgba(232, 200, 114, 0.22)', 'rgba(6, 5, 14, 0.92)']}
              style={StyleSheet.absoluteFill}
            />
            <Svg width={M.cardIconSvg + 4} height={M.cardIconSvg + 4}>
              <Defs>
                <SvgGrad id="cardStar" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor={P.goldBright} />
                  <Stop offset="100%" stopColor={P.gold} />
                </SvgGrad>
              </Defs>
              <Path
                d={iconSvg}
                fill="url(#cardStar)"
                transform={`translate(${(M.cardIconSvg + 4) / 2}, ${(M.cardIconSvg + 4) / 2})`}
              />
            </Svg>
          </View>
          <View style={styles.copy}>
            <Animated.Text style={[styles.status, statusStyle]}>{displayStatus}</Animated.Text>
            <Text style={styles.hint}>{ProcessCopy.hint}</Text>
          </View>
        </View>

        <View style={styles.barSection}>
          <View
            style={styles.track}
            onLayout={(e) => {
              const w = e.nativeEvent.layout.width;
              setTrackW(w);
              trackWShared.value = w;
            }}>
            <Animated.View style={[styles.fillClip, fill]}>
              <LinearGradient
                colors={['#8A6914', P.goldDeep, '#E8C872', '#FFF4CC']}
                locations={[0, 0.28, 0.68, 1]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={StyleSheet.absoluteFill}
              />
              <Animated.View style={[styles.highlight, highlight]} pointerEvents="none">
                <LinearGradient
                  colors={['transparent', 'rgba(255, 255, 255, 0.42)', 'transparent']}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={StyleSheet.absoluteFill}
                />
              </Animated.View>
            </Animated.View>
            {!reduceMotion ? (
              <Animated.View style={[styles.shimmer, shimmerStyle]} pointerEvents="none">
                <LinearGradient
                  colors={['transparent', 'rgba(255,255,255,0.1)', 'transparent']}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={StyleSheet.absoluteFill}
                />
              </Animated.View>
            ) : null}
          </View>
          <Animated.Text style={[styles.pct, pctStyle]}>{displayPct}</Animated.Text>
        </View>
      </View>
    </View>
  );
}

export const ProcessStarPathCard = memo(ProcessStarPathCardComponent);

const styles = StyleSheet.create({
  shell: { position: 'relative', marginHorizontal: -2, zIndex: 6 },
  card: {
    borderRadius: M.cardRadius,
    paddingHorizontal: M.cardPad,
    paddingTop: M.cardPadTop,
    paddingBottom: M.cardPadBottom,
    backgroundColor: P.glass,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: P.glassBorder,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 18 },
        shadowOpacity: 0.36,
        shadowRadius: 32,
      },
      android: { elevation: 12 },
      default: {},
    }),
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: M.cardRowGap },
  iconSlot: {
    width: M.cardIcon,
    height: M.cardIcon,
    borderRadius: M.cardIcon / 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232, 200, 114, 0.36)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  copy: { flex: 1, gap: 7, paddingTop: 4 },
  status: {
    fontFamily: Fonts.sans,
    fontSize: M.statusSize,
    fontWeight: '600',
    color: P.white,
    lineHeight: 26,
    letterSpacing: -0.2,
  },
  hint: {
    fontFamily: Fonts.sans,
    fontSize: M.hintSize,
    fontWeight: '400',
    color: P.muted,
    lineHeight: 20,
  },
  barSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: M.cardHintBarGap,
    minHeight: M.barH + 4,
  },
  track: {
    flex: 1,
    height: M.barH,
    borderRadius: 999,
    backgroundColor: 'rgba(8, 6, 18, 0.92)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(168, 144, 254, 0.22)',
    overflow: 'hidden',
  },
  fillClip: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 999,
    overflow: 'hidden',
    minWidth: 0,
  },
  highlight: { position: 'absolute', top: 0, bottom: 0, width: 28 },
  shimmer: { position: 'absolute', top: 0, bottom: 0, width: 32 },
  pct: {
    fontFamily: Fonts.sans,
    fontSize: M.pctSize,
    fontWeight: '600',
    color: P.gold,
    minWidth: M.pctMinW,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.28,
  },
});
