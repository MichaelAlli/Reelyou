export function legacyMomentIdForImpact(impactEventId: string): string {
  return `lm-impact-${impactEventId}`;
}

export function legacyMomentIdForApplication(applicationEvidenceId: string): string {
  return `lm-app-${applicationEvidenceId}`;
}

export function legacyMomentIdForLearning(evidenceId: string): string {
  return `lm-learn-${evidenceId}`;
}

export function legacyMomentIdForRipple(rippleEventId: string): string {
  return `lm-ripple-${rippleEventId}`;
}

export function legacyMomentIdForContribution(contributionId: string): string {
  return `lm-contrib-${contributionId}`;
}

export function reelSequenceIdFor(ownerUserId: string, generatedAt: number): string {
  return `reel-${ownerUserId}-${generatedAt}`;
}
