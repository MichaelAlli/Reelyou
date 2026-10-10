/** Lower priority number wins when multiple guidance surfaces are eligible. */
export const GUIDANCE_PRIORITY = {
  my_sky_star_meaning: 10,
  my_sky_nav_overview: 20,
  spatial_edge_hint: 30,
  my_sky_joined_groups_coachmark: 40,
  my_sky_constellations_coachmark: 50,
} as const;

export type GuidanceSlotId = keyof typeof GUIDANCE_PRIORITY;

export interface GuidanceClaim {
  id: GuidanceSlotId;
  active: boolean;
}

/** Returns the single guidance slot that may be visible, or null. */
export function selectActiveGuidance(claims: GuidanceClaim[]): GuidanceSlotId | null {
  const active = claims.filter((claim) => claim.active);
  if (active.length === 0) {
    return null;
  }
  active.sort((a, b) => GUIDANCE_PRIORITY[a.id] - GUIDANCE_PRIORITY[b.id]);
  return active[0]?.id ?? null;
}

export function isGuidanceSlotActive(
  slot: GuidanceSlotId,
  claims: GuidanceClaim[],
): boolean {
  return selectActiveGuidance(claims) === slot;
}
