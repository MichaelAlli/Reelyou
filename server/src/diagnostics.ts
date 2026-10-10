import type { ServerResponse } from 'node:http';

import { API_SERVICE_NAME, resolveBuildIdentifier } from './buildMeta.js';
import {
  authConfigured,
  friendMatchConfigured,
  mediaStorageConfigured,
} from './config.js';
import { emailProviderConfigured } from './email/transactionalEmail.js';

export { API_RUNTIME_ENTRY, API_SERVICE_NAME, resolveBuildIdentifier } from './buildMeta.js';

export function logDiagnosticAccess(method: string, path: string, status: number): void {
  console.log(`[reellyou-server] diagnostic ${method} ${path} ${status}`);
}

export function sendHealthJson(
  res: ServerResponse,
  origin: string | undefined,
  corsHeaders: (origin: string | undefined) => Record<string, string>,
  databaseReady: boolean,
  logPath: '/health' | '/v1/health' = '/health',
): void {
  const body = {
    ok: true,
    service: API_SERVICE_NAME,
    databaseReady,
    emailConfigured: emailProviderConfigured(),
    authConfigured: authConfigured(),
    friendMatchConfigured: friendMatchConfigured(),
    mediaStorageConfigured: mediaStorageConfigured(),
    build: resolveBuildIdentifier(),
  };
  res.writeHead(200, { 'Content-Type': 'application/json', ...corsHeaders(origin) });
  res.end(JSON.stringify(body));
  if (logPath === '/health' || logPath === '/v1/health') {
    logDiagnosticAccess('GET', logPath, 200);
  }
}

