import { createHmac, timingSafeEqual } from 'node:crypto';

import { config } from '../config.js';

function base64UrlEncode(input: Buffer | string): string {
  const buf = typeof input === 'string' ? Buffer.from(input, 'utf8') : input;
  return buf.toString('base64url');
}

function base64UrlDecode(input: string): Buffer {
  return Buffer.from(input, 'base64url');
}

export interface AccessTokenClaims {
  sub: string;
  exp: number;
  iat: number;
}

export function signAccessToken(userId: string, nowSec = Math.floor(Date.now() / 1000)): string {
  if (!config.auth.jwtSecret) {
    throw new Error('auth_not_configured');
  }
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64UrlEncode(
    JSON.stringify({
      sub: userId,
      iat: nowSec,
      exp: nowSec + config.auth.tokenTtlSec,
      iss: 'reellyou-server',
    }),
  );
  const data = `${header}.${payload}`;
  const sig = createHmac('sha256', config.auth.jwtSecret).update(data).digest('base64url');
  return `${data}.${sig}`;
}

export function verifyAccessToken(token: string, nowSec = Math.floor(Date.now() / 1000)): AccessTokenClaims | null {
  if (!config.auth.jwtSecret) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, payload, signature] = parts;
  const data = `${header}.${payload}`;
  const expected = createHmac('sha256', config.auth.jwtSecret).update(data).digest('base64url');
  const sigBuf = Buffer.from(signature ?? '', 'utf8');
  const expBuf = Buffer.from(expected, 'utf8');
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) return null;

  try {
    const claims = JSON.parse(base64UrlDecode(payload ?? '').toString('utf8')) as AccessTokenClaims;
    if (!claims.sub || typeof claims.exp !== 'number') return null;
    if (claims.exp <= nowSec) return null;
    return claims;
  } catch {
    return null;
  }
}
