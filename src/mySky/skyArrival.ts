import type { MySkyStarDisplay } from '@/mySky/types';

/** Transient handoff after Skywrite share — animation + My Sky arrival. */
export type SkywriteStatus = 'animating' | 'landed' | 'settled';

export interface SkyArrivalHandoff {
  skywriteId: string;
  skyNodeId: string;
  justAddedToSky: true;
  skywriteStatus: SkywriteStatus;
  /** Approved star field at submit — keeps Focused Sky stable during overlay FX. */
  renderStarsSnapshot?: MySkyStarDisplay[];
}

export const EMPTY_SKY_ARRIVAL: SkyArrivalHandoff | null = null;

export function buildSkyNodeId(skywriteId: string): string {
  return `star-${skywriteId}`;
}
