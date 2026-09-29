import assert from 'node:assert/strict';

import {
  fingerprintForCandidate,
  rankingPenaltyForCandidate,
  type RankingFeedbackState,
} from '@/starpath/starpathRankingFeedback';

function testLessLikePenalty() {
  const now = Date.now();
  const fp = fingerprintForCandidate({
    opportunityType: 'grant',
    categories: ['funding'],
    provider: 'Test',
  });
  const state: RankingFeedbackState = {
    entries: [
      {
        id: '1',
        candidateId: 'c1',
        kind: 'less_like',
        fingerprint: fp,
        createdAt: now - 1000,
      },
    ],
  };
  const penalty = rankingPenaltyForCandidate('c1', fp, state, now);
  assert.ok(penalty > 0.5);
  const other = rankingPenaltyForCandidate('c2', fp, state, now);
  assert.ok(other > 0.2);
  console.log('rankingPenaltyForCandidate ok');
}

testLessLikePenalty();
