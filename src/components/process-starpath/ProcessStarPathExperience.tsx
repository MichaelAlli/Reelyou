import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProcessStarPathBackdrop } from '@/components/process-starpath/ProcessStarPathBackdrop';
import { ProcessStarPathBrand } from '@/components/process-starpath/ProcessStarPathBrand';
import { ProcessStarPathCard } from '@/components/process-starpath/ProcessStarPathCard';
import { ProcessStarPathFooter } from '@/components/process-starpath/ProcessStarPathFooter';
import { ProcessStarPathNetwork } from '@/components/process-starpath/ProcessStarPathNetwork';
import { ProcessStarPathTrail } from '@/components/process-starpath/ProcessStarPathTrail';
import {
  measureProcessHero,
  measureProcessLogo,
  ProcessCopy,
  ProcessMetrics,
  ProcessPalette,
  shouldScrollProcessLayout,
} from '@/components/process-starpath/processStarPathSpec';
import type { ProcessStarPathPoint, ProcessStarPathProps } from '@/components/process-starpath/types';
import { ReelyouEasing } from '@/constants/animation';
import { Fonts } from '@/constants/theme';
import { PROCESS_INTRO_MS } from '@/process/processSessionConstants';

function ProcessStarPathExperienceComponent({
  progress,
  statusLabel,
  reduceMotion,
  exitOpacity,
  onStartProcessing,
}: ProcessStarPathProps) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const viewport = height - insets.top - insets.bottom;
  const compact = viewport < 720;
  const tall = viewport >= 860;
  const scrollable = shouldScrollProcessLayout(viewport);

  const logoW = measureProcessLogo(width, compact);
  const heroH = measureProcessHero(viewport, compact);
  const contentW = width - ProcessMetrics.padH * 2;

  const [canvas, setCanvas] = useState({ w: 0, h: 0 });
  const [heroY, setHeroY] = useState(0);
  const [dockY, setDockY] = useState(0);
  const [cardLocal, setCardLocal] = useState({ x: 0, y: 0 });
  const [anchorPt, setAnchorPt] = useState<ProcessStarPathPoint | null>(null);
  const [trailLocal, setTrailLocal] = useState<ProcessStarPathPoint | null>(null);

  const logoOp = useSharedValue(reduceMotion ? 1 : 0);
  const headerOp = useSharedValue(reduceMotion ? 1 : 0);
  const headerLift = useSharedValue(reduceMotion ? 0 : 14);
  const titleOp = useSharedValue(reduceMotion ? 1 : 0);
  const titleLift = useSharedValue(reduceMotion ? 0 : 10);
  const subOp = useSharedValue(reduceMotion ? 1 : 0);
  const heroOp = useSharedValue(reduceMotion ? 1 : 0);
  const dockOp = useSharedValue(reduceMotion ? 1 : 0);
  const dockLift = useSharedValue(reduceMotion ? 0 : 28);
  const footOp = useSharedValue(reduceMotion ? 1 : 0);
  const energyPulse = useSharedValue(0);

  useEffect(() => {
    onStartProcessing();
  }, [onStartProcessing]);

  useEffect(() => {
    if (reduceMotion) return;

    logoOp.value = withTiming(1, { duration: PROCESS_INTRO_MS.headerFade + 220, easing: ReelyouEasing.out });
    headerOp.value = withTiming(1, { duration: PROCESS_INTRO_MS.headerFade, easing: ReelyouEasing.out });
    headerLift.value = withTiming(0, { duration: PROCESS_INTRO_MS.headerFade + 100, easing: ReelyouEasing.out });
    titleOp.value = withDelay(
      PROCESS_INTRO_MS.headerFade,
      withTiming(1, { duration: 560, easing: ReelyouEasing.out }),
    );
    titleLift.value = withDelay(
      PROCESS_INTRO_MS.headerFade,
      withTiming(0, { duration: 600, easing: ReelyouEasing.out }),
    );
    subOp.value = withDelay(
      PROCESS_INTRO_MS.headerFade + 180,
      withTiming(1, { duration: 520, easing: ReelyouEasing.out }),
    );
    heroOp.value = withDelay(
      PROCESS_INTRO_MS.starInStart - 80,
      withTiming(1, { duration: 900, easing: ReelyouEasing.out }),
    );
    dockOp.value = withDelay(
      PROCESS_INTRO_MS.footerIn,
      withTiming(1, { duration: 640, easing: ReelyouEasing.out }),
    );
    dockLift.value = withDelay(
      PROCESS_INTRO_MS.footerIn,
      withTiming(0, { duration: 660, easing: ReelyouEasing.out }),
    );
    footOp.value = withDelay(
      PROCESS_INTRO_MS.footerIn + 360,
      withTiming(1, { duration: 520, easing: ReelyouEasing.out }),
    );
  }, [
    dockLift,
    dockOp,
    footOp,
    headerLift,
    headerOp,
    heroOp,
    logoOp,
    reduceMotion,
    subOp,
    titleLift,
    titleOp,
  ]);

  const trailOrigin = useMemo(() => {
    if (!trailLocal) return null;
    return {
      x: cardLocal.x + trailLocal.x,
      y: dockY + cardLocal.y + trailLocal.y,
    };
  }, [cardLocal.x, cardLocal.y, dockY, trailLocal]);

  const trailTarget = useMemo(() => {
    if (!anchorPt) return null;
    return { x: anchorPt.x, y: heroY + anchorPt.y };
  }, [anchorPt, heroY]);

  const screenOp = useAnimatedStyle(() => ({ opacity: exitOpacity.value }));
  const logoStyle = useAnimatedStyle(() => ({ opacity: logoOp.value * exitOpacity.value }));
  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOp.value * exitOpacity.value,
    transform: [{ translateY: headerLift.value }],
  }));
  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOp.value * exitOpacity.value,
    transform: [{ translateY: titleLift.value }],
  }));
  const subStyle = useAnimatedStyle(() => ({ opacity: subOp.value * exitOpacity.value }));
  const heroStyle = useAnimatedStyle(() => ({ opacity: heroOp.value * exitOpacity.value }));
  const dockStyle = useAnimatedStyle(() => ({
    opacity: dockOp.value * exitOpacity.value,
    transform: [{ translateY: dockLift.value }],
  }));
  const footStyle = useAnimatedStyle(() => ({ opacity: footOp.value * exitOpacity.value }));

  const onCanvasLayout = useCallback((w: number, h: number) => setCanvas({ w, h }), []);

  const body = (
    <>
      <Animated.View style={[styles.brandBand, headerStyle]}>
        <Animated.View style={logoStyle}>
          <ProcessStarPathBrand logoWidth={logoW} />
        </Animated.View>
        <View style={styles.headlines}>
          <Animated.Text
            style={[
              styles.title,
              { fontSize: compact ? 18 : tall ? 22 : ProcessMetrics.titleSize },
              titleStyle,
            ]}>
            {ProcessCopy.title}
          </Animated.Text>
          <Animated.Text
            style={[
              styles.subtitle,
              { fontSize: compact ? 12.5 : ProcessMetrics.subtitleSize },
              subStyle,
            ]}>
            {ProcessCopy.subtitle}
          </Animated.Text>
        </View>
      </Animated.View>

      <View
        style={styles.stage}
        onLayout={(e) => onCanvasLayout(e.nativeEvent.layout.width, e.nativeEvent.layout.height)}>
        <Animated.View
          style={[styles.heroBand, { minHeight: heroH, marginTop: M.networkTopInset }, heroStyle]}
          onLayout={(e) => setHeroY(e.nativeEvent.layout.y)}>
          <ProcessStarPathNetwork
            progress={progress}
            energyPulse={energyPulse}
            reduceMotion={reduceMotion}
            height={heroH}
            width={contentW}
            onAnchorPoint={setAnchorPt}
          />
        </Animated.View>

        <ProcessStarPathTrail
          width={canvas.w}
          height={canvas.h}
          origin={trailOrigin}
          target={trailTarget}
          reduceMotion={reduceMotion}
          energyPulse={energyPulse}
        />

        <Animated.View
          style={[styles.dockBand, dockStyle]}
          onLayout={(e) => setDockY(e.nativeEvent.layout.y)}>
          <View onLayout={(e) => setCardLocal({ x: e.nativeEvent.layout.x, y: e.nativeEvent.layout.y })}>
            <ProcessStarPathCard
              progress={progress}
              statusLabel={statusLabel}
              reduceMotion={reduceMotion}
              onTrailOrigin={setTrailLocal}
            />
          </View>
          <ProcessStarPathFooter animatedStyle={footStyle} />
        </Animated.View>
      </View>
    </>
  );

  return (
    <Animated.View style={[styles.root, screenOp]}>
      <ProcessStarPathBackdrop />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {scrollable ? (
          <ScrollView
            contentContainerStyle={styles.scroll}
            bounces={false}
            showsVerticalScrollIndicator={false}>
            {body}
          </ScrollView>
        ) : (
          <View style={styles.page}>{body}</View>
        )}
      </SafeAreaView>
    </Animated.View>
  );
}

