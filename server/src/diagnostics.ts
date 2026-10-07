import type { ServerResponse } from 'node:http';

import { API_RUNTIME_ENTRY, API_SERVICE_NAME, resolveBuildIdentifier } from './buildMeta.js';
import { buildEmailDiagnosticBody } from './email/emailDiagnostic.js';
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
    build: resolveBuildIdentifier(),
  };
  res.writeHead(200, { 'Content-Type': 'application/json', ...corsHeaders(origin) });
  res.end(JSON.stringify(body));
  if (logPath === '/health' || logPath === '/v1/health') {
    logDiagnosticAccess('GET', logPath, 200);
  }
}

export function sendBuildJson(
  res: ServerResponse,
  origin: string | undefined,
  corsHeaders: (origin: string | undefined) => Record<string, string>,
): void {
  const body = {
    service: API_SERVICE_NAME,
    runtime: API_RUNTIME_ENTRY,
    build: resolveBuildIdentifier(),
    nodeEnv: process.env.NODE_ENV?.trim() || 'development',
  };
  res.writeHead(200, { 'Content-Type': 'application/json', ...corsHeaders(origin) });
  res.end(JSON.stringify(body));
  logDiagnosticAccess('GET', '/__build', 200);
}

export function sendEmailDiagnosticJson(
  res: ServerResponse,
  origin: string | undefined,
  corsHeaders: (origin: string | undefined) => Record<string, string>,
): void {
  const body = buildEmailDiagnosticBody();
  res.writeHead(200, { 'Content-Type': 'application/json', ...corsHeaders(origin) });
  res.end(JSON.stringify(body));
  logDiagnosticAccess('GET', '/__email-diagnostic', 200);
}
