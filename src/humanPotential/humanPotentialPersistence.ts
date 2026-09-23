import AsyncStorage from '@react-native-async-storage/async-storage';

import type { HumanPotentialEvidenceRecord } from '@/humanPotential/humanPotentialEvidenceTypes';
import type {
  ApplicationEvidenceRecord,
  ImpactEventRecord,
  RippleEventRecord,
  UniqueImpactRelationshipRecord,
} from '@/humanPotential/humanPotentialModels';
import {
  EMPTY_HUMAN_POTENTIAL_METRICS_STATE,
  type HumanPotentialMetricsState,
} from '@/humanPotential/humanPotentialMetricsState';
import { dedupeUniqueImpactRelationships } from '@/humanPotential/humanPotentialMetricsEngine';

const KEY = '@reellyou/human-potential-metrics';

export function parseHumanPotentialMetricsState(raw: string | null): HumanPotentialMetricsState {
  if (!raw) return EMPTY_HUMAN_POTENTIAL_METRICS_STATE;
  try {
    const parsed = JSON.parse(raw) as Partial<HumanPotentialMetricsState>;
    const evidence = Array.isArray(parsed.evidence)
      ? (parsed.evidence as HumanPotentialEvidenceRecord[])
      : [];
    const applicationEvidence = Array.isArray(parsed.applicationEvidence)
      ? (parsed.applicationEvidence as ApplicationEvidenceRecord[])
      : [];
    const impactEvents = Array.isArray(parsed.impactEvents)
      ? (parsed.impactEvents as ImpactEventRecord[])
      : [];
    const uniqueImpactRelationships = Array.isArray(parsed.uniqueImpactRelationships)
      ? (parsed.uniqueImpactRelationships as UniqueImpactRelationshipRecord[])
      : [];
    const rippleEvents = Array.isArray(parsed.rippleEvents)
      ? (parsed.rippleEvents as RippleEventRecord[])
      : [];
    return dedupeUniqueImpactRelationships({
      evidence,
      applicationEvidence,
      impactEvents,
      uniqueImpactRelationships,
      rippleEvents,
      updatedAt: typeof parsed.updatedAt === 'number' ? parsed.updatedAt : Date.now(),
    });
  } catch {
    return EMPTY_HUMAN_POTENTIAL_METRICS_STATE;
  }
}

export async function loadHumanPotentialMetricsState(): Promise<HumanPotentialMetricsState> {
  const raw = await AsyncStorage.getItem(KEY);
  return parseHumanPotentialMetricsState(raw);
}

export async function saveHumanPotentialMetricsState(state: HumanPotentialMetricsState): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(state));
}
