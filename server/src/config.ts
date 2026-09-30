function parseOrigins(raw: string | undefined): string[] {
  if (!raw?.trim()) {
    return ['http://localhost:8090', 'http://localhost:8094', 'http://localhost:8096'];
  }
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

const nodeEnv = process.env.NODE_ENV?.trim() || 'development';

export const config = {
  nodeEnv,
  isProduction: nodeEnv === 'production',
  port: Number(process.env.PORT ?? 8787),
  corsOrigins: parseOrigins(process.env.CORS_ORIGIN),
  dbPath: process.env.REELYOU_DB_PATH?.trim() || './data/accounts.json',
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

export function assertProductionSecrets(): void {
  if (!config.isProduction) return;
  if (!authConfigured()) {
    throw new Error('[reellyou-server] AUTH_JWT_SECRET (>=32 chars) is required in production.');
  }
  if (!friendMatchConfigured()) {
    throw new Error('[reellyou-server] FRIEND_MATCH_PEPPER (>=32 chars) is required in production.');
  }
}
