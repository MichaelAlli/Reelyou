import { memo, useEffect, useMemo, useState } from 'react';
import {
  runOnJS,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { CelestialConstellationRevealMotion, CelestialStarBreathMotion } from '@/constants/celestialMotion';
import { MySkyConstellationLayer } from '@/components/my-sky/MySkyConstellationLayer';
import type { SkyNode, SkyRelationship } from '@/mySky/skyNodeTypes';
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
  visibleLayers?: MySkyVisibleLayers;
  /** User-triggered temporary constellation reveal — lines fade back out. */
  constellationRevealCount?: number;
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
  visibleLayers = DEFAULT_MY_SKY_VISIBLE_LAYERS,
  constellationRevealCount = 0,
}: MySkyLivingSkyLayerProps) {
  const trailOpacity = useSharedValue(0);
  const linksOpacity = useSharedValue(0);
  const starBreath = useSharedValue(0);
  const [constellationRevealActive, setConstellationRevealActive] = useState(false);

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
    if (constellationRevealCount <= 0) return;

    setConstellationRevealActive(true);
    linksOpacity.value = withSequence(
      withTiming(CelestialConstellationRevealMotion.revealOpacity, {
        duration: CelestialConstellationRevealMotion.revealDurationMs,
      }),
      withTiming(0, { duration: CelestialConstellationRevealMotion.fadeDurationMs }, (finished) => {
        if (finished) {
          runOnJS(setConstellationRevealActive)(false);
        }
      }),
    );
  }, [constellationRevealCount, linksOpacity]);

  const effectiveLayers = useMemo(
    (): MySkyVisibleLayers => ({
      ...visibleLayers,
      constellations: constellationRevealActive || visibleLayers.constellations,
    }),
    [visibleLayers, constellationRevealActive],
  );

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
      patternRelationships={patternRelationships}
      patternNodes={patternNodes}
      visibleLayers={effectiveLayers}
    />
  );
}

export const MySkyLivingSkyLayer = memo(MySkyLivingSkyLayerComponent);
