export const PREFERENCES_VERSION = 'beta-v1';

export type TriState = 'on' | 'off' | 'reduced';

export interface SignalCategoryPreferences {
  messages: boolean;
  connections: boolean;
  opportunities: boolean;
  communities: boolean;
  skyActivity: boolean;
  accountSystem: boolean;
  quietMode: boolean;
  showMessagePreview: boolean;
}

export type WhoCanMessage = 'connections_only' | 'message_requests' | 'nobody';

export interface MessagingPreferences {
  whoCanMessage: WhoCanMessage;
  muteMessageSignals: boolean;
  showUnreadIndicator: boolean;
}

export interface DiscoveryPreferences {
  includePublicSkiesInExplore: boolean;
  prioritizeConnections: boolean;
  prioritizeSharedCommunities: boolean;
  showOpportunityDiscovery: boolean;
  reduceDiscoverySuggestions: boolean;
}

export interface GuidePreferences {
  mode: TriState;
  opportunityNudges: boolean;
  reflectionPrompts: boolean;
  timeSensitiveGuidance: boolean;
}

export interface PersonalizationPreferences {
  useExplicitInterests: boolean;
  useSavedItems: boolean;
  useStarPathBranches: boolean;
  useTodaysFocus: boolean;
  useActivityPatterns: boolean;
}

export interface EmotionalContextPreference {
  adjustGuidanceIntensity: boolean;
}

export interface AccessibilityPreferences {
  preferReducedMotion: boolean;
}

export interface UserPreferencesState {
  preferencesVersion: typeof PREFERENCES_VERSION;
  signalPreferences: SignalCategoryPreferences;
  messagingPreferences: MessagingPreferences;
  discoveryPreferences: DiscoveryPreferences;
  guidePreferences: GuidePreferences;
  personalizationPreferences: PersonalizationPreferences;
  emotionalContextPreference: EmotionalContextPreference;
  accessibilityPreferences: AccessibilityPreferences;
  updatedAt: number;
}

/** Partial nested updates for settings UI — avoids requiring full preference objects. */
export type UserPreferencesUpdate = {
  signalPreferences?: Partial<SignalCategoryPreferences>;
  messagingPreferences?: Partial<MessagingPreferences>;
  discoveryPreferences?: Partial<DiscoveryPreferences>;
  guidePreferences?: Partial<GuidePreferences>;
  personalizationPreferences?: Partial<PersonalizationPreferences>;
  emotionalContextPreference?: Partial<EmotionalContextPreference>;
  accessibilityPreferences?: Partial<AccessibilityPreferences>;
};

export const DEFAULT_USER_PREFERENCES: UserPreferencesState = {
  preferencesVersion: PREFERENCES_VERSION,
  signalPreferences: {
    messages: true,
    connections: true,
    opportunities: true,
    communities: true,
    skyActivity: true,
    accountSystem: true,
    quietMode: false,
    showMessagePreview: true,
  },
  messagingPreferences: {
    whoCanMessage: 'connections_only',
    muteMessageSignals: false,
    showUnreadIndicator: true,
  },
  discoveryPreferences: {
    includePublicSkiesInExplore: true,
    prioritizeConnections: true,
    prioritizeSharedCommunities: true,
    showOpportunityDiscovery: true,
    reduceDiscoverySuggestions: false,
  },
  guidePreferences: {
    mode: 'on',
    opportunityNudges: true,
    reflectionPrompts: true,
    timeSensitiveGuidance: true,
  },
  personalizationPreferences: {
    useExplicitInterests: true,
    useSavedItems: true,
    useStarPathBranches: true,
    useTodaysFocus: true,
    useActivityPatterns: true,
  },
  emotionalContextPreference: {
    adjustGuidanceIntensity: true,
  },
  accessibilityPreferences: {
    preferReducedMotion: false,
  },
  updatedAt: 0,
};
