/** Canonical durable signal families — presentation is separate from history. */
export type CanonicalSignalType =
  | 'growth_momentum'
  | 'repeated_theme'
  | 'area_emergence_candidate'
  | 'learning_moment'
  | 'application_moment'
  | 'impact_confirmation'
  | 'repeat_impact_depth'
  | 'ripple'
  | 'encouragement_received'
  | 'encouragement_given'
  | 'belonging'
  | 'connection_strengthening'
  | 'connected_skies'
  | 'meaningful_reconnection'
  | 'direction_clarity'
  | 'north_star_review_candidate'
  | 'starpath_opportunity'
  | 'door_opening'
  | 'mist'
  | 'clear_skies'
  | 'reflection_rain'
  | 'aurora'
  | 'new_star_candidate'
  | 'emerging_constellation_available'
  | 'community_support_request'
  | 'community_reply'
  | 'community_belonging'
  | 'contribution_opportunity'
  | 'saved_thread_return'
  | 'reflection_return'
  | 'growth_contrast'
  | 'contribution_application'
  | 'application_impact';

export type CanonicalSignalSourceType =
  | 'skywrite'
  | 'impact_event'
  | 'application_evidence'
  | 'learning_evidence'
  | 'ripple_event'
  | 'contribution'
  | 'starpath'
  | 'north_star'
  | 'community'
  | 'saved_thread'
  | 'reflection'
  | 'relationship'
  | 'pattern'
  | 'system';

export type CanonicalSignalSignificance = 'subtle' | 'meaningful' | 'strong';

export type CanonicalSignalPrivacyScope = 'owner_only' | 'connected_skies' | 'public_safe';

export type SignalPresentationStatus =
  | 'active'
  | 'opened'
  | 'dismissed'
  | 'handled'
  | 'expired';

export type SignalSurfaceEligibility =
  | 'home'
  | 'your_guide'
  | 'starpath_internal'
  | 'legacy_context'
  | 'none';
