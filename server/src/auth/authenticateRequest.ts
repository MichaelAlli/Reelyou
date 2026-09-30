import type { IncomingMessage } from 'node:http';

import { verifyAccessToken } from './jwt.js';

export function extractBearerToken(req: IncomingMessage): string | null {
  const header = req.headers.authorization;
  const raw = Array.isArray(header) ? header[0] : header;
  if (!raw?.startsWith('Bearer ')) return null;
  const token = raw.slice('Bearer '.length).trim();
  return token || null;
}

/** Derives authenticated user id from verified session token only. */
export function authenticateRequest(req: IncomingMessage): { userId: string } | null {
  const token = extractBearerToken(req);
  if (!token) return null;
  const claims = verifyAccessToken(token);
  if (!claims?.sub) return null;
  return { userId: claims.sub };
}
