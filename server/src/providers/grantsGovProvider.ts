import type { DiscoverResourcesRequest, ServerOpportunityCandidate } from '../resourceTypes.js';
import { verifyUrlReachable } from '../linkVerify.js';

interface GrantsGovOpp {
  id?: number;
  number?: string;
  title?: string;
  agency?: string;
  openDate?: string;
  closeDate?: string;
  synopsis?: string;
  cfdaList?: string[];
}

/** Grants.gov REST search — public federal opportunities when endpoint accepts request. */
export async function fetchGrantsGovCandidates(
  req: DiscoverResourcesRequest,
  now: number,
): Promise<{ candidates: ServerOpportunityCandidate[]; errors: string[] }> {
  const keyword =
    req.keywordHints?.[0] ??
    req.todayFocusText?.split(/\s+/).find((w) => w.length > 4) ??
    'community';
  const errors: string[] = [];
  const body = {
    keyword: String(keyword).slice(0, 80),
    rows: 8,
    startRecordNum: 0,
    sortBy: 'openDate|desc',
  };

  try {
    const res = await fetch('https://apply07.grants.gov/grantsws/rest/opportunities/search/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      errors.push(`grants_gov_http_${res.status}`);
      return { candidates: [], errors };
    }
    const json = (await res.json()) as { oppHits?: GrantsGovOpp[]; opportunities?: GrantsGovOpp[] };
    const hits = json.oppHits ?? json.opportunities ?? [];
    const candidates: ServerOpportunityCandidate[] = [];

    for (const hit of hits) {
      const oppNum = hit.number ?? String(hit.id ?? '');
      if (!hit.title || !oppNum) continue;
      const officialUrl = `https://www.grants.gov/search-results-detail/${oppNum}`;
      const linkOk = await verifyUrlReachable(officialUrl);
      if (!linkOk) continue;

      let deadline: number | undefined;
      if (hit.closeDate) {
        const parsed = Date.parse(hit.closeDate);
        if (!Number.isNaN(parsed)) deadline = parsed;
      }

      candidates.push({
        id: `live-grants-gov-${oppNum.replace(/\W/g, '-')}`,
        title: hit.title.slice(0, 180),
        opportunityType: 'grant',
        provider: hit.agency ?? 'Grants.gov',
        sourceName: 'Grants.gov (live)',
        sourceUrl: 'https://www.grants.gov',
        officialUrl,
        description: (hit.synopsis ?? 'Federal grant opportunity listed on Grants.gov.').slice(0, 500),
        deadline,
        categories: ['funding', 'grant'],
        relatedBranchIds: ['growth', 'community'],
        relatedNodeIds: [],
        reasonCodes: [],
        freshnessStatus: deadline && deadline - now < 7 * 86400000 ? 'approaching' : 'fresh',
        verificationStatus: 'verified',
        retrievedAt: now,
        lastVerifiedAt: now,
        availabilityStatus: 'open',
        fixtureOnly: false,
        providerKey: 'grants_api',
      });
    }
    return { candidates, errors };
  } catch {
    errors.push('grants_gov_fetch_failed');
    return { candidates: [], errors };
  }
}
