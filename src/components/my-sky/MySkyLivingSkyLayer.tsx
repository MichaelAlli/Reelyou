import { memo, useEffect } from 'react';
import { useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

import { CelestialConstellationRevealMotion, CelestialStarBreathMotion } from '@/constants/celestialMotion';
import { MySkyConstellationLayer } from '@/components/my-sky/MySkyConstellationLayer';
import type { SkyNode, SkyRelationship } from '@/mySky/skyNodeTypes';
import type { MySkyVisibleLayers } from '@/mySky/skyLayers';
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
  /** Briefly reveal ambient constellation lines on mount, then fade. */
  revealLinks?: boolean;
}

/** Tab / preview canvas — living stars with optional link reveal. */
function MySkyLivingSkyLayerComponent({
  width,
  height,
  userStars = [],
  highlightStarId = null,
  vitality = 1,
  patternRelationships = [],
  patternNodes = [],
  visibleLayers,
  revealLinks = true,
}: MySkyLivingSkyLayerProps) {
  const trailOpacity = useSharedValue(0);
  const linksOpacity = useSharedValue(0);
  const starBreath = useSharedValue(0);

  useEffect(() => {
    if (revealLinks) {
      linksOpacity.value = withSequence(
        withTiming(CelestialConstellationRevealMotion.revealOpacity, {
          duration: CelestialConstellationRevealMotion.revealDurationMs,
        }),
        withTiming(0, { duration: CelestialConstellationRevealMotion.fadeDurationMs }),
      );
    }
    starBreath.value = withRepeat(
      withSequence(
        withTiming(1, { duration: CelestialStarBreathMotion.durationMs }),
        withTiming(0, { duration: CelestialStarBreathMotion.durationMs }),
      ),
      -1,
      false,
    );
  }, [linksOpacity, revealLinks, starBreath]);

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
      visibleLayers={visibleLayers}
    />
  );
}

export const MySkyLivingSkyLayer = memo(MySkyLivingSkyLayerComponent);
