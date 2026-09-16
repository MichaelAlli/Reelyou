/** Transient handoff after Skywrite share — animation + My Sky arrival. */
export type SkywriteStatus = 'animating' | 'settled';

export interface SkyArrivalHandoff {
  skywriteId: string;
  skyNodeId: string;
  justAddedToSky: true;
  skywriteStatus: SkywriteStatus;
}

export const EMPTY_SKY_ARRIVAL: SkyArrivalHandoff | null = null;

export function buildSkyNodeId(skywriteId: string): string {
  return `star-${skywriteId}`;
}
