/** Matches Render Docker CMD → package.json "start" (no compiled dist). */
export const SERVER_ENTRYPOINT = 'server/src/index.ts';
export const SERVER_START_COMMAND = 'npm start → node --import tsx src/index.ts';

/** Routes mounted by the single http.createServer app in index.ts. */
export const REGISTERED_HTTP_ROUTES: readonly string[] = [
  'GET /health',
  'GET /v1/health',
  'GET /__build',
  'GET /__email-diagnostic',
  'GET /__forgot-trace/:traceId',
  'POST /v1/auth/register',
  'POST /v1/auth/login',
  'POST /v1/auth/refresh',
  'GET /v1/auth/session',
  'POST /v1/auth/password/forgot',
  'POST /v1/auth/password/reset',
  'POST /v1/auth/username/forgot',
  'POST /v1/auth/account/deletion-request',
  'POST /v1/auth/account/deletion-cancel',
  'GET /v1/profile/me',
  'PATCH /v1/profile/me',
  'PUT /v1/onboarding/me',
  'POST /v1/friends/match-contacts',
  'GET|PATCH /v1/friends/discovery-settings',
  'DELETE /v1/friends/imported-discovery-data',
  'GET /v1/social/state',
  'POST /v1/social/follow',
  'DELETE /v1/social/follow/:userId',
  'POST /v1/social/blocks',
  'DELETE /v1/social/blocks/:userId',
  'POST /v1/media/upload-sessions',
  'POST /v1/media/upload-sessions/:id/complete',
  'PUT /v1/media/upload/:storageKey',
  'GET /v1/media/assets/:id/access',
  'GET /v1/media/raw/:storageKey',
  'POST|GET /v1/content/skywrites',
  'GET|DELETE /v1/content/skywrites/:id',
  'GET /v1/content/skywrites/recoverable',
  'POST /v1/content/skywrites/:id/recover',
  'POST /v1/content/skywrites/:id/skyreel/view',
  'GET /v1/content/skywrites/:id/skyreel/viewers',
  'POST /v1/content/skywrites/:id/skyreel/repost',
  'POST /v1/content/skywrites/:id/your-journey',
  'POST /v1/content/skywrites/:id/media/thumbnail',
  'GET|POST /v1/content/skywrites/:id/comments',
  'DELETE /v1/content/skywrites/:id/comments/:commentId',
  'POST /v1/moderation/reports',
  'POST /v1/starpath/explain',
  'POST /v1/starpath/resources/discover',
];

export function logStartupRouteTable(port: number): void {
  const revision =
    process.env.RENDER_GIT_COMMIT?.trim() || process.env.GIT_COMMIT?.trim() || '(local)';
  console.log('[reellyou-server] boot metadata', {
    entrypoint: SERVER_ENTRYPOINT,
    startCommand: SERVER_START_COMMAND,
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port,
    deploymentRevision: revision,
    routeCount: REGISTERED_HTTP_ROUTES.length,
  });
  console.log('[reellyou-server] registered routes:\n' + REGISTERED_HTTP_ROUTES.map((r) => `  ${r}`).join('\n'));
}
