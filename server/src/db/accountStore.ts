import fs from 'node:fs';
import path from 'node:path';

import { config } from '../config.js';

export interface StoredUser {
  id: string;
  emailNormalized: string;
  passwordHash: string;
  fullName: string;
  phoneE164: string | null;
  createdAt: number;
  deletedAt: number | null;
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

function dbFilePath(): string {
  const configured = config.dbPath;
  if (configured.endsWith('.json')) return configured;
  return path.join(configured, 'accounts.json');
}

export function loadAccountDatabase(): AccountDatabase {
  if (cached) return cached;
  const file = dbFilePath();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  if (!fs.existsSync(file)) {
    cached = structuredClone(EMPTY_DB);
    persistAccountDatabase();
    return cached;
  }
  const raw = fs.readFileSync(file, 'utf8');
  cached = { ...EMPTY_DB, ...(JSON.parse(raw) as AccountDatabase) };
  return cached;
}

export function persistAccountDatabase(): void {
  if (!cached) return;
  const file = dbFilePath();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(cached, null, 2), 'utf8');
  fs.renameSync(tmp, file);
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
