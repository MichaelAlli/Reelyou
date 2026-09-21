export const RESOURCE_OVERLOAD_GUARDRAILS = {
  maxPrimaryResources: 1,
  maxComparisonResources: 3,
  maxEmergingResourcesPerSession: 2,
} as const;

export const OPPORTUNITY_ESCALATION = {
  undiscoveredMentionAfterMs: 45 * 60 * 1000,
  maxGuideMentionsPerOpportunity: 2,
  mentionCooldownMs: 24 * 60 * 60 * 1000,
  approachingDeadlineMs: 14 * 24 * 60 * 60 * 1000,
  soonDeadlineMs: 7 * 24 * 60 * 60 * 1000,
  expiringDeadlineMs: 48 * 60 * 60 * 1000,
} as const;

export const SIGNAL_GUARDRAILS = {
  maxActiveSignals: 2,
  signalCooldownMs: 20_000,
  overloadedMaxActiveSignals: 1,
} as const;
