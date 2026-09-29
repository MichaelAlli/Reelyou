import type { DiscoverResourcesRequest, ServerOpportunityCandidate } from '../resourceTypes.js';
import { verifyUrlReachable } from '../linkVerify.js';

function branchFromCategories(cats: string[]): string[] {
  const branches: string[] = [];
  if (cats.some((c) => /learn|education|study/i.test(c))) branches.push('learning');
  if (cats.some((c) => /community|social/i.test(c))) branches.push('community');
  if (!branches.length) branches.push('learning');
  return branches;
}

/** Public arXiv API — external learning papers, not grants or jobs. */
export async function fetchArxivCandidates(
  req: DiscoverResourcesRequest,
  now: number,
): Promise<{ candidates: ServerOpportunityCandidate[]; errors: string[] }> {
  const hints = [
    ...(req.keywordHints ?? []),
    ...(req.todayFocusText?.split(/\s+/).filter((w) => w.length > 3) ?? []),
  ]
    .slice(0, 4)
    .join(' ')
    .trim();
  const query = encodeURIComponent(hints || 'personal growth learning');
  const url = `https://export.arxiv.org/api/query?search_query=all:${query}&start=0&max_results=6`;

  const errors: string[] = [];
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'ReelyouStarpathBot/1.0' },
    });
    if (!res.ok) {
      errors.push(`arxiv_http_${res.status}`);
      return { candidates: [], errors };
    }
    const xml = await res.text();
    const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)];
    const candidates: ServerOpportunityCandidate[] = [];

    for (const [, block] of entries) {
      const title = block.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.replace(/\s+/g, ' ').trim();
      const summary = block.match(/<summary>([\s\S]*?)<\/summary>/)?.[1]?.replace(/\s+/g, ' ').trim();
      const id = block.match(/<id>([\s\S]*?)<\/id>/)?.[1]?.trim();
      const absUrl = block.match(/rel="alternate"[^>]*href="([^"]+)"/)?.[1] ?? id;
      if (!title || !absUrl) continue;

      const linkOk = await verifyUrlReachable(absUrl);
      if (!linkOk) continue;

      const arxivId = absUrl.split('/abs/')[1]?.replace(/v\d+$/, '') ?? absUrl;
      candidates.push({
        id: `live-arxiv-${arxivId.replace(/\W/g, '-')}`,
        title: title.slice(0, 180),
        opportunityType: 'course',
        provider: 'arXiv.org',
        sourceName: 'arXiv.org (live)',
        sourceUrl: 'https://arxiv.org',
        officialUrl: absUrl,
        description: (summary ?? 'Open-access research preprint on arXiv.org.').slice(0, 500),
        remoteAvailable: true,
        categories: ['learning', 'research'],
        relatedBranchIds: branchFromCategories(['learning']),
        relatedNodeIds: [],
        reasonCodes: [],
        freshnessStatus: 'fresh',
        verificationStatus: 'verified',
        retrievedAt: now,
        lastVerifiedAt: now,
        availabilityStatus: 'open',
        fixtureOnly: false,
        providerKey: 'education_api',
      });
    }
    return { candidates, errors };
  } catch {
    errors.push('arxiv_fetch_failed');
    return { candidates: [], errors };
  }
}
