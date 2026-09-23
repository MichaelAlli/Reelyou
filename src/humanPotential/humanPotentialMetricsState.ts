import type { HumanPotentialEvidenceRecord } from '@/humanPotential/humanPotentialEvidenceTypes';
import type {
  ApplicationEvidenceRecord,
  ImpactEventRecord,
  RippleEventRecord,
  UniqueImpactRelationshipRecord,
} from '@/humanPotential/humanPotentialModels';

export interface HumanPotentialMetricsState {
  evidence: HumanPotentialEvidenceRecord[];
  applicationEvidence: ApplicationEvidenceRecord[];
  impactEvents: ImpactEventRecord[];
  uniqueImpactRelationships: UniqueImpactRelationshipRecord[];
  rippleEvents: RippleEventRecord[];
  updatedAt: number;
}

export const EMPTY_HUMAN_POTENTIAL_METRICS_STATE: HumanPotentialMetricsState = {
  evidence: [],
  applicationEvidence: [],
  impactEvents: [],
  uniqueImpactRelationships: [],
  rippleEvents: [],
  updatedAt: 0,
};
