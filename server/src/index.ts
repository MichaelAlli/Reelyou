import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';

import { authenticateRequest } from './auth/authenticateRequest.js';
import { processScheduledAccountDeletions } from './auth/accountDeletion.js';
import { submitModerationReport } from './moderation/moderationReportStore.js';
import {
  handleCancelAccountDeletion,
  handleLogin,
  handleRegister,
  handleRequestAccountDeletion,
  handleSession,
} from './auth/authHandlers.js';
import {
  assertProductionSecrets,
  authConfigured,
  config,
  friendMatchConfigured,
  openAiConfigured,
  mediaStorageConfigured,
} from './config.js';
import { markImportedDiscoveryData } from './db/accountRepository.js';
import { initAccountDatabase } from './db/accountStore.js';
import { discoverLiveResources } from './discoverResources.js';
import {
  handleDeleteImportedDiscoveryData,
  handleGetDiscoverySettings,
  handlePatchDiscoverySettings,
} from './friendMatch/discoveryHandlers.js';
import {
  handleMatchContacts,
  type MatchContactsBody,
} from './friendMatch/matchContactsService.js';
import { explainWithOpenAi, type VerifiedFactsPayload } from './openaiClient.js';
import { checkRateLimit } from './rateLimit.js';
import { readBodyWithLimit } from './http/readBody.js';
import {
  handleCompleteUploadSession,
  handleCreateUploadSession,
  handleMediaAccess,
} from './media/mediaHandlers.js';
import { MEDIA_MAX_BYTES } from './media/mediaLimits.js';
import {
  getMediaAsset,
  getMediaAssetByStorageKey,
  resolveSkywriteVisibilityForAsset,
} from './media/mediaRepository.js';
import { readLocalObject, writeLocalObject } from './media/mediaStorage.js';
import {
  handleAddComment,
  handleBlock,
  handleCreateSkywrite,
  handleDeleteSkywrite,
  handleFollow,
  handleGetSkywrite,
  handleGetSocialState,
  handleListComments,
  handleListRecoverableSkywrites,
  handleListSkywrites,
  handleRecoverSkywrite,
  handleAddToYourJourney,
  handleRepostSkyreel,
  handleUnblock,
  handleUnfollow,
} from './social/socialHandlers.js';
import { processScheduledSkywritePurges } from './social/socialRepository.js';
import { canViewerAccessMediaAsset } from './social/contentVisibility.js';

assertProductionSecrets();

