import type {
  ContributionStewardshipState,
  StewardshipPrivateRecognitionPayload,
  StewardshipPrivateSignalType,
} from '@/contributionStewardship/stewardshipTypes';

function areaLabel(skyAreaId: string): string {
  return skyAreaId
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function resolveStewardshipRecognitionType(
  state: ContributionStewardshipState,
): StewardshipPrivateSignalType | null {
  if (state.routingTrustBand === 'established') {
    return 'CONTRIBUTION_STEWARDSHIP_ESTABLISHED';
  }
  if (state.routingTrustBand === 'developing') {
    return 'CONTRIBUTION_STEWARDSHIP_EMERGING';
  }
  if (state.routingEligibility && state.evidenceSummary.appliedCount > 0) {
    return 'CONTRIBUTION_STEWARDSHIP_OPPORTUNITY';
  }
  return null;
}

export function buildPrivateStewardshipRecognition(
  state: ContributionStewardshipState,
  provenanceIds: string[],
): StewardshipPrivateRecognitionPayload | null {
  const recognitionType = resolveStewardshipRecognitionType(state);
  if (!recognitionType) return null;

  const label = areaLabel(state.skyAreaId);
  let message = `Your perspective has been especially helpful in ${label}.`;
  if (state.evidenceSummary.appliedCount > 0) {
    message = `People have been putting some of what you shared into practice in ${label}.`;
  }
  if (recognitionType === 'CONTRIBUTION_STEWARDSHIP_ESTABLISHED') {
    message = `Your perspective is becoming trusted in ${label}.`;
  }

  const contributionAvailabilityPrompt =
    recognitionType === 'CONTRIBUTION_STEWARDSHIP_ESTABLISHED'
      ? 'Would you like to keep receiving opportunities to help in this area?'
      : undefined;

  return {
    skyAreaId: state.skyAreaId,
    recognitionType,
    message,
    contributionAvailabilityPrompt,
    provenanceIds,
  };
}

export function buildMoreInvitationsGuideCopy(state: ContributionStewardshipState): string | null {
  if (state.routingTrustBand === 'new') return null;
  const label = areaLabel(state.skyAreaId);
  return `Your perspective has been especially useful in ${label}, so REELYOU may bring you more opportunities to contribute here.`;
}
