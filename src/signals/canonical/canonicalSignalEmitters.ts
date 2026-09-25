import type { CanonicalSignalStore } from '@/signals/canonical/canonicalSignalStore';

/** Thin emit helpers — evidence must be supplied by upstream canonical systems. */
export function emitRepeatedThemeSignal(
  store: CanonicalSignalStore,
  userId: string,
  theme: string,
  provenanceIds: string[],
) {
  return store.emit({
    userId,
    type: 'repeated_theme',
    sourceType: 'pattern',
    sourceId: `theme-${theme}`,
    dedupeKey: `repeated_theme:${theme}`,
    metadata: { theme },
    provenanceIds,
    surfaceEligibility: ['your_guide'],
  });
}

export function emitAreaEmergenceCandidate(
  store: CanonicalSignalStore,
  userId: string,
  skyAreaId: string,
  provenanceIds: string[],
) {
  return store.emit({
    userId,
    type: 'area_emergence_candidate',
    sourceType: 'pattern',
    sourceId: skyAreaId,
    dedupeKey: `area_emergence:${skyAreaId}`,
    relatedSkyAreaIds: [skyAreaId],
    provenanceIds,
    surfaceEligibility: ['your_guide'],
  });
}

export function emitLearningMoment(
  store: CanonicalSignalStore,
  userId: string,
  evidenceId: string,
) {
  return store.emit({
    userId,
    type: 'learning_moment',
    sourceType: 'learning_evidence',
    sourceId: evidenceId,
    dedupeKey: `learning:${evidenceId}`,
    provenanceIds: [evidenceId],
  });
}

export function emitApplicationMoment(
  store: CanonicalSignalStore,
  userId: string,
  evidenceId: string,
  skyAreaId?: string,
) {
  return store.emit({
    userId,
    type: 'application_moment',
    sourceType: 'application_evidence',
    sourceId: evidenceId,
    dedupeKey: `application:${evidenceId}`,
    relatedSkyAreaIds: skyAreaId ? [skyAreaId] : [],
    provenanceIds: [evidenceId],
  });
}

export function emitImpactConfirmation(
  store: CanonicalSignalStore,
  userId: string,
  impactEventId: string,
  impactedUserId: string,
) {
  return store.emit({
    userId,
    type: 'impact_confirmation',
    sourceType: 'impact_event',
    sourceId: impactEventId,
    dedupeKey: `impact_confirmation:${impactEventId}`,
    relatedUserIds: [impactedUserId],
    provenanceIds: [impactEventId],
    significanceLevel: 'strong',
  });
}

export function emitRepeatImpactDepth(
  store: CanonicalSignalStore,
  userId: string,
  impactedUserId: string,
  impactEventId: string,
) {
  return store.emit({
    userId,
    type: 'repeat_impact_depth',
    sourceType: 'impact_event',
    sourceId: impactEventId,
    dedupeKey: `repeat_impact_depth:${impactedUserId}`,
    relatedUserIds: [impactedUserId],
    provenanceIds: [impactEventId],
  });
}

export function emitRippleSignal(
  store: CanonicalSignalStore,
  userId: string,
  rippleEventId: string,
) {
  return store.emit({
    userId,
    type: 'ripple',
    sourceType: 'ripple_event',
    sourceId: rippleEventId,
    dedupeKey: `ripple:${rippleEventId}`,
    provenanceIds: [rippleEventId],
    significanceLevel: 'strong',
  });
}

export function emitConnectedSkiesSignal(
  store: CanonicalSignalStore,
  userId: string,
  otherUserId: string,
) {
  const pairKey = [userId, otherUserId].sort().join(':');
  return store.emit({
    userId,
    type: 'connected_skies',
    sourceType: 'relationship',
    sourceId: otherUserId,
    dedupeKey: `connected_skies:${pairKey}`,
    relatedUserIds: [otherUserId],
    privacyScope: 'owner_only',
  });
}

export function emitEmergingConstellationCandidate(
  store: CanonicalSignalStore,
  userId: string,
  candidateCommunityId: string,
  relatedAreaIds: string[],
  provenanceIds: string[],
) {
  return store.emit({
    userId,
    type: 'emerging_constellation_available',
    sourceType: 'community',
    sourceId: candidateCommunityId,
    dedupeKey: `emerging_constellation:${candidateCommunityId}`,
    relatedSkyAreaIds: relatedAreaIds,
    provenanceIds,
    metadata: { candidateCommunityId },
    surfaceEligibility: ['home'],
  });
}

export function emitEncouragementReceivedSignal(
  store: CanonicalSignalStore,
  userId: string,
  sourceId: string,
  fromUserId: string,
) {
  return store.emit({
    userId,
    type: 'encouragement_received',
    sourceType: 'relationship',
    sourceId,
    dedupeKey: `encouragement_received:${sourceId}`,
    relatedUserIds: [fromUserId],
    provenanceIds: [sourceId],
  });
}

