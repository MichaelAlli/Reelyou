function parseOrigins(raw: string | undefined): string[] {
  if (!raw?.trim()) {
    return [
      'http://localhost:8081',
      'http://localhost:8090',
      'http://localhost:8091',
      'http://localhost:8094',
      'http://localhost:8096',
      'http://localhost:19006',
    ];
  }
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

const nodeEnv = process.env.NODE_ENV?.trim() || 'development';

/** Reflect request Origin in dev for any localhost port (Metro often moves between 8081/8090). */
export function resolveCorsAllowOrigin(requestOrigin: string | undefined): string {
  const fallback = config.corsOrigins[0] ?? '*';
  if (!requestOrigin) return fallback;
  if (config.corsOrigins.includes(requestOrigin)) return requestOrigin;
  if (
    !config.isProduction &&
    /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(requestOrigin)
  ) {
    return requestOrigin;
  }
  return fallback;
}

export const config = {
  nodeEnv,
  isProduction: nodeEnv === 'production',
  port: Number(process.env.PORT ?? 8787),
  corsOrigins: parseOrigins(process.env.CORS_ORIGIN),
  dbPath: process.env.REELYOU_DB_PATH?.trim() || './data/accounts.json',
  /** When set (e.g. Render Postgres), social graph + accounts persist across deploys. */
  databaseUrl: process.env.DATABASE_URL?.trim() ?? '',
  auth: {
    jwtSecret: process.env.AUTH_JWT_SECRET?.trim() ?? '',
    tokenTtlSec: Math.max(Number(process.env.AUTH_TOKEN_TTL_SEC ?? 604_800), 3600),
  },
  friendMatch: {
    pepper: process.env.FRIEND_MATCH_PEPPER?.trim() ?? '',
  },
  openAi: {
    apiKey: process.env.OPENAI_API_KEY?.trim() ?? '',
    model: process.env.OPENAI_MODEL?.trim() || 'gpt-4o-mini',
    maxOutputTokens: Math.min(Number(process.env.OPENAI_MAX_OUTPUT_TOKENS ?? 280), 600),
    dailyRequestBudget: Math.max(Number(process.env.OPENAI_DAILY_REQUEST_BUDGET ?? 500), 0),
    timeoutMs: 25_000,
    maxRetries: 2,
  },
  media: {
    /** `s3` for beta/production (S3-compatible, e.g. Cloudflare R2). `local` for automated tests only. */
    storage: (process.env.MEDIA_STORAGE?.trim() || 'local') as 'local' | 's3',
    localRoot: process.env.MEDIA_LOCAL_ROOT?.trim() || './data/media',
    signedUrlTtlSec: Math.max(Number(process.env.MEDIA_SIGNED_URL_TTL_SEC ?? 900), 60),
    s3: {
      endpoint: process.env.MEDIA_S3_ENDPOINT?.trim() ?? '',
      region: process.env.MEDIA_S3_REGION?.trim() || 'auto',
      bucket: process.env.MEDIA_S3_BUCKET?.trim() ?? '',
      accessKeyId: process.env.MEDIA_S3_ACCESS_KEY_ID?.trim() ?? '',
      secretAccessKey: process.env.MEDIA_S3_SECRET_ACCESS_KEY?.trim() ?? '',
    },
  },
  appOrigin: process.env.APP_ORIGIN?.trim() || 'http://localhost:8081',
  email: {
    resendApiKey: process.env.RESEND_API_KEY?.trim() ?? '',
    smtpHost: process.env.SMTP_HOST?.trim() ?? '',
    fromAddress: process.env.EMAIL_FROM?.trim() || 'REELYOU <noreply@reellyou.app>',
  },
  resources: {
    rssUrls: (process.env.RESOURCE_RSS_URLS ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    arxivEnabled: process.env.ARXIV_ENABLED !== 'false',
    grantsGovEnabled: process.env.GRANTS_GOV_ENABLED !== 'false',
    cacheTtlMs: 45 * 60 * 1000,
    staleTtlMs: 6 * 60 * 60 * 1000,
    linkVerifyTimeoutMs: 8_000,
  },
};

export function openAiConfigured(): boolean {
  return config.openAi.apiKey.length > 0;
}

export function authConfigured(): boolean {
  return config.auth.jwtSecret.length >= 32;
}

export function friendMatchConfigured(): boolean {
  return config.friendMatch.pepper.length >= 32;
}

export function mediaStorageConfigured(): boolean {
  if (config.media.storage === 'local') return config.isProduction ? false : true;
  const s = config.media.s3;
  return (
    s.bucket.length > 0 &&
    s.accessKeyId.length > 0 &&
    s.secretAccessKey.length > 0 &&
    (s.endpoint.length > 0 || s.region.length > 0)
  );
}

export function assertProductionSecrets(): void {
  if (!config.isProduction) return;
  if (!authConfigured()) {
    throw new Error('[reellyou-server] AUTH_JWT_SECRET (>=32 chars) is required in production.');
  }
  if (!friendMatchConfigured()) {
    throw new Error('[reellyou-server] FRIEND_MATCH_PEPPER (>=32 chars) is required in production.');
  }
  if (config.media.storage !== 's3' || !mediaStorageConfigured()) {
    throw new Error(
      '[reellyou-server] MEDIA_STORAGE=s3 with MEDIA_S3_BUCKET, MEDIA_S3_ACCESS_KEY_ID, MEDIA_S3_SECRET_ACCESS_KEY, MEDIA_S3_ENDPOINT is required in production.',
    );
  }
  if (!config.databaseUrl) {
    throw new Error('[reellyou-server] DATABASE_URL is required in production.');
  }
}
