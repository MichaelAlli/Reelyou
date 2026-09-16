import type { CommunityId } from '@/onboarding/personalization/communities/types';

/** Meaningful human moment categories — no engagement scoring. */
export type AroundYourSkyActivityType = 'connection' | 'community' | 'growth' | 'social';

/** Existing in-app destinations only — no fake routes. */
export type AroundYourSkyDestination = 'skywrite' | 'community' | 'public-sky';

/** Backend-ready activity record — explicit ids only, no inferred traits. */
export interface AroundYourSkyActivityRecord {
  id: string;
  type: AroundYourSkyActivityType;
  actorId: string | null;
  communityId: CommunityId | null;
  contentId: string | null;
  timestamp: string;
  relevanceSource: string | null;
}

/** Home feed slice — derived selection, replaceable by backend later. */
export interface AroundYourSkyState {
  items: AroundYourSkyActivityRecord[];
}

/** Display-ready item for Home UI — built from records + fixture metadata. */
export interface AroundYourSkyDisplayItem extends AroundYourSkyActivityRecord {
  actorName: string;
  actorInitials: string;
  actorColor: string;
  message: string;
  preview: string | null;
  relativeTime: string;
  destination: AroundYourSkyDestination | null;
  destinationParam: string | null;
}

export interface AroundYourSkyHomeFeed {
  items: AroundYourSkyDisplayItem[];
  isQuiet: boolean;
}

export const EMPTY_AROUND_YOUR_SKY: AroundYourSkyState = {
  items: [],
};
