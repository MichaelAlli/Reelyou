import type { HumanPotentialMetricsState } from '@/humanPotential/humanPotentialMetricsState';
import { deriveImpactEventCount } from '@/humanPotential/humanPotentialMetricsEngine';

export interface RippleConnectionDetail {
  userId: string;
  displayName: string;
  isDirectImpact: boolean;
  isDownstreamRipple: boolean;
  impactEvents: Array<{
    impactEventId: string;
    context?: string;
    createdAt: number;
    skyAreaId?: string;
  }>;
  ripples: Array<{
    rippleEventId: string;
    createdAt: number;
    downstreamUserId: string;
  }>;
}

export function buildRippleConnectionDetail(input: {
  ownerUserId: string;
  personUserId: string;
  metrics: HumanPotentialMetricsState;
  userDirectory: Readonly<Record<string, string>>;
}): RippleConnectionDetail | null {
  const displayName = input.userDirectory[input.personUserId];
  if (!displayName) return null;

  const impactEvents = input.metrics.impactEvents
    .filter(
      (event) =>
        event.contributorUserId === input.ownerUserId &&
        event.impactedUserId === input.personUserId &&
        event.userConfirmed,
    )
    .sort((a, b) => a.createdAt - b.createdAt)
    .map((event) => ({
      impactEventId: event.impactEventId,
      context: event.context,
      createdAt: event.createdAt,
      skyAreaId: event.skyAreaId,
    }));

  const ripples = input.metrics.rippleEvents
    .filter(
      (event) =>
        event.originatingContributorUserId === input.ownerUserId &&
        (event.directImpactedUserId === input.personUserId ||
          event.downstreamUserId === input.personUserId) &&
        event.userConfirmed,
    )
    .map((event) => ({
      rippleEventId: event.rippleEventId,
      createdAt: event.createdAt,
      downstreamUserId: event.downstreamUserId,
    }));

  const isDirectImpact = deriveImpactEventCount(
    input.ownerUserId,
    input.personUserId,
    input.metrics,
  ) > 0;

  const isDownstreamRipple = ripples.some((entry) => entry.downstreamUserId === input.personUserId);

  if (!isDirectImpact && !isDownstreamRipple) return null;

  return {
    userId: input.personUserId,
    displayName,
    isDirectImpact,
    isDownstreamRipple,
    impactEvents,
    ripples,
  };
}
