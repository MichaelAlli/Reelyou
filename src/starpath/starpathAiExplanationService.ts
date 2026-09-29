import { fetchStarpathExplanation } from '@/backend/starpathBackendClient';
import type { OpportunityCandidate } from '@/starpath/starpathOpportunityTypes';
import { whyThisLinesForReasons } from '@/starpath/starpathGuidanceCopy';
import type { StarPathGuideReasonCode } from '@/starpath/starpathGuidanceTypes';

const explainCache = new Map<string, { text: string; at: number }>();
const CACHE_TTL_MS = 20 * 60 * 1000;

function cacheKey(id: string, reasonCodes: string[]): string {
  return `${id}:${reasonCodes.join(',')}`;
}

/** Deterministic fallback — always available when AI is down. */
export function deterministicOpportunityWhyHere(
  reasonCodes: OpportunityCandidate['reasonCodes'],
): string {
  if (reasonCodes.length === 0) {
    return 'It may connect with paths you have been exploring.';
  }
  return whyThisLinesForReasons(reasonCodes as StarPathGuideReasonCode[]).join(' ');
}

export async function resolveOpportunityWhyHere(
  candidate: OpportunityCandidate,
  focusSnippet: string | null,
): Promise<string> {
  const key = cacheKey(candidate.id, candidate.reasonCodes);
  const hit = explainCache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.text;

  const fallback = deterministicOpportunityWhyHere(candidate.reasonCodes);
  const response = await fetchStarpathExplanation({
    kind: 'opportunity',
    facts: {
      title: candidate.title,
      opportunityType: candidate.opportunityType,
      provider: candidate.provider,
      sourceName: candidate.sourceName,
      officialUrl: candidate.officialUrl ?? candidate.sourceUrl ?? null,
      eligibilitySummary: candidate.eligibilitySummary ?? null,
      deadline: candidate.deadline ?? candidate.registrationDeadline ?? null,
      location: candidate.location ?? null,
      remoteAvailable: candidate.remoteAvailable ?? null,
      fixtureOnly: candidate.fixtureOnly,
      lastVerifiedAt: candidate.lastVerifiedAt ?? candidate.retrievedAt,
    },
    reasonCodes: candidate.reasonCodes,
    focusSnippet,
  });

  const text =
    response?.ok && response.explanation?.trim()
      ? response.explanation.trim()
      : fallback;
  explainCache.set(key, { text, at: Date.now() });
  return text;
}
