import type { SkywriteShowingUpId } from '@/constants/skywriteCopy';
import type { SkywriteMedia, SkywriteMediaMode, SkywriteRecord } from '@/skywrite/types';
import type { Privacy } from '@/types';

import {
  STAR_GROWTH_MEANINGFUL,
  STAR_MEDIA_AUDIO,
  STAR_MEDIA_IMAGE,
  STAR_MEDIA_MIXED,
  STAR_MEDIA_TEXT,
  STAR_MEDIA_VIDEO,
} from '@/starSemantic/starSemanticTokens';
import type {
  StarPrimaryMediaType,
  StarSemantic,
  StarSemanticFrontendPayload,
  StarSemanticSourceType,
} from '@/starSemantic/starSemanticTypes';

export interface StarSemanticDerivationInput {
  sourceId: string;
  sourceType: StarSemanticSourceType;
  text: string;
  media: SkywriteMedia;
  mediaMode: SkywriteMediaMode;
  visibility: Privacy;
  showingUp?: SkywriteShowingUpId | null;
  createdAt: string;
  /** Explicit user confirmation — wins over inference. */
  userMarkedMeaningfulGrowth?: boolean;
  /** Canonical legacy / growth qualification from elsewhere. */
  legacyQualifiedGrowth?: boolean;
  /** Optional future video attachment (does not duplicate media records). */
  hasVideoAttachment?: boolean;
}

export function resolveMediaFlags(input: {
  text: string;
  media: SkywriteMedia;
  hasVideoAttachment?: boolean;
}): Pick<StarSemantic, 'hasImage' | 'hasVideo' | 'hasAudio' | 'hasText'> {
  const hasImage = Boolean(input.media.photo);
  const hasVideo = Boolean(input.hasVideoAttachment);
  const hasAudio = Boolean(input.media.audio);
  const hasText = input.text.trim().length > 0;
  return { hasImage, hasVideo, hasAudio, hasText };
}

/** VIDEO > AUDIO > IMAGE > TEXT */
export function resolvePrimaryMediaType(flags: {
  hasVideo: boolean;
  hasAudio: boolean;
  hasImage: boolean;
  hasText: boolean;
}): StarPrimaryMediaType {
  const count =
    Number(flags.hasVideo) +
    Number(flags.hasAudio) +
    Number(flags.hasImage) +
    Number(flags.hasText);
  if (count > 1) {
    if (flags.hasVideo) return 'video';
    if (flags.hasAudio) return 'audio';
    if (flags.hasImage) return 'image';
    return 'text';
  }
  if (flags.hasVideo) return 'video';
  if (flags.hasAudio) return 'audio';
  if (flags.hasImage) return 'image';
  return 'text';
}

export function resolveMeaningfulGrowthMoment(input: {
  userMarkedMeaningfulGrowth?: boolean;
  legacyQualifiedGrowth?: boolean;
  showingUp?: SkywriteShowingUpId | null;
}): boolean {
  if (input.userMarkedMeaningfulGrowth === true) return true;
  if (input.legacyQualifiedGrowth === true) return true;
  if (input.showingUp === 'breakthrough') return true;
  return false;
}

export function mediaTokenForPrimary(type: StarPrimaryMediaType): string {
  switch (type) {
    case 'video':
      return STAR_MEDIA_VIDEO;
    case 'audio':
      return STAR_MEDIA_AUDIO;
    case 'image':
      return STAR_MEDIA_IMAGE;
    case 'mixed':
      return STAR_MEDIA_MIXED;
    default:
      return STAR_MEDIA_TEXT;
  }
}

export function deriveStarSemantic(
  input: StarSemanticDerivationInput,
  updatedAt: string = new Date().toISOString(),
): StarSemantic {
  const flags = resolveMediaFlags(input);
  const primaryMediaType = resolvePrimaryMediaType(flags);
  return {
    sourceId: input.sourceId,
    sourceType: input.sourceType,
    primaryMediaType,
    ...flags,
    isMeaningfulGrowthMoment: resolveMeaningfulGrowthMoment(input),
    visibilityScope: input.visibility,
    createdAt: input.createdAt,
    updatedAt,
  };
}

export function deriveStarSemanticFromSkywrite(
  record: SkywriteRecord,
  options?: {
    userMarkedMeaningfulGrowth?: boolean;
    legacyQualifiedGrowth?: boolean;
    hasVideoAttachment?: boolean;
  },
): StarSemantic {
  return deriveStarSemantic({
    sourceId: record.id,
    sourceType: 'skywrite',
    text: record.text,
    media: record.media,
    mediaMode: record.mediaMode,
    visibility: record.visibility,
    showingUp: record.showingUp,
    createdAt: record.createdAt,
    userMarkedMeaningfulGrowth: options?.userMarkedMeaningfulGrowth,
    legacyQualifiedGrowth: options?.legacyQualifiedGrowth,
    hasVideoAttachment: options?.hasVideoAttachment,
  });
}

export function buildStarSemanticFrontendPayload(
  semantic: StarSemantic,
): StarSemanticFrontendPayload {
  return {
    starSemantic: {
      mediaType: semantic.primaryMediaType,
      mediaToken: mediaTokenForPrimary(semantic.primaryMediaType),
      meaningfulGrowth: semantic.isMeaningfulGrowthMoment,
      growthToken: semantic.isMeaningfulGrowthMoment ? STAR_GROWTH_MEANINGFUL : null,
    },
  };
}
