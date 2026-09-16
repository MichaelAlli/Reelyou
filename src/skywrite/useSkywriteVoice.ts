import { Audio } from 'expo-av';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

import { formatDurationMs, requestMicrophonePermission, WebVoiceRecorder } from '@/skywrite/mediaActions';
import type { SkywriteAudioMedia } from '@/skywrite/types';

type VoicePhase = 'idle' | 'recording' | 'paused';

export function useSkywriteVoice() {
  const [phase, setPhase] = useState<VoicePhase>('idle');
  const [elapsedMs, setElapsedMs] = useState(0);
  const [audio, setAudio] = useState<SkywriteAudioMedia | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const nativeRecordingRef = useRef<Audio.Recording | null>(null);
  const webRecorderRef = useRef<WebVoiceRecorder | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingStartedAtRef = useRef(0);
  const pausedElapsedRef = useRef(0);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stopPlayback = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync().catch(() => undefined);
      await soundRef.current.unloadAsync().catch(() => undefined);
      soundRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    return () => {
      clearTimer();
      void stopPlayback();
      nativeRecordingRef.current?.stopAndUnloadAsync().catch(() => undefined);
      webRecorderRef.current?.cancel();
    };
  }, [clearTimer, stopPlayback]);

  const startTimer = useCallback(() => {
    clearTimer();
    timerRef.current = setInterval(() => {
      setElapsedMs(Date.now() - recordingStartedAtRef.current + pausedElapsedRef.current);
    }, 200);
  }, [clearTimer]);

  const startRecording = useCallback(async (): Promise<boolean> => {
    const granted = await requestMicrophonePermission();
    if (!granted) return false;

    await stopPlayback();
    setAudio(null);
    pausedElapsedRef.current = 0;
    recordingStartedAtRef.current = Date.now();
    setElapsedMs(0);

    if (Platform.OS === 'web') {
      const recorder = new WebVoiceRecorder();
      const started = await recorder.start();
      if (!started) return false;
      webRecorderRef.current = recorder;
      setPhase('recording');
      startTimer();
      return true;
    }

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();
      nativeRecordingRef.current = recording;
      setPhase('recording');
      startTimer();
      return true;
    } catch {
      return false;
    }
  }, [startTimer, stopPlayback]);

  const pauseRecording = useCallback(async () => {
    if (phase !== 'recording') return;
    pausedElapsedRef.current = elapsedMs;
    clearTimer();
    if (Platform.OS !== 'web' && nativeRecordingRef.current) {
      await nativeRecordingRef.current.pauseAsync().catch(() => undefined);
    }
    setPhase('paused');
  }, [clearTimer, elapsedMs, phase]);

  const resumeRecording = useCallback(async () => {
    if (phase !== 'paused') return;
    recordingStartedAtRef.current = Date.now();
    if (Platform.OS !== 'web' && nativeRecordingRef.current) {
      await nativeRecordingRef.current.startAsync().catch(() => undefined);
    }
    setPhase('recording');
    startTimer();
  }, [phase, startTimer]);

  const finishRecording = useCallback(async (): Promise<SkywriteAudioMedia | null> => {
    clearTimer();
    setPhase('idle');

    if (Platform.OS === 'web') {
      const recorder = webRecorderRef.current;
      webRecorderRef.current = null;
      const result = recorder ? await recorder.stop() : null;
      if (result) setAudio(result);
      setElapsedMs(result?.durationMs ?? 0);
      return result;
    }

    const recording = nativeRecordingRef.current;
    nativeRecordingRef.current = null;
    if (!recording) return null;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      const status = await recording.getStatusAsync();
      const durationMs =
        'durationMillis' in status && typeof status.durationMillis === 'number'
          ? status.durationMillis
          : elapsedMs;
      if (!uri) return null;
      const result: SkywriteAudioMedia = { uri, durationMs };
      setAudio(result);
      setElapsedMs(durationMs);
      return result;
    } catch {
      return null;
    }
  }, [clearTimer, elapsedMs]);

  const cancelRecording = useCallback(async () => {
    clearTimer();
    setPhase('idle');
    setElapsedMs(0);
    pausedElapsedRef.current = 0;

    if (Platform.OS === 'web') {
      webRecorderRef.current?.cancel();
      webRecorderRef.current = null;
      return;
    }

    const recording = nativeRecordingRef.current;
    nativeRecordingRef.current = null;
    if (recording) {
      await recording.stopAndUnloadAsync().catch(() => undefined);
    }
  }, [clearTimer]);

  const removeAudio = useCallback(async () => {
    await stopPlayback();
    setAudio(null);
    setElapsedMs(0);
  }, [stopPlayback]);

  const setExistingAudio = useCallback((next: SkywriteAudioMedia | null) => {
    void stopPlayback();
    setAudio(next);
    setElapsedMs(next?.durationMs ?? 0);
  }, [stopPlayback]);

  const togglePlayback = useCallback(async () => {
    if (!audio?.uri) return;

    if (isPlaying && soundRef.current) {
      await soundRef.current.pauseAsync().catch(() => undefined);
      setIsPlaying(false);
      return;
    }

    if (soundRef.current) {
      await soundRef.current.playAsync().catch(() => undefined);
      setIsPlaying(true);
      return;
    }

    try {
      if (Platform.OS !== 'web') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
        });
      }
      const { sound } = await Audio.Sound.createAsync(
        { uri: audio.uri },
        { shouldPlay: true },
        (status) => {
          if (!status.isLoaded) return;
          if (status.didJustFinish) {
            setIsPlaying(false);
          }
        },
      );
      soundRef.current = sound;
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  }, [audio, isPlaying]);

  return {
    phase,
    elapsedMs,
    elapsedLabel: formatDurationMs(elapsedMs),
    audio,
    isPlaying,
    isRecording: phase === 'recording' || phase === 'paused',
    startRecording,
    pauseRecording,
    resumeRecording,
    finishRecording,
    cancelRecording,
    removeAudio,
    setExistingAudio,
    togglePlayback,
  };
}
