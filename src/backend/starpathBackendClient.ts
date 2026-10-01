import { authenticatedReellyouFetch } from '@/backend/authenticatedReellyouFetch';
import { isReellyouBackendConfigured, resolveReellyouApiBaseUrl } from '@/backend/reellyouApiConfig';
import type { OpportunityCandidate } from '@/starpath/starpathOpportunityTypes';

const DEFAULT_TIMEOUT_MS = 9_000;

async function postJson<T>(path: string, body: unknown): Promise<T | null> {
  const base = resolveReellyouApiBaseUrl();
  if (!base) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  try {
    const res = await fetch(`${base}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export interface BackendDiscoverResponse {
  candidates: OpportunityCandidate[];
  providerStatus: 'live' | 'cached' | 'degraded' | 'empty';
  checkedAt: number;
  sourceNotes: string[];
  errors: string[];
}

export async function fetchLiveResourceCandidates(input: {
  keywordHints?: string[];
  branchIds?: string[];
  todayFocusText?: string | null;
}): Promise<BackendDiscoverResponse | null> {
  if (!isReellyouBackendConfigured()) return null;
  return postJson<BackendDiscoverResponse>('/v1/starpath/resources/discover', input);
}

export interface ExplainResponse {
  ok: boolean;
  explanation: string | null;
  errorCode?: string;
}

export async function fetchStarpathExplanation(input: {
  kind: 'opportunity' | 'guide';
  facts: Record<string, unknown>;
  reasonCodes: string[];
  focusSnippet?: string | null;
}): Promise<ExplainResponse | null> {
  if (!isReellyouBackendConfigured()) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  try {
    const res = await authenticatedReellyouFetch('/v1/starpath/explain', {
      method: 'POST',
      body: JSON.stringify(input),
      signal: controller.signal,
    });
    if (!res?.ok) return null;
    return (await res.json()) as ExplainResponse;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
