import type {
  HumanPotentialEvidenceRecord,
  HumanPotentialEvidenceType,
} from '@/humanPotential/humanPotentialEvidenceTypes';
import { evidenceIdFor } from '@/humanPotential/humanPotentialEvidenceTypes';
import type { ThreadReflectionRecord } from '@/skywrite/savedThreads/savedThreadTypes';

export interface EvidenceOffer {
  evidenceType: HumanPotentialEvidenceType;
  title: string;
  body: string;
}

const APPLICATION_PATTERN =
  /\b(used|use|applied|apply|tried|did what|changed what i did|before my interview)\b/i;
const IMPACT_PATTERN =
  /\b(got the role|changed the outcome|helped me (get|make|through)|meaningfully helped|improved something)\b/i;
const LESS_ALONE_PATTERN = /\b(less alone|not alone|needed to hear|someone else went through)\b/i;
const HOPE_PATTERN = /\b(gave me hope|move forward|see a path|can move forward)\b/i;

export function suggestEvidenceOffer(
  reflection: ThreadReflectionRecord,
): EvidenceOffer | null {
  const text = reflection.body.trim();
  if (!text) return null;

  if (reflection.momentKind === 'used_this' || APPLICATION_PATTERN.test(text)) {
    return {
      evidenceType: 'application',
      title: 'Applied something here?',
      body: 'Sounds like you applied something from this conversation. Add it to your growth record?',
    };
  }

  if (IMPACT_PATTERN.test(text)) {
    return {
      evidenceType: 'impact',
      title: 'Did this help you move forward?',
      body: 'If this made a meaningful difference for you, you can add it to your growth record.',
    };
  }

  if (
    reflection.momentKind === 'stayed_with_me' ||
    reflection.microChoice === 'yes' ||
    reflection.microChoice === 'a_little'
  ) {
    return {
      evidenceType: 'learning',
      title: 'Something stayed with you',
      body: 'Add this as a learning moment in your growth record?',
    };
  }

  if (reflection.emotionalTags?.includes('less_alone') || LESS_ALONE_PATTERN.test(text)) {
    return {
      evidenceType: 'learning',
      title: 'You weren’t alone in this',
      body: 'Keep this connection moment in your private growth record?',
    };
  }

  if (reflection.emotionalTags?.includes('hope') || HOPE_PATTERN.test(text)) {
    return {
      evidenceType: 'learning',
      title: 'A step forward',
      body: 'Save this hopeful moment privately in your growth record?',
    };
  }

  return null;
}

/** Never auto-create Hero evidence — user confirmation is always required. */
export function canAutoConfirmEvidence(_type: HumanPotentialEvidenceType): boolean {
  return false;
}

export function addConfirmedEvidence(input: {
  records: HumanPotentialEvidenceRecord[];
  userId: string;
  evidenceType: HumanPotentialEvidenceType;
  reflection: ThreadReflectionRecord;
  savedThreadId: string;
  sourceSkywriteId?: string;
  sourceResponseId?: string;
  contributionId?: string;
  now?: number;
}): HumanPotentialEvidenceRecord[] {
  const now = input.now ?? Date.now();
  const evidenceId = evidenceIdFor(input.reflection.reflectionId, input.evidenceType);
  if (input.records.some((entry) => entry.evidenceId === evidenceId)) {
    return input.records;
  }
  const record: HumanPotentialEvidenceRecord = {
    evidenceId,
    userId: input.userId,
    evidenceType: input.evidenceType,
    sourceType: 'reflection',
    sourceId: input.reflection.reflectionId,
    savedThreadId: input.savedThreadId,
    reflectionId: input.reflection.reflectionId,
    sourceSkywriteId: input.sourceSkywriteId,
    sourceResponseId: input.sourceResponseId ?? input.reflection.sourceResponseId,
    contributionId: input.contributionId ?? input.reflection.sourceContributionId,
    createdAt: now,
    userConfirmed: true,
    visibility: 'private',
  };
  return [...input.records, record];
}
