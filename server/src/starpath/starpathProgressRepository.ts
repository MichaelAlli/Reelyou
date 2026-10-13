import { getUserRecord } from '../db/accountRepository.js';
import { loadAccountDatabase, persistAccountDatabase } from '../db/accountStore.js';
import {
  emptyStarpathProgressSnapshot,
  STARPATH_PROGRESS_SNAPSHOT_VERSION,
  type StarpathJourneySignalsPayload,
  type StarpathProgressSnapshot,
} from './starpathProgressTypes.js';

function normalizeSnapshot(raw: StarpathProgressSnapshot | null | undefined): StarpathProgressSnapshot {
  const base = emptyStarpathProgressSnapshot();
  if (!raw || raw.version !== STARPATH_PROGRESS_SNAPSHOT_VERSION) return base;
  return {
    version: STARPATH_PROGRESS_SNAPSHOT_VERSION,
    updatedAt: typeof raw.updatedAt === 'number' ? raw.updatedAt : base.updatedAt,
    resources: {
      savedResourceIds: Array.isArray(raw.resources?.savedResourceIds)
        ? [...new Set(raw.resources.savedResourceIds.filter((id) => typeof id === 'string'))]
        : [],
      dismissedResourceIds: Array.isArray(raw.resources?.dismissedResourceIds)
        ? [...new Set(raw.resources.dismissedResourceIds.filter((id) => typeof id === 'string'))]
        : [],
      snoozedResourceUntil:
        raw.resources?.snoozedResourceUntil && typeof raw.resources.snoozedResourceUntil === 'object'
          ? { ...raw.resources.snoozedResourceUntil }
          : {},
    },
    settledMilestoneIds: Array.isArray(raw.settledMilestoneIds)
      ? [...new Set(raw.settledMilestoneIds.filter((id) => typeof id === 'string'))]
      : [],
    emotional:
      raw.emotional && typeof raw.emotional.supportState === 'string'
        ? {
            supportState: raw.emotional.supportState,
            userReportedLabel:
              typeof raw.emotional.userReportedLabel === 'string'
                ? raw.emotional.userReportedLabel
                : null,
          }
        : null,
    journeySignals: normalizeJourneySignals(raw.journeySignals),
  };
}

function normalizeJourneySignals(
  raw: StarpathJourneySignalsPayload | null | undefined,
): StarpathJourneySignalsPayload | null {
  if (!raw || typeof raw.sourceHash !== 'string') return null;
  const list = (v: unknown) =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string').slice(0, 12) : [];
  return {
    sourceHash: raw.sourceHash,
    extractedAt: typeof raw.extractedAt === 'number' ? raw.extractedAt : 0,
    explicitGoals: list(raw.explicitGoals),
    explicitSkills: list(raw.explicitSkills),
    currentActivities: list(raw.currentActivities),
    statedChallenges: list(raw.statedChallenges),
    tentativeInterests: list(raw.tentativeInterests),
    resourceNeeds: list(raw.resourceNeeds),
  };
}

export function getStarpathProgressSnapshot(userId: string): StarpathProgressSnapshot | null {
  const row = getUserRecord(userId);
  if (!row) return null;
  return normalizeSnapshot(row.starpathProgressSnapshot ?? null);
}

export function mergeStarpathProgressSnapshot(
  userId: string,
  patch: Partial<{
    resources: Partial<StarpathProgressSnapshot['resources']>;
    settledMilestoneIds: string[];
    emotional: StarpathProgressSnapshot['emotional'];
    journeySignals: StarpathJourneySignalsPayload | null;
  }>,
): StarpathProgressSnapshot | null {
  const db = loadAccountDatabase();
  const row = db.users.find((u) => u.id === userId && u.deletedAt == null);
  if (!row) return null;

  const current = normalizeSnapshot(row.starpathProgressSnapshot ?? null);
  const now = Date.now();

  const mergedResources = patch.resources
    ? {
        savedResourceIds: patch.resources.savedResourceIds ?? current.resources.savedResourceIds,
        dismissedResourceIds:
          patch.resources.dismissedResourceIds ?? current.resources.dismissedResourceIds,
        snoozedResourceUntil: {
          ...current.resources.snoozedResourceUntil,
          ...(patch.resources.snoozedResourceUntil ?? {}),
        },
      }
    : current.resources;

  const merged: StarpathProgressSnapshot = {
    version: STARPATH_PROGRESS_SNAPSHOT_VERSION,
    updatedAt: now,
    resources: mergedResources,
    settledMilestoneIds: patch.settledMilestoneIds ?? current.settledMilestoneIds,
    emotional: patch.emotional !== undefined ? patch.emotional : current.emotional,
    journeySignals:
      patch.journeySignals !== undefined ? patch.journeySignals : current.journeySignals,
  };

  row.starpathProgressSnapshot = merged;
  row.profileUpdatedAt = now;
  persistAccountDatabase();
  return merged;
}

export function setJourneySignalsCache(
  userId: string,
  payload: StarpathJourneySignalsPayload,
): StarpathProgressSnapshot | null {
  return mergeStarpathProgressSnapshot(userId, { journeySignals: payload });
}
