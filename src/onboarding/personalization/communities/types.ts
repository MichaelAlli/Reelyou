/** Stable community identifiers — explicit user choices reference these ids. */
export type CommunityId =
  | 'entrepreneurship'
  | 'personal-growth'
  | 'creativity'
  | 'purpose-seekers'
  | 'career-growth'
  | 'wellness'
  | 'leadership'
  | 'travel-culture';

/** A community the user has explicitly joined — user action is authoritative. */
export interface JoinedCommunity {
  id: CommunityId;
  name: string;
  joinedAt: string;
}

/** Local-first community membership slice — backend-handoff ready. */
export interface CommunitiesRecord {
  joined: JoinedCommunity[];
  /** Community ids the user has explicitly indicated interest in (join adds, leave removes). */
  explicitInterests: CommunityId[];
}

export const EMPTY_COMMUNITIES: CommunitiesRecord = {
  joined: [],
  explicitInterests: [],
};

export function isCommunityId(value: string): value is CommunityId {
  return (
    value === 'entrepreneurship' ||
    value === 'personal-growth' ||
    value === 'creativity' ||
    value === 'purpose-seekers' ||
    value === 'career-growth' ||
    value === 'wellness' ||
    value === 'leadership' ||
    value === 'travel-culture'
  );
}
