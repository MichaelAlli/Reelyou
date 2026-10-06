import { silverLiningsEnabled } from '@/constants/betaFeatures';
import type { JourneyThreadRecord } from '@/journeyThreads/journeyThreadTypes';
import type { SkywriteRecord } from '@/skywrite/types';

type StarpathActivityListener = () => void;
const starpathActivityListeners = new Set<StarpathActivityListener>();

/** StarPath orchestrator listens — recomputes when persisted Skywrite activity changes. */
export function registerStarpathActivityListener(listener: StarpathActivityListener): () => void {
  starpathActivityListeners.add(listener);
  return () => {
    starpathActivityListeners.delete(listener);
  };
}

function notifyStarpathActivityChanged(): void {
  for (const listener of starpathActivityListeners) {
    try {
      listener();
    } catch {
      // Non-blocking.
    }
  }
}

/** Disabled while BetaFeatures.silverLinings is false — no background AI or clustering. */
export function onSkywriteCreated(_skywrite: SkywriteRecord): void {
  notifyStarpathActivityChanged();
  if (!silverLiningsEnabled()) return;
}

export function suggestRelatedThreads(_skywrite: SkywriteRecord): JourneyThreadRecord[] {
  if (!silverLiningsEnabled()) return [];
  return [];
}

export function suggestThreadTitle(_skywrites: SkywriteRecord[]): string | null {
  if (!silverLiningsEnabled()) return null;
  return null;
}

export function summarizeJourneyThread(_thread: JourneyThreadRecord): string | null {
  if (!silverLiningsEnabled()) return null;
  return null;
}
