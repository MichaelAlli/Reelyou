import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, BackHandler } from 'react-native';
import {
  runOnJS,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { ReelyouEasing } from '@/constants/animation';
import { HomeMotion } from '@/constants/homeLayout';
import { ProcessScreenCopy } from '@/constants/processScreenCopy';
import { markHomeArrivalPending } from '@/home';
import { useOnboarding } from '@/onboarding';
import {
  PROCESS_COMPLETION_LINGER_MS,
  PROCESS_MIN_DISPLAY_MS,
  PROCESS_SESSION_DURATION_MS,
} from '@/process/processSessionConstants';

export interface ProcessProgressState {
  /** 0–1 animated progress value */
  progress: SharedValue<number>;
  /** Current status copy shown in the insight card */
  statusLabel: string;
  /** Whether reduce-motion is enabled */
  reduceMotion: boolean;
  /** Whether onboarding completion has fired */
  isComplete: boolean;
  /** Fade-out shared value for exit transition */
  exitOpacity: SharedValue<number>;
}

export interface ProcessSessionActions {
  /** Navigate to Home after processing completes */
  onNavigateHome: () => void;
  /** Begin the processing timeline — call when ProcessStarPathExperience mounts */
  startProcessing: () => void;
}

function scheduleExit(startedAt: number, finish: () => void) {
  const elapsed = Date.now() - startedAt;
  const holdUntil = Math.max(elapsed, PROCESS_MIN_DISPLAY_MS) + PROCESS_COMPLETION_LINGER_MS;
  const remaining = Math.max(0, holdUntil - elapsed);
  setTimeout(finish, remaining);
}

/**
 * Preserved process-session orchestration — onboarding completion, timing,
 * progress, and Home navigation. UI-agnostic; consumed by ProcessStarPathExperience.
 */
export function useProcessSession(): ProcessProgressState & ProcessSessionActions {
  const router = useRouter();
  const { completeOnboarding } = useOnboarding();

  const [statusLabel, setStatusLabel] = useState(ProcessScreenCopy.statusPrimary);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const done = useRef(false);
  const started = useRef(false);
  const startedAt = useRef(0);

  const progress = useSharedValue(0);
  const exitOpacity = useSharedValue(1);

  const onNavigateHome = useCallback(() => {
    markHomeArrivalPending();
    router.replace('/home' as never);
  }, [router]);

  const finish = useCallback(() => {
    if (done.current) return;
    done.current = true;
    setIsComplete(true);
    completeOnboarding();
    exitOpacity.value = withTiming(
      0,
      { duration: HomeMotion.screenTransitionMs, easing: ReelyouEasing.out },
      (ok) => {
        if (ok) runOnJS(onNavigateHome)();
      },
    );
  }, [completeOnboarding, exitOpacity, onNavigateHome]);

  const startProcessing = useCallback(() => {
    if (started.current) return;
    started.current = true;
    startedAt.current = Date.now();

    if (reduceMotion) {
      progress.value = 1;
      setStatusLabel(ProcessScreenCopy.statusPrimary);
      scheduleExit(startedAt.current, finish);
      return;
    }

    progress.value = withTiming(1, {
      duration: PROCESS_SESSION_DURATION_MS,
      easing: ReelyouEasing.inOut,
    });

    let processingDone = false;

    const tick = setInterval(() => {
      const elapsed = Date.now() - startedAt.current;
      const r = Math.min(1, elapsed / PROCESS_SESSION_DURATION_MS);

      if (r < 0.26) setStatusLabel(ProcessScreenCopy.statusPhase1);
      else if (r < 0.74) setStatusLabel(ProcessScreenCopy.statusPhase2);
      else setStatusLabel(ProcessScreenCopy.statusPhase3);

      if (r >= 1 && !processingDone) {
        processingDone = true;
        clearInterval(tick);
        scheduleExit(startedAt.current, finish);
      }
    }, 60);
  }, [finish, progress, reduceMotion]);

  useEffect(() => {
    let live = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => {
      if (live) setReduceMotion(v);
    });
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, []);

  return {
    progress,
    statusLabel,
    reduceMotion,
    isComplete,
    exitOpacity,
    onNavigateHome,
    startProcessing,
  };
}
