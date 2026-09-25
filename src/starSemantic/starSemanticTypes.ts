import type { Privacy } from '@/types';

export type StarSemanticSourceType = 'skywrite' | 'legacy_moment';

export type StarPrimaryMediaType = 'image' | 'video' | 'audio' | 'text' | 'mixed';

export interface StarSemantic {
  sourceId: string;
  sourceType: StarSemanticSourceType;
  primaryMediaType: StarPrimaryMediaType;
  hasImage: boolean;
  hasVideo: boolean;
  hasAudio: boolean;
  hasText: boolean;
  isMeaningfulGrowthMoment: boolean;
  visibilityScope: Privacy;
  createdAt: string;
  updatedAt: string;
}

export interface StarSemanticFrontendPayload {
  starSemantic: {
    mediaType: StarPrimaryMediaType;
    mediaToken: string;
    meaningfulGrowth: boolean;
    growthToken: string | null;
  };
}
