/**
 * REELYOU semantic color tokens.
 * All color values live here — never hardcode in components.
 */
export const colors = {
  BackgroundPrimary: '#050818',
  BackgroundSecondary: '#0A0F2E',
  Surface: '#101848',
  White: '#FFFFFF',
  Black: '#000000',
  TextPrimary: 'rgba(255, 255, 255, 0.92)',
  TextSecondary: 'rgba(255, 255, 255, 0.88)',
  Gold: '#D4AF37',
  Purple: '#9B6FD4',
  Divider: 'rgba(212, 175, 55, 0.55)',
  OverlayDark: 'rgba(3, 5, 16, 0.35)',
} as const;

export type ColorToken = keyof typeof colors;
