import { useEffect } from 'react';
import {
  Easing,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { easedProgress } from '@/components/process-starpath/processStarPathGeometry';
import { PROCESS_NODE_COUNT } from '@/components/process-starpath/processStarPathSpec';
import { PROCESS_INTRO_MS } from '@/process/processSessionConstants';

export function useProcessClock(reduceMotion: boolean): SharedValue<number> {
  const clock = useSharedValue(0);
  useEffect(() => {
    if (reduceMotion) {
      clock.value = PROCESS_INTRO_MS.total;
      return;
    }
    clock.value = withTiming(PROCESS_INTRO_MS.total, {
      duration: PROCESS_INTRO_MS.total,
      easing: Easing.linear,
    });
  }, [clock, reduceMotion]);
  return clock;
}

export function useStarReveal(clock: SharedValue<number>, reduceMotion: boolean) {
  return useDerivedValue(() =>
    reduceMotion
      ? 1
      : easedProgress(clock.value, PROCESS_INTRO_MS.starInStart, PROCESS_INTRO_MS.starInEnd),
  );
}

export function useNodeReveal(clock: SharedValue<number>, order: number, reduceMotion: boolean) {
  const span = (PROCESS_INTRO_MS.nodesEnd - PROCESS_INTRO_MS.nodesStart) / PROCESS_NODE_COUNT;
  const start = PROCESS_INTRO_MS.nodesStart + order * span;
  const end = start + span * 0.92;
  return useDerivedValue(() => (reduceMotion ? 1 : easedProgress(clock.value, start, end)));
}

export function useLinkReveal(clock: SharedValue<number>, order: number, reduceMotion: boolean) {
  const span = (PROCESS_INTRO_MS.linesEnd - PROCESS_INTRO_MS.linesStart) / PROCESS_NODE_COUNT;
  const start = PROCESS_INTRO_MS.linesStart + order * span;
  const end = start + span * 0.95;
  return useDerivedValue(() => (reduceMotion ? 1 : easedProgress(clock.value, start, end)));
}

export function useStarBreath(reduceMotion: boolean) {
  const breath = useSharedValue(1);
  useEffect(() => {
    if (reduceMotion) return;
    breath.value = withRepeat(
      withTiming(1.025, { duration: 3600, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [breath, reduceMotion]);
  return breath;
}
