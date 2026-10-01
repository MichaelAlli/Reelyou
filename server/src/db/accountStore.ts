import fs from 'node:fs';
import path from 'node:path';

import { config } from '../config.js';
import {
  loadFromPostgres,
  persistToPostgres,
  postgresPersistenceEnabled,
} from './postgresAccountStore.js';

export interface StoredUser {
  id: string;
  emailNormalized: string;
  passwordHash: string;
  fullName: string;
  phoneE164: string | null;
  createdAt: number;
  deletedAt: number | null;
  /** When set, account is hidden from others; cancel within 30d; purge by deletionPurgeAfter. */
  deletionRequestedAt?: number | null;
  deletionPurgeAfter?: number | null;
  /** Terms + Privacy versions accepted at signup (server record). */
  legalConsent?: {
    termsVersion: string;
    privacyVersion: string;
    acceptedAt: number;
  } | null;
}

export interface StoredDiscoveryPreferences {
  discoverableByPhone: boolean;
  discoverableByEmail: boolean;
  updatedAt: number;
}

export interface AccountDatabase {
  users: StoredUser[];
  discoveryPreferences: Record<string, StoredDiscoveryPreferences>;
  phoneIndex: Record<string, string>;
  emailIndex: Record<string, string>;
  blocks: { blockerId: string; blockedId: string; createdAt: number }[];
  friendImport: Record<string, { hasImportedContactData: boolean; updatedAt: number }>;
  followEdges?: { followerUserId: string; followedUserId: string; createdAt: number }[];
  skywrites?: import('../social/skywriteTypes.js').StoredSkywrite[];
  mediaAssets?: import('../media/mediaTypes.js').StoredMediaAsset[];
  comments?: {
    id: string;
    skywriteId: string;
    authorUserId: string;
    text: string;
    createdAt: number;
  }[];
  moderationReports?: import('../moderation/moderationReportStore.js').StoredModerationReport[];
}

const EMPTY_DB: AccountDatabase = {
  users: [],
  discoveryPreferences: {},
  phoneIndex: {},
  emailIndex: {},
  blocks: [],
  friendImport: {},
};

let cached: AccountDatabase | null = null;
let initPromise: Promise<void> | null = null;

function normalizeLoaded(parsed: AccountDatabase): AccountDatabase {
  return {
    ...EMPTY_DB,
    ...parsed,
    followEdges: parsed.followEdges ?? [],
    skywrites: (parsed.skywrites ?? []).map(normalizeLegacySkywrite),
    comments: parsed.comments ?? [],
    mediaAssets: parsed.mediaAssets ?? [],
    moderationReports: parsed.moderationReports ?? [],
  };
}

function normalizeLegacySkywrite(
  raw: import('../social/skywriteTypes.js').StoredSkywrite | { id: string; authorUserId: string; text: string; createdAt: number },
): import('../social/skywriteTypes.js').StoredSkywrite {
  if ('visibility' in raw && 'media' in raw) return raw as import('../social/skywriteTypes.js').StoredSkywrite;
  const legacy = raw as { id: string; authorUserId: string; text: string; createdAt: number };
  return {
    id: legacy.id,
    authorUserId: legacy.authorUserId,
    text: legacy.text,
    createdAt: legacy.createdAt,
    visibility: 'public',
    mediaMode: 'text',
    media: {},
    deletedAt: null,
    deletionPurgeAfter: null,
    skyreelActiveUntilMs: legacy.createdAt + 24 * 60 * 60 * 1000,
    skyreelRepostedAtMs: null,
  };
}

function dbFilePath(): string {
  const configured = config.dbPath;
  if (configured.endsWith('.json')) return configured;
  return path.join(configured, 'accounts.json');
}

/** Call once before handling traffic when DATABASE_URL may be set. */
export async function initAccountDatabase(): Promise<void> {
  if (cached) return;
  if (initPromise) return initPromise;
  initPromise = (async () => {
    if (postgresPersistenceEnabled(config.databaseUrl)) {
      const fromPg = await loadFromPostgres(config.databaseUrl);
      cached = fromPg ? normalizeLoaded(fromPg) : structuredClone(EMPTY_DB);
      if (!fromPg) persistAccountDatabase();
      console.log('[reellyou-server] Loaded account database from Postgres');
      return;
    }
    loadAccountDatabaseFromFile();
  })();
  return initPromise;
}

function loadAccountDatabaseFromFile(): AccountDatabase {
  const file = dbFilePath();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  if (!fs.existsSync(file)) {
    cached = structuredClone(EMPTY_DB);
    persistAccountDatabaseToFile();
    return cached;
  }
  const raw = fs.readFileSync(file, 'utf8');
  cached = normalizeLoaded(JSON.parse(raw) as AccountDatabase);
  return cached;
}

export function loadAccountDatabase(): AccountDatabase {
  if (cached) return cached;
  if (postgresPersistenceEnabled(config.databaseUrl)) {
    throw new Error('[reellyou-server] Call initAccountDatabase() before loadAccountDatabase when DATABASE_URL is set.');
  }
  return loadAccountDatabaseFromFile();
}

function persistAccountDatabaseToFile(): void {
  if (!cached) return;
  const file = dbFilePath();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(cached, null, 2), 'utf8');
  fs.renameSync(tmp, file);
}

export function persistAccountDatabase(): void {
  if (!cached) return;
  if (postgresPersistenceEnabled(config.databaseUrl)) {
    persistToPostgres(config.databaseUrl, cached);
    return;
  }
  persistAccountDatabaseToFile();
}

export function resetAccountDatabaseForTests(filePath: string): AccountDatabase {
  cached = structuredClone(EMPTY_DB);
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  (config as { dbPath: string }).dbPath = filePath;
  persistAccountDatabase();
  return cached;
}

export function closeAccountDatabase(): void {
  cached = null;
}
