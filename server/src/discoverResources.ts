import { cacheGet, cacheSet } from './cacheStore.js';
import { config } from './config.js';
import { fetchArxivCandidates } from './providers/arxivProvider.js';
import { fetchGrantsGovCandidates } from './providers/grantsGovProvider.js';
import { fetchRssCandidates } from './providers/rssProvider.js';
import type {
  DiscoverResourcesRequest,
  DiscoverResourcesResponse,
  ServerOpportunityCandidate,
} from './resourceTypes.js';

function dedupe(list: ServerOpportunityCandidate[]): ServerOpportunityCandidate[] {
  const map = new Map<string, ServerOpportunityCandidate>();
  for (const c of list) {
    const key = `${c.title.toLowerCase()}|${c.officialUrl ?? c.id}`;
    if (!map.has(key)) map.set(key, c);
  }
  return [...map.values()];
}

export async function discoverLiveResources(
  req: DiscoverResourcesRequest,
): Promise<DiscoverResourcesResponse> {
  const now = req.now ?? Date.now();
  const cacheKey = `discover:${(req.keywordHints ?? []).join(',')}:${req.todayFocusText ?? ''}`;
  const cached = cacheGet<ServerOpportunityCandidate[]>(cacheKey);
  if (cached && !cached.stale) {
    return {
      candidates: cached.value,
      providerStatus: 'cached',
      checkedAt: now,
      sourceNotes: ['served_from_cache'],
      errors: [],
    };
  }

  const errors: string[] = [];
  const batches: ServerOpportunityCandidate[] = [];

  if (config.resources.grantsGovEnabled) {
    const grants = await fetchGrantsGovCandidates(req, now);
    batches.push(...grants.candidates);
    errors.push(...grants.errors);
  }
  if (config.resources.arxivEnabled) {
    const arxiv = await fetchArxivCandidates(req, now);
    batches.push(...arxiv.candidates);
    errors.push(...arxiv.errors);
  }
  if (config.resources.rssUrls.length > 0) {
    const rss = await fetchRssCandidates(req, now);
    batches.push(...rss.candidates);
    errors.push(...rss.errors);
  }

  const merged = dedupe(batches).filter((c) => c.freshnessStatus !== 'expired');

  if (merged.length > 0) {
    cacheSet(cacheKey, merged, config.resources.cacheTtlMs);
    return {
      candidates: merged,
      providerStatus: 'live',
      checkedAt: now,
      sourceNotes: [
        config.resources.grantsGovEnabled ? 'grants_gov' : null,
        config.resources.arxivEnabled ? 'arxiv' : null,
        config.resources.rssUrls.length ? 'rss' : null,
      ].filter(Boolean) as string[],
      errors,
    };
  }

  if (cached?.value.length) {
    return {
      candidates: cached.value,
      providerStatus: 'degraded',
      checkedAt: now,
      sourceNotes: ['stale_cache_after_source_failure'],
      errors,
    };
  }

  return {
    candidates: [],
    providerStatus: errors.length ? 'degraded' : 'empty',
    checkedAt: now,
    sourceNotes: [],
    errors,
  };
}
