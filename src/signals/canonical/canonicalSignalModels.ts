import type {
  CanonicalSignalPrivacyScope,
  CanonicalSignalSignificance,
  CanonicalSignalSourceType,
  CanonicalSignalType,
  SignalPresentationStatus,
  SignalSurfaceEligibility,
} from '@/signals/canonical/canonicalSignalTypes';

export interface CanonicalSignalEvent {
  id: string;
  userId: string;
  type: CanonicalSignalType;
  sourceType: CanonicalSignalSourceType;
  sourceId: string;
  relatedUserIds: string[];
  relatedSkyAreaIds: string[];
  relatedStarPathIds: string[];
  createdAt: number;
  significanceLevel: CanonicalSignalSignificance;
  privacyScope: CanonicalSignalPrivacyScope;
  provenanceIds: string[];
  handledAt?: number;
  expiresFromActivePresentationAt?: number;
  metadata: Record<string, string | number | boolean | string[]>;
  dedupeKey: string;
}

export interface CanonicalSignalPresentation {
  signalEventId: string;
  userId: string;
  surfaceEligibility: SignalSurfaceEligibility[];
  status: SignalPresentationStatus;
  firstShownAt?: number;
  handledAt?: number;
}

export interface CanonicalSignalPreferenceContext {
  quietMode?: boolean;
  mutedCategories?: Partial<Record<CanonicalSignalType, boolean>>;
  communitySignalsMuted?: boolean;
  aiPatternSuggestionsEnabled?: boolean;
}
