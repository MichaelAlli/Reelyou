/**
 * Locked My Sky visual baseline — animation must not rewrite stars.
 *
 * Star positions, colors, sizes, and count come only from `buildMySkyView` /
 * `MY_SKY_DISPLAY_CONSTELLATIONS` + projected `MySkyStarDisplay[]`.
 *
 * Allowed motion on the star field: subtle breath opacity only (`starBreath`).
 * Constellation connector lines and shooting-star trail are separate overlays
 * controlled by `linksOpacity` and `trailOpacity` only.
 */
export const MY_SKY_STAR_FIELD_LOCKED = true;

/** Shared-value keys that may animate without changing star layout data. */
export const MY_SKY_ALLOWED_STAR_MOTION = ['starBreath'] as const;

export const MY_SKY_OVERLAY_MOTION = ['linksOpacity', 'trailOpacity'] as const;
