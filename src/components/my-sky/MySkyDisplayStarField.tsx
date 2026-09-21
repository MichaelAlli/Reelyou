/**
 * LOCKED REELYOU STAR VISUAL SYSTEM — do not replace, restyle, regenerate, or substitute without explicit product approval.
 *
 * Decorative display field only (`MY_SKY_DISPLAY_CONSTELLATIONS`). Constellation links and tap
 * hitboxes live in separate locked layers.
 */
import { memo, useMemo } from 'react';
import { G } from 'react-native-svg';

import {
  ApprovedReelyouStar,
  approvedDisplayStarIntensities,
  approvedDustColor,
} from '@/components/celestial/ApprovedReelyouStar';
import { MY_SKY_DISPLAY_CONSTELLATIONS } from '@/mySky/constellationLayout';

function toPx(star: { x: number; y: number }, width: number, height: number) {
  return { cx: star.x * width, cy: star.y * height };
}

/** Stable colored micro-stars — ring-adjacent depth (normalized 0–1, display-only). */
const DISPLAY_DUST: ReadonlyArray<{ x: number; y: number; opacity: number; size: number }> = [
  { x: 0.08, y: 0.09, opacity: 0.5, size: 0.38 },
  { x: 0.15, y: 0.16, opacity: 0.46, size: 0.34 },
  { x: 0.32, y: 0.07, opacity: 0.48, size: 0.36 },
  { x: 0.44, y: 0.08, opacity: 0.52, size: 0.4 },
  { x: 0.58, y: 0.09, opacity: 0.5, size: 0.36 },
  { x: 0.72, y: 0.11, opacity: 0.48, size: 0.34 },
  { x: 0.9, y: 0.14, opacity: 0.5, size: 0.38 },
  { x: 0.06, y: 0.26, opacity: 0.48, size: 0.34 },
  { x: 0.34, y: 0.22, opacity: 0.5, size: 0.36 },
  { x: 0.5, y: 0.19, opacity: 0.52, size: 0.38 },
  { x: 0.64, y: 0.24, opacity: 0.48, size: 0.34 },
  { x: 0.88, y: 0.3, opacity: 0.46, size: 0.32 },
  { x: 0.1, y: 0.4, opacity: 0.5, size: 0.36 },
  { x: 0.3, y: 0.36, opacity: 0.48, size: 0.34 },
  { x: 0.48, y: 0.32, opacity: 0.54, size: 0.38 },
  { x: 0.68, y: 0.38, opacity: 0.5, size: 0.34 },
  { x: 0.92, y: 0.46, opacity: 0.48, size: 0.32 },
  { x: 0.12, y: 0.54, opacity: 0.5, size: 0.34 },
  { x: 0.28, y: 0.5, opacity: 0.52, size: 0.36 },
  { x: 0.46, y: 0.46, opacity: 0.5, size: 0.34 },
  { x: 0.58, y: 0.5, opacity: 0.52, size: 0.36 },
  { x: 0.78, y: 0.52, opacity: 0.48, size: 0.32 },
  { x: 0.08, y: 0.64, opacity: 0.46, size: 0.32 },
  { x: 0.22, y: 0.68, opacity: 0.5, size: 0.34 },
  { x: 0.38, y: 0.62, opacity: 0.48, size: 0.34 },
  { x: 0.52, y: 0.58, opacity: 0.52, size: 0.36 },
  { x: 0.7, y: 0.64, opacity: 0.48, size: 0.32 },
  { x: 0.86, y: 0.68, opacity: 0.5, size: 0.34 },
  { x: 0.18, y: 0.12, opacity: 0.44, size: 0.3 },
  { x: 0.42, y: 0.14, opacity: 0.46, size: 0.32 },
  { x: 0.76, y: 0.16, opacity: 0.44, size: 0.3 },
  { x: 0.24, y: 0.42, opacity: 0.46, size: 0.32 },
  { x: 0.84, y: 0.24, opacity: 0.48, size: 0.34 },
  { x: 0.36, y: 0.56, opacity: 0.5, size: 0.34 },
  { x: 0.62, y: 0.44, opacity: 0.48, size: 0.32 },
  { x: 0.14, y: 0.34, opacity: 0.42, size: 0.28 },
  { x: 0.94, y: 0.4, opacity: 0.44, size: 0.3 },
  { x: 0.54, y: 0.24, opacity: 0.5, size: 0.36 },
  { x: 0.4, y: 0.28, opacity: 0.48, size: 0.32 },
  { x: 0.6, y: 0.34, opacity: 0.46, size: 0.3 },
  { x: 0.26, y: 0.18, opacity: 0.44, size: 0.3 },
  { x: 0.82, y: 0.2, opacity: 0.46, size: 0.32 },
  { x: 0.04, y: 0.48, opacity: 0.42, size: 0.28 },
  { x: 0.96, y: 0.56, opacity: 0.44, size: 0.3 },
  { x: 0.5, y: 0.42, opacity: 0.5, size: 0.34 },
  { x: 0.2, y: 0.58, opacity: 0.46, size: 0.32 },
  { x: 0.74, y: 0.46, opacity: 0.48, size: 0.34 },
  { x: 0.16, y: 0.72, opacity: 0.44, size: 0.3 },
  { x: 0.44, y: 0.66, opacity: 0.48, size: 0.32 },
  { x: 0.66, y: 0.72, opacity: 0.46, size: 0.3 },
];

interface MySkyDisplayStarFieldProps {
  width: number;
  height: number;
  vitality?: number;
}

function MySkyDisplayStarFieldComponent({ width, height, vitality = 1 }: MySkyDisplayStarFieldProps) {
  if (width <= 0 || height <= 0) return null;

  const { focal, mid, sizeScale } = approvedDisplayStarIntensities(vitality);
  const clusterColors = useMemo(
    () => MY_SKY_DISPLAY_CONSTELLATIONS.map((group) => group.color),
    [],
  );

  return (
    <>
      {DISPLAY_DUST.map((dust, i) => {
        const { cx, cy } = toPx(dust, width, height);
        return (
          <ApprovedReelyouStar
            key={`dust-${i}`}
            id={`display-dust-${i}`}
            cx={cx}
            cy={cy}
            size={dust.size}
            color={approvedDustColor(i, clusterColors)}
            role="dust"
            opacity={dust.opacity}
          />
        );
      })}

      <G opacity={1}>
        {MY_SKY_DISPLAY_CONSTELLATIONS.map((group) =>
          group.stars.map((star, index) => {
            const { cx, cy } = toPx(star, width, height);
            const id = `display-${group.id}-${index}`;
            const isAnchor = index === 0 || index === group.stars.length - 1;
            const renderedSize = star.size * sizeScale;

            if (isAnchor) {
              return (
                <ApprovedReelyouStar
                  key={id}
                  id={id}
                  cx={cx}
                  cy={cy}
                  size={renderedSize}
                  color={group.color}
                  role="focal"
                  intensity={focal}
                />
              );
            }

            if (star.size >= 5.6) {
              return (
                <ApprovedReelyouStar
                  key={id}
                  id={id}
                  cx={cx}
                  cy={cy}
                  size={renderedSize * 0.94}
                  color={group.color}
                  role="focal"
                  intensity={mid}
                />
              );
            }

            return (
              <ApprovedReelyouStar
                key={id}
                id={id}
                cx={cx}
                cy={cy}
                size={renderedSize}
                color={group.color}
                role="mid"
                opacity={1}
                rotation={(cx + cy) % 40}
              />
            );
          }),
        )}
      </G>
    </>
  );
}

export const MySkyDisplayStarField = memo(MySkyDisplayStarFieldComponent);
