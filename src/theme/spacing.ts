/**
 * REELYOU spacing scale.
 */
export const spacing = {
  Spacing4: 4,
  Spacing8: 8,
  Spacing12: 12,
  Spacing16: 16,
  Spacing20: 20,
  Spacing24: 24,
  Spacing32: 32,
  Spacing40: 40,
  Spacing48: 48,
  Spacing64: 64,
  Spacing80: 80,
} as const;

export type SpacingToken = keyof typeof spacing;