function corsHeaders(origin: string | undefined): Record<string, string> {
  const allowed =
    origin && config.corsOrigins.includes(origin) ? origin : config.corsOrigins[0] ?? '*';
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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

function sendNoContent(res: ServerResponse, origin?: string): void {
  res.writeHead(204, corsHeaders(origin));
  res.end();
}

function clientIp(req: IncomingMessage): string {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string') return fwd.split(',')[0]?.trim() ?? 'unknown';
  return req.socket.remoteAddress ?? 'unknown';
}

function requireAuth(
  req: IncomingMessage,
  res: ServerResponse,
  origin: string | undefined,
): { userId: string } | null {
  const session = authenticateRequest(req);
  if (!session) {
    sendJson(res, 401, { error: 'unauthorized' }, origin);
    return null;
  }
  return session;
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
        authConfigured: authConfigured(),
        friendMatchConfigured: friendMatchConfigured(),
        mediaStorageConfigured: mediaStorageConfigured(),
        grantsGov: config.resources.grantsGovEnabled,
        arxiv: config.resources.arxivEnabled,
        rssFeeds: config.resources.rssUrls.length,
      },
      origin,
    );
    return;
  }

  if (req.method === 'POST' && url.pathname === '/v1/auth/register') {
    if (!authConfigured()) {
      sendJson(res, 503, { error: 'auth_not_configured' }, origin);
      return;
    }
    try {
      const body = await readJson<{
        email?: string;
        password?: string;
        fullName?: string;
        phone?: string | null;
        termsAccepted?: boolean;
        termsVersion?: string;
        privacyVersion?: string;
        consentAcceptedAt?: number;
      }>(req);
      const result = handleRegister(body);
      sendJson(res, result.ok ? 201 : 400, result, origin);
    } catch {
      sendJson(res, 400, { error: 'bad_request' }, origin);
    }
    return;
  }

  if (req.method === 'POST' && url.pathname === '/v1/auth/login') {
    if (!authConfigured()) {
      sendJson(res, 503, { error: 'auth_not_configured' }, origin);
      return;
    }
    try {
      const body = await readJson<{ email?: string; password?: string }>(req);
      const result = handleLogin(body);
      sendJson(res, result.ok ? 200 : 401, result, origin);
    } catch {
      sendJson(res, 400, { error: 'bad_request' }, origin);
    }
    return;
  }

  if (req.method === 'GET' && url.pathname === '/v1/auth/session') {
    const session = requireAuth(req, res, origin);
    if (!session) return;
    const result = handleSession(session.userId);
    sendJson(res, result.ok ? 200 : 404, result, origin);
    return;
  }

  if (req.method === 'POST' && url.pathname === '/v1/auth/account/deletion-request') {
    const session = requireAuth(req, res, origin);
    if (!session) return;
    try {
      const body = await readJson<{ confirm?: boolean }>(req);
      if (!body.confirm) {
        sendJson(res, 400, { ok: false, error: 'confirmation_required' }, origin);
        return;
      }
      const result = handleRequestAccountDeletion(session.userId);
      void processScheduledAccountDeletions();
      sendJson(res, result.ok ? 200 : 404, result, origin);
    } catch {
      sendJson(res, 400, { error: 'bad_request' }, origin);
    }
    return;
  }

  if (req.method === 'POST' && url.pathname === '/v1/auth/account/deletion-cancel') {
    const session = requireAuth(req, res, origin);
    if (!session) return;
    const result = handleCancelAccountDeletion(session.userId);
    sendJson(res, result.ok ? 200 : 400, result, origin);
    return;
  }

  if (req.method === 'POST' && url.pathname === '/v1/friends/match-contacts') {
    const session = requireAuth(req, res, origin);
    if (!session) return;
    if (!friendMatchConfigured()) {
      sendJson(res, 503, { error: 'friend_match_not_configured' }, origin);
      return;
    }
    if (!checkRateLimit(`${ip}:friend-match:${session.userId}`, 30, 60_000)) {
      sendJson(res, 429, { error: 'rate_limited' }, origin);
      return;
    }
    try {
      const body = await readJson<MatchContactsBody>(req);
      const result = handleMatchContacts(session.userId, body);
      if (result.matches.length > 0) {
        markImportedDiscoveryData(session.userId);
      }
      sendJson(res, 200, result, origin);
    } catch {
      sendJson(res, 400, { error: 'bad_request' }, origin);
    }
    return;
  }

  if (url.pathname === '/v1/friends/discovery-settings') {
    const session = requireAuth(req, res, origin);
    if (!session) return;
    if (req.method === 'GET') {
      sendJson(res, 200, handleGetDiscoverySettings(session.userId), origin);
      return;
    }
    if (req.method === 'PATCH') {
      try {
        const body = await readJson<{ discoverableByPhone?: boolean; discoverableByEmail?: boolean }>(
          req,
        );
        sendJson(res, 200, handlePatchDiscoverySettings(session.userId, body), origin);
      } catch {
        sendJson(res, 400, { error: 'bad_request' }, origin);
      }
      return;
    }
  }

  if (req.method === 'DELETE' && url.pathname === '/v1/friends/imported-discovery-data') {
    const session = requireAuth(req, res, origin);
    if (!session) return;
    handleDeleteImportedDiscoveryData(session.userId);
    sendNoContent(res, origin);
    return;
  }

  if (req.method === 'GET' && url.pathname === '/v1/social/state') {
    const session = requireAuth(req, res, origin);
    if (!session) return;
    sendJson(res, 200, handleGetSocialState(session.userId), origin);
    return;
  }

  if (req.method === 'POST' && url.pathname === '/v1/social/follow') {
    const session = requireAuth(req, res, origin);
    if (!session) return;
    try {
      const body = await readJson<{ userId?: string }>(req);
      const target = body.userId?.trim();
      if (!target) {
        sendJson(res, 400, { error: 'bad_request' }, origin);
        return;
      }
      sendJson(res, 200, handleFollow(session.userId, target), origin);
    } catch {
      sendJson(res, 400, { error: 'bad_request' }, origin);
    }
    return;
  }

  if (req.method === 'DELETE' && url.pathname.startsWith('/v1/social/follow/')) {
    const session = requireAuth(req, res, origin);
    if (!session) return;
    const target = decodeURIComponent(url.pathname.replace('/v1/social/follow/', ''));
    sendJson(res, 200, handleUnfollow(session.userId, target), origin);
    return;
  }

  if (req.method === 'POST' && url.pathname === '/v1/social/blocks') {
    const session = requireAuth(req, res, origin);
    if (!session) return;
    try {
      const body = await readJson<{ userId?: string }>(req);
      const target = body.userId?.trim();
      if (!target) {
        sendJson(res, 400, { error: 'bad_request' }, origin);
        return;
      }
      sendJson(res, 200, handleBlock(session.userId, target), origin);
    } catch {
      sendJson(res, 400, { error: 'bad_request' }, origin);
    }
    return;
  }

  if (req.method === 'DELETE' && url.pathname.startsWith('/v1/social/blocks/')) {
    const session = requireAuth(req, res, origin);
    if (!session) return;
    const target = decodeURIComponent(url.pathname.replace('/v1/social/blocks/', ''));
    sendJson(res, 200, handleUnblock(session.userId, target), origin);
    return;
  }

  if (req.method === 'POST' && url.pathname === '/v1/media/upload-sessions') {
    const session = requireAuth(req, res, origin);
    if (!session) return;
    try {
      const body = await readJson<{
        kind?: string;
        contentType?: string;
        sizeBytes?: number;
      }>(req);
      sendJson(res, 200, await handleCreateUploadSession(session.userId, body), origin);
    } catch {
      sendJson(res, 400, { error: 'bad_request' }, origin);
    }
    return;
  }

  if (
    req.method === 'POST' &&
    url.pathname.startsWith('/v1/media/upload-sessions/') &&
    url.pathname.endsWith('/complete')
  ) {
    const session = requireAuth(req, res, origin);
    if (!session) return;
    const parts = url.pathname.split('/');
    const assetId = decodeURIComponent(parts[4] ?? '');
    sendJson(res, 200, await handleCompleteUploadSession(session.userId, assetId), origin);
    return;
  }

  if (req.method === 'PUT' && url.pathname.startsWith('/v1/media/upload/')) {
    const session = requireAuth(req, res, origin);
    if (!session) return;
    if (config.media.storage !== 'local') {
      sendJson(res, 404, { error: 'not_found' }, origin);
      return;
    }
    const storageKey = decodeURIComponent(url.pathname.replace('/v1/media/upload/', ''));
    const asset = getMediaAssetByStorageKey(storageKey);
    if (!asset || asset.ownerUserId !== session.userId || asset.status === 'deleted') {
      sendJson(res, 404, { error: 'not_found' }, origin);
      return;
    }
    try {
      const body = await readBodyWithLimit(req, MEDIA_MAX_BYTES[asset.kind]);
      await writeLocalObject(storageKey, body);
      sendNoContent(res, origin);
    } catch (err) {
      if (err instanceof Error && err.message === 'body_too_large') {
        sendJson(res, 413, { error: 'too_large' }, origin);
      } else {
        sendJson(res, 400, { error: 'bad_request' }, origin);
      }
    }
    return;
  }

  if (req.method === 'GET' && url.pathname.startsWith('/v1/media/assets/') && url.pathname.endsWith('/access')) {
    const session = requireAuth(req, res, origin);
    if (!session) return;
    const assetId = url.pathname.split('/')[4] ?? '';
    sendJson(res, 200, await handleMediaAccess(session.userId, assetId), origin);
    return;
  }

  if (req.method === 'GET' && url.pathname.startsWith('/v1/media/raw/')) {
    const session = requireAuth(req, res, origin);
    if (!session) return;
    const storageKey = decodeURIComponent(url.pathname.replace('/v1/media/raw/', ''));
    const asset = getMediaAssetByStorageKey(storageKey);
    if (!asset || asset.status !== 'ready' || asset.deletedAt) {
      sendJson(res, 404, { error: 'not_found' }, origin);
      return;
    }
    const visibility = resolveSkywriteVisibilityForAsset(asset, session.userId);
    const allowed = canViewerAccessMediaAsset({
      viewerId: session.userId,
      ownerUserId: asset.ownerUserId,
      skywriteId: asset.skywriteId,
      skywriteVisibility: visibility,
    });
    if (!allowed) {
      sendJson(res, 403, { error: 'forbidden' }, origin);
      return;
    }
    const bytes = readLocalObject(storageKey);
    if (!bytes) {
      sendJson(res, 404, { error: 'not_found' }, origin);
      return;
    }
    res.writeHead(200, {
      'Content-Type': asset.contentType,
      'Cache-Control': 'private, max-age=60',
      ...corsHeaders(origin),
    });
    res.end(bytes);
    return;
  }

  if (req.method === 'POST' && url.pathname === '/v1/content/skywrites') {
    const session = requireAuth(req, res, origin);
    if (!session) return;
    try {
      const body = await readJson<import('./social/skywriteTypes.js').CreateSkywriteInput>(req);
      sendJson(res, 200, handleCreateSkywrite(session.userId, body), origin);
    } catch {
      sendJson(res, 400, { error: 'bad_request' }, origin);
    }
    return;
  }

  if (req.method === 'GET' && url.pathname === '/v1/content/skywrites') {
    const session = requireAuth(req, res, origin);
    if (!session) return;
    const authorUserId = url.searchParams.get('authorUserId')?.trim();
    if (!authorUserId) {
      sendJson(res, 400, { error: 'bad_request' }, origin);
      return;
    }
    sendJson(res, 200, handleListSkywrites(authorUserId, session.userId), origin);
    return;
  }

  if (req.method === 'GET' && url.pathname.match(/^\/v1\/content\/skywrites\/[^/]+$/)) {
    const session = requireAuth(req, res, origin);
    if (!session) return;
    const skywriteId = url.pathname.split('/')[4] ?? '';
    sendJson(res, 200, handleGetSkywrite(session.userId, skywriteId), origin);
    return;
  }

  if (req.method === 'DELETE' && url.pathname.match(/^\/v1\/content\/skywrites\/[^/]+$/)) {
    const session = requireAuth(req, res, origin);
    if (!session) return;
    const skywriteId = url.pathname.split('/')[4] ?? '';
    sendJson(res, 200, await handleDeleteSkywrite(session.userId, skywriteId), origin);
    return;
  }

  if (req.method === 'GET' && url.pathname === '/v1/content/skywrites/recoverable') {
    const session = requireAuth(req, res, origin);
    if (!session) return;
    sendJson(res, 200, handleListRecoverableSkywrites(session.userId), origin);
    return;
  }

  if (req.method === 'POST' && url.pathname.match(/^\/v1\/content\/skywrites\/[^/]+\/recover$/)) {
    const session = requireAuth(req, res, origin);
    if (!session) return;
    const skywriteId = url.pathname.split('/')[4] ?? '';
    sendJson(res, 200, handleRecoverSkywrite(session.userId, skywriteId), origin);
    return;
  }

  if (req.method === 'POST' && url.pathname.match(/^\/v1\/content\/skywrites\/[^/]+\/skyreel\/repost$/)) {
    const session = requireAuth(req, res, origin);
    if (!session) return;
    const skywriteId = url.pathname.split('/')[4] ?? '';
    sendJson(res, 200, handleRepostSkyreel(session.userId, skywriteId), origin);
    return;
  }

  if (req.method === 'POST' && url.pathname.match(/^\/v1\/content\/skywrites\/[^/]+\/your-journey$/)) {
    const session = requireAuth(req, res, origin);
    if (!session) return;
    const skywriteId = url.pathname.split('/')[4] ?? '';
    sendJson(res, 200, handleAddToYourJourney(session.userId, skywriteId), origin);
    return;
  }

  if (req.method === 'POST' && url.pathname === '/v1/moderation/reports') {
    const session = requireAuth(req, res, origin);
    if (!session) return;
    try {
      const body = await readJson<{
        targetType?: string;
        targetId?: string;
        targetOwnerUserId?: string;
        reason?: string;
        optionalNote?: string;
        visibilityContext?: string;
        provenanceIds?: string[];
      }>(req);
      const targetType = body.targetType?.trim();
      if (
        targetType !== 'user' &&
        targetType !== 'skywrite' &&
        targetType !== 'message' &&
        targetType !== 'reply' &&
        targetType !== 'community_post'
      ) {
        sendJson(res, 400, { ok: false, error: 'invalid_target_type' }, origin);
        return;
      }
      const result = submitModerationReport({
        reporterUserId: session.userId,
        targetType,
        targetId: body.targetId ?? '',
        targetOwnerUserId: body.targetOwnerUserId ?? null,
        reason: body.reason ?? '',
        optionalNote: body.optionalNote ?? null,
        visibilityContext: body.visibilityContext ?? null,
        provenanceIds: body.provenanceIds ?? [],
      });
      sendJson(res, result.ok ? 201 : 400, result, origin);
    } catch {
      sendJson(res, 400, { error: 'bad_request' }, origin);
    }
    return;
  }

  if (req.method === 'GET' && url.pathname.match(/^\/v1\/content\/skywrites\/[^/]+\/comments$/)) {
    const skywriteId = url.pathname.split('/')[4] ?? '';
    sendJson(res, 200, handleListComments(skywriteId), origin);
    return;
  }

  if (req.method === 'POST' && url.pathname.match(/^\/v1\/content\/skywrites\/[^/]+\/comments$/)) {
    const session = requireAuth(req, res, origin);
    if (!session) return;
    const skywriteId = url.pathname.split('/')[4] ?? '';
    try {
      const body = await readJson<{ text?: string }>(req);
      sendJson(res, 200, handleAddComment(session.userId, skywriteId, body), origin);
    } catch {
      sendJson(res, 400, { error: 'bad_request' }, origin);
    }
    return;
  }

  if (req.method === 'POST' && url.pathname === '/v1/starpath/explain') {
    const session = requireAuth(req, res, origin);
    if (!session) return;
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

async function main(): Promise<void> {
  await initAccountDatabase();
  await processScheduledAccountDeletions();
  await processScheduledSkywritePurges();
  server.listen(config.port, () => {
    console.log(
      `[reellyou-server] listening on :${config.port} auth=${authConfigured()} friendMatch=${friendMatchConfigured()} db=${config.databaseUrl ? 'postgres' : 'file'}`,
    );
  });
}

main().catch((err) => {
  console.error('[reellyou-server] failed to start:', err);
  process.exit(1);
});
