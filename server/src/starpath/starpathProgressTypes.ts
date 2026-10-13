/** Server-side StarPath progress — cross-device; excludes viewport/UI chrome. */
export const STARPATH_PROGRESS_SNAPSHOT_VERSION = 1 as const;

export interface StarpathJourneySignalsPayload {
  sourceHash: string;
  extractedAt: number;
  explicitGoals: string[];
  explicitSkills: string[];
  currentActivities: string[];
  statedChallenges: string[];
  tentativeInterests: string[];
  resourceNeeds: string[];
}

export interface StarpathProgressSnapshot {
  version: typeof STARPATH_PROGRESS_SNAPSHOT_VERSION;
  updatedAt: number;
  resources: {
    savedResourceIds: string[];
    dismissedResourceIds: string[];
    snoozedResourceUntil: Record<string, number>;
  };
  /** Milestone node ids the user has reached on StarPath (visible or archived). */
  settledMilestoneIds: string[];
  emotional: {
    supportState: string;
    userReportedLabel?: string | null;
  } | null;
  journeySignals: StarpathJourneySignalsPayload | null;
}

export function emptyStarpathProgressSnapshot(now = Date.now()): StarpathProgressSnapshot {
  return {
    version: STARPATH_PROGRESS_SNAPSHOT_VERSION,
    updatedAt: now,
    resources: {
      savedResourceIds: [],
      dismissedResourceIds: [],
      snoozedResourceUntil: {},
    },
    settledMilestoneIds: [],
    emotional: null,
    journeySignals: null,
  };
}
