import { loadAccountDatabase } from '../db/accountStore.js';
import { extractJourneySignalsWithOpenAi } from './journeySignalsExtract.js';
import { hashEligibleSkywritesForSignals } from './journeySignalsHash.js';
import {
  getStarpathProgressSnapshot,
  mergeStarpathProgressSnapshot,
} from './starpathProgressRepository.js';
import { listSkywritesForStarpathAi } from './starpathSkywriteEligibility.js';
import type { StarpathJourneySignalsPayload } from './starpathProgressTypes.js';

export function handleGetStarpathProgress(userId: string) {
  const snapshot = getStarpathProgressSnapshot(userId);
  if (!snapshot) return { ok: false as const, error: 'not_found' as const };
  return { ok: true as const, snapshot };
}

export function handlePutStarpathProgress(
  userId: string,
  body: {
    resources?: {
      savedResourceIds?: string[];
      dismissedResourceIds?: string[];
      snoozedResourceUntil?: Record<string, number>;
    };
    settledMilestoneIds?: string[];
    emotional?: { supportState: string; userReportedLabel?: string | null } | null;
  },
) {
  const snapshot = mergeStarpathProgressSnapshot(userId, {
    resources: body.resources,
    settledMilestoneIds: body.settledMilestoneIds,
    emotional: body.emotional,
  });
  if (!snapshot) return { ok: false as const, error: 'not_found' as const };
  return { ok: true as const, snapshot };
}

export async function handleGetJourneySignals(userId: string) {
  const db = loadAccountDatabase();
  const eligible = listSkywritesForStarpathAi(db.skywrites ?? [], userId);
  const sourceHash = hashEligibleSkywritesForSignals(eligible);
  const progress = getStarpathProgressSnapshot(userId);
  if (!progress) return { ok: false as const, error: 'not_found' as const };

  const cached = progress.journeySignals;
  if (cached && cached.sourceHash === sourceHash) {
    return {
      ok: true as const,
      source: 'cache' as const,
      sourceHash,
      signals: cached,
      extractError: null,
    };
  }

  const extract = await extractJourneySignalsWithOpenAi(eligible);
  if (!extract.ok || !extract.signals) {
    return {
      ok: true as const,
      source: 'unavailable' as const,
      sourceHash,
      signals: cached,
      extractError: extract.errorCode ?? 'upstream_error',
    };
  }

  const payload: StarpathJourneySignalsPayload = {
    sourceHash,
    extractedAt: Date.now(),
    ...extract.signals,
  };
  mergeStarpathProgressSnapshot(userId, { journeySignals: payload });

  return {
    ok: true as const,
    source: 'extracted' as const,
    sourceHash,
    signals: payload,
    extractError: null,
  };
}
