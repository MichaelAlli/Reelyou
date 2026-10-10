import { LinearGradient } from 'expo-linear-gradient';
import { memo, useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { Fonts } from '@/constants/theme';
import { formatSkywriteAudioDuration } from '@/skywrite/media/skywriteMediaPreviewUtils';
import { pickSkyReelAudioInspirationPhrase } from '@/skywrite/play/skyReelAudioInspiration';

interface SkyReelAudioStoryStageProps {
  skywriteId: string;
  playSessionId: number;
  captionText?: string | null;
  isPlaying: boolean;
  isLoading: boolean;
  hasError: boolean;
  positionMs: number;
  durationMs: number;
}

const STAR_SEEDS = [12, 28, 44, 61, 73, 88, 102, 118, 134, 151, 167, 184];

function SkyReelAudioStoryStageComponent({
  skywriteId,
  playSessionId,
  captionText,
  isPlaying,
  isLoading,
  hasError,
  positionMs,
  durationMs,
}: SkyReelAudioStoryStageProps) {
  const pulse = useRef(new Animated.Value(0)).current;
  const ring = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: isPlaying ? 2200 : 3600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: isPlaying ? 2200 : 3600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    pulseLoop.start();
    return () => pulseLoop.stop();
  }, [isPlaying, pulse]);

  useEffect(() => {
    const ringLoop = Animated.loop(
      Animated.timing(ring, {
        toValue: 1,
        duration: isPlaying ? 4800 : 7200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    );
    ringLoop.start();
    return () => {
      ring.stopAnimation();
      ring.setValue(0);
    };
  }, [isPlaying, ring, skywriteId]);

  useEffect(() => {
    const shimmerLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 5200, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 5200, useNativeDriver: true }),
      ]),
    );
    shimmerLoop.start();
    return () => shimmerLoop.stop();
  }, [shimmer]);

  const orbScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, isPlaying ? 1.08 : 1.03],
  });
  const orbOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.88, 1],
  });
  const ringScale = ring.interpolate({
    inputRange: [0, 1],
    outputRange: [0.72, 1.35],
  });
  const ringOpacity = ring.interpolate({
    inputRange: [0, 0.15, 1],
    outputRange: [0.35, 0.22, 0],
  });

  const inspiration = useMemo(
    () => pickSkyReelAudioInspirationPhrase(skywriteId, playSessionId),
    [playSessionId, skywriteId],
  );
  const userCaption = captionText?.trim();
  const subtitle = userCaption || inspiration;
  const showDuration = durationMs > 0;
  const timeLabel = showDuration
    ? `${formatSkywriteAudioDuration(positionMs)} / ${formatSkywriteAudioDuration(durationMs)}`
    : isLoading
      ? 'Loading audio…'
      : '—';

  return (
    <View style={styles.root} pointerEvents="none">
      <LinearGradient
        colors={['#050814', '#0A1228', '#121A38', '#0E1630']}
        locations={[0, 0.35, 0.72, 1]}
        style={StyleSheet.absoluteFill}
      />
      {STAR_SEEDS.map((left) => (
        <View
          key={`star-${left}`}
          style={[
            styles.star,
            {
              left: `${left % 100}%`,
              top: `${(left * 7) % 88}%`,
              opacity: 0.15 + (left % 5) * 0.06,
            },
          ]}
        />
      ))}
      <Animated.View
        style={[
          styles.ring,
          {
            opacity: ringOpacity,
            transform: [{ scale: ringScale }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.ring,
          styles.ringDelayed,
          {
            opacity: ringOpacity,
            transform: [{ scale: ring.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.2] }) }],
          },
        ]}
      />
      <Animated.View style={[styles.orbOuter, { transform: [{ scale: orbScale }], opacity: orbOpacity }]}>
        <LinearGradient
          colors={['rgba(232, 200, 114, 0.95)', 'rgba(255, 248, 240, 0.55)', 'rgba(232, 200, 114, 0.35)']}
          style={styles.orb}
        />
        <View style={styles.orbCore} />
      </Animated.View>
      <Text style={styles.voiceLabel}>Voice in your sky</Text>
      {hasError ? (
        <Text style={styles.errorText}>This audio couldn’t be played.</Text>
      ) : (
        <Text style={styles.inspiration} numberOfLines={3}>
          {subtitle}
        </Text>
      )}
      <Text style={styles.time}>{timeLabel}</Text>
    </View>
  );
}

export const SkyReelAudioStoryStage = memo(SkyReelAudioStoryStageComponent);

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  star: {
    position: 'absolute',
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(255, 248, 240, 0.85)',
  },
  ring: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232, 200, 114, 0.35)',
  },
  ringDelayed: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderColor: 'rgba(255, 248, 240, 0.18)',
  },
  orbOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    shadowColor: '#E8C872',
    shadowOpacity: 0.45,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
  },
  orb: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  orbCore: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    opacity: 0.85,
  },
  voiceLabel: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: 'rgba(232, 200, 114, 0.75)',
    marginBottom: 10,
  },
  inspiration: {
    fontFamily: Fonts.serif,
    fontSize: 20,
    lineHeight: 28,
    color: 'rgba(255, 248, 240, 0.92)',
    textAlign: 'center',
    maxWidth: 300,
    paddingHorizontal: 32,
    marginTop: 8,
  },
  errorText: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    color: 'rgba(255, 200, 180, 0.9)',
    textAlign: 'center',
    paddingHorizontal: 32,
    marginTop: 8,
  },
  time: {
    position: 'absolute',
    bottom: 120,
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 248, 240, 0.72)',
    letterSpacing: 0.3,
  },
});
