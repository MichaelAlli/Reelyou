import { useCallback, useEffect, useRef, useState } from 'react';

import type { LegacyMoment } from '@/legacy/legacyMomentTypes';
import { reelSceneDurationMs, REEL_SCENE_MIN_MS } from '@/legacy/reelYouSceneDuration';

export function useReelYouPlaybackEngine(
  sceneIds: readonly string[],
  momentForIndex: (index: number) => LegacyMoment | undefined,
) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [sceneProgress, setSceneProgress] = useState(0);

  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sceneStartedAtRef = useRef<number>(0);
  const sceneDurationRef = useRef<number>(reelSceneDurationMs(undefined));
  const playingRef = useRef(false);
  const indexRef = useRef(0);
  const sceneIdsRef = useRef(sceneIds);
  const momentForIndexRef = useRef(momentForIndex);

  playingRef.current = playing;
  indexRef.current = index;
  sceneIdsRef.current = sceneIds;
  momentForIndexRef.current = momentForIndex;

  const clearAdvanceTimer = useCallback(() => {
    if (advanceTimerRef.current != null) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
  }, []);

  const clearProgressTimer = useCallback(() => {
    if (progressTimerRef.current != null) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  }, []);

  const clearAllTimers = useCallback(() => {
    clearAdvanceTimer();
    clearProgressTimer();
  }, [clearAdvanceTimer, clearProgressTimer]);

  const scheduleSceneTimers = useCallback(() => {
    clearAllTimers();
    if (!playingRef.current) return;

    const ids = sceneIdsRef.current;
    const idx = indexRef.current;
    if (ids.length === 0) return;

    const moment = momentForIndexRef.current(idx);
    const durationMs = Math.max(reelSceneDurationMs(moment), REEL_SCENE_MIN_MS);
    sceneDurationRef.current = durationMs;
    sceneStartedAtRef.current = Date.now();
    setSceneProgress(0);

    progressTimerRef.current = setInterval(() => {
      if (!playingRef.current) return;
      const elapsed = Date.now() - sceneStartedAtRef.current;
      setSceneProgress(Math.min(1, elapsed / sceneDurationRef.current));
    }, 100);

    advanceTimerRef.current = setTimeout(() => {
      if (!playingRef.current) return;
      const currentIndex = indexRef.current;
      const length = sceneIdsRef.current.length;
      setSceneProgress(1);
      if (currentIndex < length - 1) {
        setIndex(currentIndex + 1);
      } else {
        playingRef.current = false;
        setPlaying(false);
        setCompleted(true);
        clearAllTimers();
      }
    }, durationMs);
  }, [clearAllTimers]);

  useEffect(() => {
    if (playing) {
      scheduleSceneTimers();
    } else {
      clearAllTimers();
    }
    return clearAllTimers;
  }, [playing, index, sceneIds.length, scheduleSceneTimers, clearAllTimers]);

  const play = useCallback(() => {
    setCompleted(false);
    playingRef.current = true;
    setPlaying(true);
  }, []);

  const pause = useCallback(() => {
    playingRef.current = false;
    setPlaying(false);
    clearAllTimers();
  }, [clearAllTimers]);

  const togglePlay = useCallback(() => {
    if (playingRef.current) {
      pause();
    } else {
      play();
    }
  }, [pause, play]);

  const goNext = useCallback(() => {
    setCompleted(false);
    setIndex((current) => Math.min(current + 1, Math.max(sceneIdsRef.current.length - 1, 0)));
  }, []);

  const goPrevious = useCallback(() => {
    setCompleted(false);
    setIndex((current) => Math.max(current - 1, 0));
  }, []);

  const replay = useCallback(() => {
    setIndex(0);
    setCompleted(false);
    setSceneProgress(0);
    playingRef.current = true;
    setPlaying(true);
  }, []);

  const cleanup = useCallback(() => {
    playingRef.current = false;
    setPlaying(false);
    clearAllTimers();
  }, [clearAllTimers]);

  return {
    index,
    playing,
    completed,
    sceneProgress,
    play,
    pause,
    togglePlay,
    goNext,
    goPrevious,
    replay,
    cleanup,
  };
}
