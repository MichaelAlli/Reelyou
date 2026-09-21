/**
 * LOCKED REELYOU STAR VISUAL SYSTEM — do not replace, restyle, regenerate, or substitute without explicit product approval.
 *
 * Canonical presentation for decorative and interactive stars. Uses approved PremiumStar /
 * FourPointStar / SixPointSparkle / PinpointStar primitives only — no alternate glyphs.
 */
import { FourPointStar, PinpointStar, PremiumStar, SixPointSparkle } from '@/components/celestial/CelestialStarPrimitives';
import { CelestialPalette } from '@/constants/celestialTokens';

export type ApprovedReelyouStarRole = 'focal' | 'mid' | 'accent' | 'dust';

export const ApprovedReelyouStarIntensity = {
  focalBase: 1.28,
  focalVitalityBoost: 0.35,
  midBase: 1.14,
  midVitalityBoost: 0.28,
  accentOpacity: 0.58,
} as const;

export interface ApprovedReelyouStarProps {
  id: string;
  cx: number;
  cy: number;
  size: number;
  color: string;
  role: ApprovedReelyouStarRole;
  /** Focal bloom strength (1 = approved base). */
  intensity?: number;
  opacity?: number;
  rotation?: number;
}

export function ApprovedReelyouStar({
  id,
  cx,
  cy,
  size,
  color,
  role,
  intensity = ApprovedReelyouStarIntensity.focalBase,
  opacity = 1,
  rotation = 0,
}: ApprovedReelyouStarProps) {
  switch (role) {
    case 'focal':
      return (
        <PremiumStar id={id} cx={cx} cy={cy} size={size} color={color} intensity={intensity} />
      );
    case 'mid':
      return (
        <FourPointStar
          id={id}
          cx={cx}
          cy={cy}
          size={size}
          color={color}
          opacity={opacity}
          rotation={rotation}
        />
      );
    case 'accent':
      return (
        <SixPointSparkle
          id={id}
          cx={cx}
          cy={cy}
          size={size}
          color={color}
          opacity={opacity}
        />
      );
    case 'dust':
      return (
        <PinpointStar cx={cx} cy={cy} color={color} opacity={opacity} size={size} />
      );
    default:
      return null;
  }
}

/** Approved vitality-scaled intensities for cluster display stars. */
export function approvedDisplayStarIntensities(vitality = 1) {
  return {
    focal: Math.min(1.45, ApprovedReelyouStarIntensity.focalBase + (vitality - 1) * ApprovedReelyouStarIntensity.focalVitalityBoost),
    mid: Math.min(1.38, ApprovedReelyouStarIntensity.midBase + (vitality - 1) * ApprovedReelyouStarIntensity.midVitalityBoost),
    sizeScale: 1 + (vitality - 1) * 0.12,
  };
}

export function approvedDustColor(index: number, clusterColors: readonly string[]): string {
  if (clusterColors.length === 0) return CelestialPalette.warmWhite;
  return clusterColors[index % clusterColors.length] ?? CelestialPalette.warmWhite;
}
