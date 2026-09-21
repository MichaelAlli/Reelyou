export const LIVING_WORLD_ENGINE_VERSION = 'beta-v1';

export const EMERGENCE_PACING = {
  majorCooldownMs: 45_000,
  exploreAcceleratedCooldownMs: 8_000,
  emergingSettleMs: 2_400,
} as const;

export const SPATIAL_LAYOUT = {
  minRefSpacingY: 0.085,
  minRefSpacingX: 0.1,
  growthRefYMin: 1.04,
  growthRefYMax: 1.42,
  leftBranchIds: ['learning', 'community'] as const,
} as const;

export const DYNAMIC_DENSITY = {
  maxVisibleDynamicNodes: 4,
  maxSimultaneousEmergence: 1,
  explorationRevealMax: 1,
} as const;

export const MILESTONE_RULES = {
  minSettledNodesPerBranch: 3,
} as const;
