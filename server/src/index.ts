import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { config, openAiConfigured } from './config.js';
import { discoverLiveResources } from './discoverResources.js';
import { explainWithOpenAi, type VerifiedFactsPayload } from './openaiClient.js';
import { checkRateLimit } from './rateLimit.js';

function corsHeaders(origin: string | undefined): Record<string, string> {
  const allowed =
    origin && config.corsOrigins.includes(origin) ? origin : config.corsOrigins[0] ?? '*';
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

async function readJson<T>(req: IncomingMessage): Promise<T> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  const raw = Buffer.concat(chunks).toString('utf8');
  return JSON.parse(raw) as T;
}

function sendJson(res: ServerResponse, status: number, body: unknown, origin?: string): void {
  res.writeHead(status, { 'Content-Type': 'application/json', ...corsHeaders(origin) });
  res.end(JSON.stringify(body));
}

function clientIp(req: IncomingMessage): string {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string') return fwd.split(',')[0]?.trim() ?? 'unknown';
  return req.socket.remoteAddress ?? 'unknown';
}

const server = createServer(async (req, res) => {
  const origin = req.headers.origin;
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders(origin));
    res.end();
    return;
  }

  const ip = clientIp(req);
  if (!checkRateLimit(ip, 120, 60_000)) {
    sendJson(res, 429, { error: 'rate_limited' }, origin);
    return;
  }

  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);

  if (req.method === 'GET' && url.pathname === '/health') {
    sendJson(
      res,
      200,
      {
        ok: true,
        openAiConfigured: openAiConfigured(),
        grantsGov: config.resources.grantsGovEnabled,
        arxiv: config.resources.arxivEnabled,
        rssFeeds: config.resources.rssUrls.length,
      },
      origin,
    );
    return;
  }

  if (req.method === 'POST' && url.pathname === '/v1/starpath/explain') {
    try {
      const body = await readJson<VerifiedFactsPayload>(req);
      const result = await explainWithOpenAi(body);
      sendJson(res, result.ok ? 200 : 503, result, origin);
    } catch {
      sendJson(res, 400, { ok: false, errorCode: 'bad_request' }, origin);
    }
    return;
  }

  if (req.method === 'POST' && url.pathname === '/v1/starpath/resources/discover') {
    try {
      const body = await readJson<{
        keywordHints?: string[];
        branchIds?: string[];
        todayFocusText?: string | null;
      }>(req);
      const result = await discoverLiveResources({
        keywordHints: body.keywordHints,
        branchIds: body.branchIds,
        todayFocusText: body.todayFocusText,
      });
      sendJson(res, 200, result, origin);
    } catch {
      sendJson(res, 400, { error: 'bad_request' }, origin);
    }
    return;
  }

  sendJson(res, 404, { error: 'not_found' }, origin);
});

server.listen(config.port, () => {
  console.log(`[reellyou-server] listening on :${config.port} openAi=${openAiConfigured()}`);
});
