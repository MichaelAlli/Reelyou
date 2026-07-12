/**
 * REELYOU border-radius tokens.
 */
export const radius = {
  Small: 8,
  Medium: 12,
  Large: 16,
  XL: 24,
  Pill: 999,
} as const;

export type RadiusToken = keyof typeof radius;
