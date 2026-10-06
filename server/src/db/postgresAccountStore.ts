import pg from 'pg';

import type { AccountDatabase } from './accountStore.js';

const STATE_ID = 'main';
const TABLE = 'reellyou_app_state';

let pool: pg.Pool | null = null;

export function postgresPersistenceEnabled(databaseUrl: string): boolean {
  return databaseUrl.length > 0;
}

function postgresSsl(databaseUrl: string): pg.ConnectionConfig['ssl'] {
  const needsSsl =
    /sslmode=require|ssl=true/i.test(databaseUrl) || /\.render\.com/i.test(databaseUrl);
  return needsSsl ? { rejectUnauthorized: false } : undefined;
}

export function getPostgresPool(databaseUrl: string): pg.Pool {
  if (!pool) {
    pool = new pg.Pool({
      connectionString: databaseUrl,
      ssl: postgresSsl(databaseUrl),
      max: 4,
    });
  }
  return pool;
}

export async function ensurePostgresSchema(databaseUrl: string): Promise<void> {
  const client = await getPostgresPool(databaseUrl).connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS ${TABLE} (
        id TEXT PRIMARY KEY,
        payload JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
  } finally {
    client.release();
  }
}

export async function loadFromPostgres(databaseUrl: string): Promise<AccountDatabase | null> {
  await ensurePostgresSchema(databaseUrl);
  const res = await getPostgresPool(databaseUrl).query<{ payload: AccountDatabase }>(
    `SELECT payload FROM ${TABLE} WHERE id = $1 LIMIT 1`,
    [STATE_ID],
  );
  if (res.rowCount === 0) return null;
  return res.rows[0]!.payload;
}

let persistChain: Promise<void> = Promise.resolve();

export function persistToPostgres(databaseUrl: string, data: AccountDatabase): void {
  const payload = structuredClone(data);
  persistChain = persistChain
    .then(async () => {
      await getPostgresPool(databaseUrl).query(
        `INSERT INTO ${TABLE} (id, payload, updated_at)
         VALUES ($1, $2::jsonb, NOW())
         ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()`,
        [STATE_ID, JSON.stringify(payload)],
      );
    })
    .catch((err) => {
      console.error('[reellyou-server] Postgres persist failed:', err);
    });
}

export async function closePostgresPool(): Promise<void> {
  await persistChain;
  if (pool) {
    await pool.end();
    pool = null;
  }
}

export async function pingPostgres(databaseUrl: string): Promise<boolean> {
  if (!postgresPersistenceEnabled(databaseUrl)) return false;
  try {
    const client = await getPostgresPool(databaseUrl).connect();
    try {
      await client.query('SELECT 1');
      return true;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[reellyou-server] Postgres ping failed:', err);
    return false;
  }
}