export const ProcessStarPathExperience = memo(ProcessStarPathExperienceComponent);

const M = ProcessMetrics;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: ProcessPalette.canvas },
  safe: { flex: 1 },
  page: {
    flex: 1,
    paddingHorizontal: M.padH,
    paddingTop: 4,
    paddingBottom: 4,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: M.padH,
    paddingTop: 4,
    paddingBottom: M.footerPad + 8,
  },
  brandBand: {
    alignItems: 'center',
    flexShrink: 0,
    gap: M.headerGap,
    paddingTop: 2,
    paddingBottom: M.subtitleNetworkGap,
  },
  headlines: { alignItems: 'center', gap: 12, maxWidth: 326, paddingHorizontal: 4 },
  title: {
    fontFamily: Fonts.sans,
    fontWeight: '600',
    color: ProcessPalette.white,
    textAlign: 'center',
    letterSpacing: -0.12,
  },
  subtitle: {
    fontFamily: Fonts.sans,
    fontWeight: '400',
    color: ProcessPalette.muted,
    textAlign: 'center',
    lineHeight: 21,
    maxWidth: 320,
  },
  stage: {
    position: 'relative',
    flexDirection: 'column',
  },
  heroBand: {
    flexGrow: 1,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 2,
  },
  dockBand: {
    gap: M.dockGap,
    flexShrink: 0,
    paddingTop: M.networkCardGap,
    zIndex: 3,
  },
});
