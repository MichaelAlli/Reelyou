export type SignalLevel = 'silent' | 'whisper' | 'notice' | 'guide' | 'priority';
export type SignalVocabulary =
  | 'node_glow'
  | 'branch_shimmer'
  | 'waypoint_pulse'
  | 'directional_light'
  | 'star_spark'
  | 'path_ripple'
  | 'halo';

export type SignalReasonCode =
  | 'time_sensitive'
  | 'explicit_interest'
  | 'undiscovered_opportunity'
  | 'focus_alignment'
  | 'new_emergence'
  | 'offscreen_cue';

export interface StarPathAmbientSignal {
  id: string;
  signalType: SignalVocabulary;
  signalLevel: SignalLevel;
  sourceOpportunityId?: string;
  sourceNodeId: string;
  sourceBranchId: string;
  reasonCodes: SignalReasonCode[];
  createdAt: number;
  lastShownAt: number;
  acknowledgedAt?: number;
  dismissedAt?: number;
  expiresAt?: number;
  guideEscalationEligible: boolean;
  offscreenDirection?: 'above' | 'below';
}

export interface StarPathSignalState {
  signalVersion: string;
  signalsById: Record<string, StarPathAmbientSignal>;
  activeSignalIds: string[];
  lastSignalUpdateAt: number;
}

export const EMPTY_SIGNAL_STATE: StarPathSignalState = {
  signalVersion: 'beta-v1',
  signalsById: {},
  activeSignalIds: [],
  lastSignalUpdateAt: 0,
};