export function emitEncouragementGivenSignal(
  store: CanonicalSignalStore,
  userId: string,
  sourceId: string,
  toUserId: string,
) {
  return store.emit({
    userId,
    type: 'encouragement_given',
    sourceType: 'relationship',
    sourceId,
    dedupeKey: `encouragement_given:${sourceId}`,
    relatedUserIds: [toUserId],
    provenanceIds: [sourceId],
  });
}

export function emitBelongingSignal(store: CanonicalSignalStore, userId: string, sourceId: string) {
  return store.emit({
    userId,
    type: 'belonging',
    sourceType: 'community',
    sourceId,
    dedupeKey: `belonging:${sourceId}`,
    provenanceIds: [sourceId],
    privacyScope: 'owner_only',
  });
}

export function emitCommunityReplySignal(
  store: CanonicalSignalStore,
  userId: string,
  communityId: string,
  postId: string,
  replyId: string,
  fromUserId: string,
) {
  return store.emit({
    userId,
    type: 'community_reply',
    sourceType: 'community',
    sourceId: replyId,
    dedupeKey: `community_reply:${replyId}`,
    relatedUserIds: [fromUserId],
    provenanceIds: [postId, replyId],
    metadata: { communityId, postId },
    significanceLevel: 'meaningful',
    surfaceEligibility: ['home'],
  });
}

export function emitCommunityBelongingSignal(
  store: CanonicalSignalStore,
  userId: string,
  communityId: string,
) {
  return store.emit({
    userId,
    type: 'community_belonging',
    sourceType: 'community',
    sourceId: communityId,
    dedupeKey: `community_belonging:${communityId}`,
    provenanceIds: [communityId],
    significanceLevel: 'meaningful',
    privacyScope: 'owner_only',
    surfaceEligibility: ['home'],
  });
}

export function emitGrowthMomentumSignal(
  store: CanonicalSignalStore,
  userId: string,
  skyAreaId: string,
  provenanceIds: string[],
  options?: { relatedStarPathNodeId?: string },
) {
  return store.emit({
    userId,
    type: 'growth_momentum',
    sourceType: 'pattern',
    sourceId: skyAreaId,
    dedupeKey: `growth_momentum:${skyAreaId}`,
    relatedSkyAreaIds: [skyAreaId],
    relatedStarPathIds: options?.relatedStarPathNodeId ? [options.relatedStarPathNodeId] : [],
    provenanceIds,
    significanceLevel: 'meaningful',
    metadata: options?.relatedStarPathNodeId
      ? { nodeId: options.relatedStarPathNodeId }
      : {},
    surfaceEligibility: ['starpath_internal'],
    privacyScope: 'owner_only',
  });
}

export function emitNorthStarReviewCandidate(
  store: CanonicalSignalStore,
  userId: string,
  sourceId: string,
) {
  return store.emit({
    userId,
    type: 'north_star_review_candidate',
    sourceType: 'north_star',
    sourceId,
    dedupeKey: `north_star_review:${sourceId}`,
    surfaceEligibility: ['your_guide'],
  });
}

export function emitSavedThreadReturnSignal(
  store: CanonicalSignalStore,
  userId: string,
  savedThreadId: string,
) {
  return store.emit({
    userId,
    type: 'saved_thread_return',
    sourceType: 'saved_thread',
    sourceId: savedThreadId,
    dedupeKey: `saved_thread_return:${savedThreadId}`,
    provenanceIds: [savedThreadId],
  });
}

export function emitReflectionReturnSignal(
  store: CanonicalSignalStore,
  userId: string,
  reflectionId: string,
) {
  return store.emit({
    userId,
    type: 'reflection_return',
    sourceType: 'reflection',
    sourceId: reflectionId,
    dedupeKey: `reflection_return:${reflectionId}`,
    privacyScope: 'owner_only',
    provenanceIds: [reflectionId],
  });
}

export function emitStarpathMetaphorSignal(
  store: CanonicalSignalStore,
  userId: string,
  kind: 'door_opening' | 'mist' | 'clear_skies' | 'reflection_rain' | 'aurora' | 'new_star_candidate',
  sourceId: string,
  metadata?: Record<string, string | number | boolean | string[]>,
) {
  return store.emit({
    userId,
    type: kind,
    sourceType: 'starpath',
    sourceId,
    dedupeKey: `${kind}:${sourceId}`,
    metadata: metadata ?? {},
    surfaceEligibility: ['starpath_internal'],
    privacyScope: 'owner_only',
  });
}

export function emitStarpathOpportunitySignal(
  store: CanonicalSignalStore,
  userId: string,
  opportunityId: string,
  nodeId: string,
) {
  return store.emit({
    userId,
    type: 'starpath_opportunity',
    sourceType: 'starpath',
    sourceId: opportunityId,
    dedupeKey: `starpath_opportunity:${opportunityId}`,
    relatedStarPathIds: [nodeId],
    metadata: { opportunityNodeId: nodeId },
    surfaceEligibility: ['starpath_internal'],
    privacyScope: 'owner_only',
  });
}
