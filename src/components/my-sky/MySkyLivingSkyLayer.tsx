import { memo, useEffect, useMemo, useRef } from 'react';
import { Easing } from 'react-native-reanimated';
import {
  runOnJS,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { CelestialConstellationRevealMotion, CelestialStarBreathMotion } from '@/constants/celestialMotion';
import { MySkyConstellationLayer } from '@/components/my-sky/MySkyConstellationLayer';
import { filterRelationshipsForReveal } from '@/mySky/buildConstellationIntelligence';
import type { SkyNode, SkyPattern, SkyRelationship } from '@/mySky/skyNodeTypes';
import type { MySkyVisibleLayers } from '@/mySky/skyLayers';
import { DEFAULT_MY_SKY_VISIBLE_LAYERS } from '@/mySky/skyLayers';
import type { MySkyStarDisplay } from '@/mySky/types';

interface MySkyLivingSkyLayerProps {
  width: number;
  height: number;
  userStars?: MySkyStarDisplay[];
  highlightStarId?: string | null;
  vitality?: number;
  patternRelationships?: SkyRelationship[];
  patternNodes?: SkyNode[];
  patterns?: SkyPattern[];
  visibleLayers?: MySkyVisibleLayers;
  /** User-triggered temporary constellation reveal — lines fade back out. */
  constellationRevealCount?: number;
  constellationRevealActive?: boolean;
  revealPatternId?: string | null;
  onRevealComplete?: () => void;
}

/** Tab / preview canvas — living stars with user-controlled layer behavior. */
function MySkyLivingSkyLayerComponent({
  width,
  height,
  userStars = [],
  highlightStarId = null,
  vitality = 1,
  patternRelationships = [],
  patternNodes = [],
  patterns = [],
  visibleLayers = DEFAULT_MY_SKY_VISIBLE_LAYERS,
  constellationRevealCount = 0,
  constellationRevealActive = false,
  revealPatternId = null,
  onRevealComplete,
}: MySkyLivingSkyLayerProps) {
  const trailOpacity = useSharedValue(0);
  const linksOpacity = useSharedValue(0);
  const starBreath = useSharedValue(0);
  const lastRevealCount = useRef(0);

  useEffect(() => {
    starBreath.value = withRepeat(
      withSequence(
        withTiming(1, { duration: CelestialStarBreathMotion.durationMs }),
        withTiming(0, { duration: CelestialStarBreathMotion.durationMs }),
      ),
      -1,
      false,
    );
  }, [starBreath]);

  useEffect(() => {
    if (constellationRevealCount <= lastRevealCount.current) return;
    lastRevealCount.current = constellationRevealCount;

    linksOpacity.value = withSequence(
      withTiming(CelestialConstellationRevealMotion.revealOpacity, {
        duration: CelestialConstellationRevealMotion.revealDurationMs,
        easing: Easing.out(Easing.cubic),
      }),
      withDelay(
        CelestialConstellationRevealMotion.holdDelayMs,
        withTiming(
          0,
          {
            duration: CelestialConstellationRevealMotion.fadeDurationMs,
            easing: Easing.out(Easing.quad),
          },
          (finished) => {
            if (finished && onRevealComplete) {
              runOnJS(onRevealComplete)();
            }
          },
        ),
      ),
    );
  }, [constellationRevealCount, linksOpacity, onRevealComplete]);

  const activeRelationships = useMemo(
    () => filterRelationshipsForReveal(patternRelationships, revealPatternId),
    [patternRelationships, revealPatternId],
  );

  const showPatternLinks = constellationRevealActive || visibleLayers.constellations;

  return (
    <MySkyConstellationLayer
      width={width}
      height={height}
      userStars={userStars}
      highlightStarId={highlightStarId}
      trailOpacity={trailOpacity}
      linksOpacity={linksOpacity}
      starBreath={starBreath}
      vitality={vitality}
      patternRelationships={activeRelationships}
      patternNodes={patternNodes}
      visibleLayers={visibleLayers}
      showPatternLinks={showPatternLinks}
    />
  );
}

export const MySkyLivingSkyLayer = memo(MySkyLivingSkyLayerComponent);
