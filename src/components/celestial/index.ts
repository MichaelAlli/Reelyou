/**
 * REELYOU Beta MVP — locked celestial visual system.
 * Reuse for My Sky, Skywrite arrival, StarPath, Companion, Public Sky, etc.
 */

export {
  PinpointStar,
  FourPointStar,
  CompactFourPointStar,
  SixPointSparkle,
  PremiumStar,
  GlowingStar,
  HeroStar,
  ConstellationLine,
  ConstellationLink,
  MilestoneNode,
  MilestoneMarker,
  MilestoneOrb,
  LuminousStar,
  DustStar,
} from '@/components/celestial/CelestialStarPrimitives';

export {
  ShootingStarTrail,
  type ShootingStarTrailVariant,
  type ShootingStarTrailLayer,
} from '@/components/celestial/ShootingStarTrail';
export { StarPulse } from '@/components/celestial/StarPulse';
export { SkyGlow, SkyAtmosphereTint } from '@/components/celestial/SkyGlow';
export { buildShootingStarPathD, sampleQuadraticPath } from '@/components/celestial/celestialGeometry';

export {
  CelestialPalette,
  CelestialSkyAtmosphere,
  CelestialNodeColors,
  CelestialConstellationStroke,
  CelestialShootingStarTrail,
  CelestialStarBloom,
  CelestialStarGeometry,
  type CelestialColorFamily,
  type CelestialStarVisualProps,
} from '@/constants/celestialTokens';

export {
  CelestialStarBreathMotion,
  CelestialArrivalMotion,
  CelestialConstellationRevealMotion,
  CelestialShootingStarFlightMotion,
  CelestialStarPulseMotion,
} from '@/constants/celestialMotion';
