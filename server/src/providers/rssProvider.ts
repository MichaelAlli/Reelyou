import { config } from '../config.js';
import type { DiscoverResourcesRequest, ServerOpportunityCandidate } from '../resourceTypes.js';
import { verifyUrlReachable } from '../linkVerify.js';

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function parseRssItems(xml: string): { title: string; link: string; description: string; pubDate?: string }[] {
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)];
  return items
    .map(([, block]) => {
      const title = stripTags(block.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? '');
      const link =
        block.match(/<link>([\s\S]*?)<\/link>/i)?.[1]?.trim() ??
        block.match(/<guid[^>]*>([\s\S]*?)<\/guid>/i)?.[1]?.trim() ??
        '';
      const description = stripTags(
        block.match(/<description>([\s\S]*?)<\/description>/i)?.[1] ??
          block.match(/<content:encoded>([\s\S]*?)<\/content:encoded>/i)?.[1] ??
          '',
      );
      const pubDate = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/i)?.[1]?.trim();
      return { title, link, description, pubDate };
    })
    .filter((i) => i.title && i.link.startsWith('http'));
}

export async function fetchRssCandidates(
  _req: DiscoverResourcesRequest,
  now: number,
): Promise<{ candidates: ServerOpportunityCandidate[]; errors: string[] }> {
  const errors: string[] = [];
  const candidates: ServerOpportunityCandidate[] = [];
  for (const feedUrl of config.resources.rssUrls) {
    try {
      const res = await fetch(feedUrl, {
        headers: { 'User-Agent': 'ReelyouStarpathBot/1.0' },
      });
      if (!res.ok) {
        errors.push(`rss_http_${feedUrl}_${res.status}`);
        continue;
      }
      const xml = await res.text();
      const items = parseRssItems(xml).slice(0, 5);
      for (const item of items) {
        const linkOk = await verifyUrlReachable(item.link);
        if (!linkOk) continue;
        const id = `live-rss-${Buffer.from(item.link).toString('base64url').slice(0, 24)}`;
        candidates.push({
          id,
          title: item.title.slice(0, 180),
          opportunityType: 'event',
          provider: new URL(feedUrl).hostname,
          sourceName: `RSS (${new URL(feedUrl).hostname})`,
          sourceUrl: feedUrl,
          officialUrl: item.link,
          description: (item.description || 'Listed in a public RSS feed.').slice(0, 500),
          categories: ['community'],
          relatedBranchIds: ['community'],
          relatedNodeIds: [],
          reasonCodes: [],
          freshnessStatus: 'fresh',
          verificationStatus: 'verified',
          retrievedAt: now,
          lastVerifiedAt: now,
          availabilityStatus: 'open',
          fixtureOnly: false,
          providerKey: 'events_api',
        });
      }
    } catch {
      errors.push(`rss_fetch_failed_${feedUrl}`);
    }
  }
  return { candidates, errors };
}
