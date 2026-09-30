export type FriendDiscoverySource =
  | 'phone_contacts'
  | 'google_contacts'
  | 'facebook'
  | 'mutual_connections'
  | 'invitation';

export interface FriendDiscoveryMatch {
  userId: string;
  reason: FriendDiscoverySource;
  reasonLabel: string;
  mutualCount?: number;
}

export interface ContactMatchResult {
  status: 'ok' | 'empty' | 'error' | 'rate_limited' | 'backend_unconfigured';
  matches: FriendDiscoveryMatch[];
  message?: string;
}

export interface PeopleYouMayKnowSuggestion {
  userId: string;
  reasonLabel: string;
  source: FriendDiscoverySource;
  mutualCount?: number;
}

export interface FriendDiscoveryState {
  version: 1;
  discoverableByVerifiedPhone: boolean;
  discoverableByVerifiedEmail: boolean;
  phoneContactsLastSyncAt: number | null;
  googleContactsConnected: boolean;
  facebookConnected: boolean;
  contactMatchUserIds: string[];
  googleMatchUserIds: string[];
  facebookMatchUserIds: string[];
  dismissedSuggestionUserIds: string[];
  findYourPeopleOnboardingSeen: boolean;
  updatedAt: number;
}

export const EMPTY_FRIEND_DISCOVERY_STATE: FriendDiscoveryState = {
  version: 1,
  discoverableByVerifiedPhone: false,
  discoverableByVerifiedEmail: false,
  phoneContactsLastSyncAt: null,
  googleContactsConnected: false,
  facebookConnected: false,
  contactMatchUserIds: [],
  googleMatchUserIds: [],
  facebookMatchUserIds: [],
  dismissedSuggestionUserIds: [],
  findYourPeopleOnboardingSeen: false,
  updatedAt: 0,
};
