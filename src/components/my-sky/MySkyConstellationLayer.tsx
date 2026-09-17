import { memo, useMemo } from 'react';
import Animated, { useAnimatedProps, type SharedValue } from 'react-native-reanimated';
import Svg, { Circle, G, Line } from 'react-native-svg';

import {
  CelestialConstellationStroke,
  CelestialPalette,
  CelestialStarBloom,
  CelestialStarGeometry,
  FourPointStar,
  PinpointStar,
  PremiumStar,
  ShootingStarTrail,
} from '@/components/celestial';
import { CelestialStarBreathMotion } from '@/constants/celestialMotion';
import {
  MY_SKY_DISPLAY_CONSTELLATIONS,
} from '@/mySky/constellationLayout';
import type { SkyNode, SkyRelationship } from '@/mySky/skyNodeTypes';
import { isLayerVisible } from '@/mySky/skyLayers';
import type { MySkyVisibleLayers } from '@/mySky/skyLayers';
import type { MySkyStarDisplay } from '@/mySky/types';

const AnimatedG = Animated.createAnimatedComponent(G);

interface MySkyConstellationLayerProps {
  width: number;
  height: number;
  userStars?: MySkyStarDisplay[];
  highlightStarId?: string | null;
  /** 0–1 — golden trail opacity during arrival settle. */
  trailOpacity: SharedValue<number>;
  /** 0–1 — constellation connector lines. */
  linksOpacity: SharedValue<number>;
  /** 0–1 — subtle breathing on star field. */
  starBreath: SharedValue<number>;
  /** Slightly brighter field as user adds more skywrites. */
  vitality?: number;
  /** Pattern edges from centralized model — only rendered when constellations layer is on. */
  patternRelationships?: SkyRelationship[];
  patternNodes?: SkyNode[];
  visibleLayers?: MySkyVisibleLayers;
}

function toPx(star: { x: number; y: number }, size: { w: number; h: number }) {
  return { cx: star.x * size.w, cy: star.y * size.h };
}

function MySkyConstellationLayerComponent({
  width,
  height,
  userStars = [],
  highlightStarId = null,
  trailOpacity,
  linksOpacity,
  starBreath,
  vitality = 1,
  patternRelationships = [],
  patternNodes = [],
  visibleLayers,
}: MySkyConstellationLayerProps) {
  const showPatternLinks = visibleLayers ? isLayerVisible(visibleLayers, 'constellations') : false;
  const nodeById = useMemo(
    () => new Map(patternNodes.map((node) => [node.id, node])),
    [patternNodes],
  );

  const highlight = userStars.find((s) => s.id === highlightStarId) ?? null;

  const trailAnimatedProps = useAnimatedProps(() => ({
    opacity: trailOpacity.value,
  }));

  const linksAnimatedProps = useAnimatedProps(() => ({
    opacity: linksOpacity.value,
  }));

  const starsAnimatedProps = useAnimatedProps(() => ({
    opacity: CelestialStarBreathMotion.opacityBase + starBreath.value * CelestialStarBreathMotion.opacityRange,
  }));

  const baseIntensity = Math.min(1.45, 1.05 + (vitality - 1) * 0.35);

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {Array.from({ length: 64 }).map((_, i) => (
        <PinpointStar
          key={`dust-${i}`}
          cx={(i * 53) % width}
          cy={(i * 97) % (height * 0.88)}
          color={CelestialPalette.warmWhite}
          opacity={0.35 + (i % 5) * 0.08}
          size={i % 4 === 0 ? 0.5 : 0.35}
        />
      ))}

      <AnimatedG animatedProps={linksAnimatedProps}>
        {MY_SKY_DISPLAY_CONSTELLATIONS.map((group) =>
          group.links.map(([a, b], linkIndex) => {
            const p1 = toPx(group.stars[a], { w: width, h: height });
            const p2 = toPx(group.stars[b], { w: width, h: height });
            return (
              <Line
                key={`${group.id}-link-${linkIndex}`}
                x1={p1.cx}
                y1={p1.cy}
                x2={p2.cx}
                y2={p2.cy}
                stroke={group.color}
                strokeWidth={CelestialConstellationStroke.display.strokeWidth}
                strokeOpacity={CelestialConstellationStroke.display.strokeOpacity}
                strokeLinecap="round"
              />
            );
          }),
        )}
        {showPatternLinks
          ? patternRelationships.map((edge) => {
              const from = nodeById.get(edge.fromNodeId);
              const to = nodeById.get(edge.toNodeId);
              if (!from || !to) return null;
              return (
                <Line
                  key={edge.id}
                  x1={from.position.x * width}
                  y1={from.position.y * height}
                  x2={to.position.x * width}
                  y2={to.position.y * height}
                  stroke={CelestialConstellationStroke.pattern.stroke}
                  strokeWidth={CelestialConstellationStroke.pattern.strokeWidth}
                  strokeLinecap="round"
                />
              );
            })
          : null}
      </AnimatedG>

      <AnimatedG animatedProps={starsAnimatedProps}>
        {MY_SKY_DISPLAY_CONSTELLATIONS.map((group) =>
          group.stars.map((star, index) => {
            const { cx, cy } = toPx(star, { w: width, h: height });
            const id = `${group.id}-${index}`;
            const sizeScale = 1 + (vitality - 1) * 0.12;
            return index === 0 || index === group.stars.length - 1 ? (
              <PremiumStar
                key={id}
                id={id}
                cx={cx}
                cy={cy}
                size={star.size * sizeScale}
                color={group.color}
                intensity={baseIntensity}
              />
            ) : (
              <FourPointStar
                key={id}
                id={id}
                cx={cx}
                cy={cy}
                size={star.size * 0.82 * sizeScale}
                color={group.color}
                opacity={0.94}
                rotation={(cx + cy) % 40}
              />
            );
          }),
        )}

        {userStars.map((star) => {
          if (star.id === highlightStarId) return null;
          const { cx, cy } = toPx(star, { w: width, h: height });
          const size = star.visualSize ?? CelestialStarGeometry.defaultUserStarSize + (vitality - 1) * 1.2;
          const intensity = star.visualBrightness ?? 0.88 + (vitality - 1) * 0.15;
          return size >= CelestialStarGeometry.userStarPremiumThreshold ? (
            <PremiumStar
              key={star.id}
              id={star.id}
              cx={cx}
              cy={cy}
              size={size}
              color={star.color}
              intensity={intensity}
            />
          ) : (
            <FourPointStar
              key={star.id}
              id={star.id}
              cx={cx}
              cy={cy}
              size={size}
              color={star.color}
              opacity={Math.min(1, intensity)}
            />
          );
        })}
      </AnimatedG>

      <AnimatedG animatedProps={trailAnimatedProps}>
        <ShootingStarTrail width={width} height={height} variant="settled" gradientId="shootTrailGold" />
      </AnimatedG>

      {highlight ? (
        <G>
          <Circle
            cx={highlight.x * width}
            cy={highlight.y * height}
            r={CelestialStarBloom.highlightGlow.radius}
            fill={highlight.color}
            opacity={CelestialStarBloom.highlightGlow.opacity}
          />
          <PremiumStar
            id="highlight-star"
            cx={highlight.x * width}
            cy={highlight.y * height}
            size={highlight.visualSize ?? 9 + (vitality - 1) * 1.5}
            color={highlight.color || CelestialPalette.skywriteGold}
            intensity={highlight.visualBrightness ?? 1.45}
          />
        </G>
      ) : null}
    </Svg>
  );
}

export const MySkyConstellationLayer = memo(MySkyConstellationLayerComponent);
