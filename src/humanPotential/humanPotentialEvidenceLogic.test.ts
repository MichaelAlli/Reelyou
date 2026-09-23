import {
  addConfirmedEvidence,
  canAutoConfirmEvidence,
  suggestEvidenceOffer,
} from '@/humanPotential/humanPotentialEvidenceLogic';
import type { ThreadReflectionRecord } from '@/skywrite/savedThreads/savedThreadTypes';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const baseReflection = (body: string, extra?: Partial<ThreadReflectionRecord>): ThreadReflectionRecord => ({
  reflectionId: 'refl-test-1',
  savedThreadId: 'st-user-michael-sw-1',
  authorUserId: 'user-michael',
  body,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  deletedAt: null,
  visibility: 'private',
  momentKind: 'freeform',
  ...extra,
});

function testApplicationOffer() {
  const offer = suggestEvidenceOffer(
    baseReflection('I used this before my interview.', { momentKind: 'used_this' }),
  );
  assert(offer?.evidenceType === 'application', 'application offer');
}

function testImpactNotAuto() {
  assert(!canAutoConfirmEvidence('impact'), 'impact never auto-confirms');
}

function testLearningEvidenceDeduped() {
  const reflection = baseReflection('This stayed with me.', {
    momentKind: 'stayed_with_me',
    microChoice: 'yes',
  });
  const first = addConfirmedEvidence({
    records: [],
    userId: 'user-michael',
    evidenceType: 'learning',
    reflection,
    savedThreadId: reflection.savedThreadId,
  });
  const second = addConfirmedEvidence({
    records: first,
    userId: 'user-michael',
    evidenceType: 'learning',
    reflection,
    savedThreadId: reflection.savedThreadId,
  });
  assert(first.length === 1 && second.length === 1, 'duplicate learning evidence blocked');
}

testApplicationOffer();
testImpactNotAuto();
testLearningEvidenceDeduped();
console.log('humanPotentialEvidenceLogic.test.ts — OK');
