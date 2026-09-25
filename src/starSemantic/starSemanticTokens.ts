/** Canonical semantic tokens — future approved UI maps these to colors (not used in render here). */
export const STAR_MEDIA_IMAGE = 'STAR_MEDIA_IMAGE';
export const STAR_MEDIA_VIDEO = 'STAR_MEDIA_VIDEO';
export const STAR_MEDIA_AUDIO = 'STAR_MEDIA_AUDIO';
export const STAR_MEDIA_TEXT = 'STAR_MEDIA_TEXT';
export const STAR_MEDIA_MIXED = 'STAR_MEDIA_MIXED';
export const STAR_GROWTH_MEANINGFUL = 'STAR_GROWTH_MEANINGFUL';

/** Intended future visual mapping (documentation only). */
export const STAR_SEMANTIC_VISUAL_MAP = {
  [STAR_MEDIA_IMAGE]: 'blue/cyan core',
  [STAR_MEDIA_VIDEO]: 'gold/yellow core',
  [STAR_MEDIA_AUDIO]: 'purple/violet core',
  [STAR_MEDIA_TEXT]: 'white/silver core',
  [STAR_MEDIA_MIXED]: 'primary media color',
  [STAR_GROWTH_MEANINGFUL]: 'warm amber/orange outer glow',
} as const;
