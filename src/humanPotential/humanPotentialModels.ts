import type { SkyAreaCategoryId } from '@/skyAreas/skyAreaCategory';

/** Recipient confirmed they applied something from canonical provenance. */
export interface ApplicationEvidenceRecord {
  applicationEvidenceId: string;
  userId: string;
  sourceSkywriteId: string;
  sourceThreadId?: string;
  sourceResponseId?: string;
  contributionId?: string;
  reflectionId?: string;
  savedThreadId?: string;
  userConfirmed: boolean;
  context?: string;
  createdAt: number;
  visibility: 'private';
}

/** Recipient confirmed meaningful benefit — contributor cannot self-declare. */
export interface ImpactEventRecord {
  impactEventId: string;
  contributorUserId: string;
  impactedUserId: string;
  sourceContributionId?: string;
  sourceApplicationEvidenceId?: string;
  sourceReflectionId?: string;
  sourceSkywriteId?: string;
  sourceThreadId?: string;
  sourceResponseId?: string;
  skyAreaId?: SkyAreaCategoryId | string;
  userConfirmed: boolean;
  context?: string;
  visibility: 'private';
  createdAt: number;
  updatedAt: number;
}

/** At most one unique life credit per contributor ↔ impacted pair. */
export interface UniqueImpactRelationshipRecord {
  impactRelationshipId: string;
  contributorUserId: string;
  impactedUserId: string;
  firstImpactEventId: string;
  firstConfirmedAt: number;
  latestImpactEventId: string;
  latestConfirmedAt: number;
  impactEventCount: number;
  active: boolean;
  createdAt: number;
  updatedAt: number;
}

/** Downstream effect — does not count as direct Life Impacted for originating contributor. */
export interface RippleEventRecord {
  rippleEventId: string;
  originatingContributorUserId: string;
  directImpactedUserId: string;
  downstreamUserId: string;
  parentImpactEventId: string;
  parentContributionId?: string;
  downstreamContributionId?: string;
  downstreamImpactEventId?: string;
  rippleDepth: number;
  userConfirmed: boolean;
  createdAt: number;
  visibility: 'private';
}

export interface LegacyProvenanceRef {
  contributorUserId?: string;
  impactedUserId?: string;
  sourceSkywriteId?: string;
  sourceThreadId?: string;
  sourceResponseId?: string;
  contributionId?: string;
  applicationEvidenceId?: string;
  impactEventId?: string;
  reflectionId?: string;
  savedThreadId?: string;
  rippleEventId?: string;
  timestamp: number;
  skyAreaId?: string;
  visibility: 'private';
}

export function uniqueImpactRelationshipId(
  contributorUserId: string,
  impactedUserId: string,
): string {
  return `uir-${contributorUserId}-${impactedUserId}`;
}

export function impactEventIdFor(
  contributorUserId: string,
  impactedUserId: string,
  sourceReflectionId: string,
): string {
  return `impact-${contributorUserId}-${impactedUserId}-${sourceReflectionId}`;
}

export function applicationEvidenceIdFor(reflectionId: string): string {
  return `app-${reflectionId}`;
}
