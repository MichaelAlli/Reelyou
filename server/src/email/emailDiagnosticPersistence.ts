import { config } from '../config.js';
import {
  getPostgresPool,
  postgresPersistenceEnabled,
} from '../db/postgresAccountStore.js';
import { getPasswordForgotEmailTrace, type PasswordForgotEmailTrace } from './emailDiagnosticState.js';

const TRACE_TABLE = 'reellyou_forgot_trace';
const TRACE_ROW_ID = 'latest';

let schemaReady: Promise<void> | null = null;

async function ensureTraceSchema(): Promise<void> {
  if (!postgresPersistenceEnabled(config.databaseUrl)) return;
  if (!schemaReady) {
    schemaReady = (async () => {
      await getPostgresPool(config.databaseUrl).query(`
        CREATE TABLE IF NOT EXISTS ${TRACE_TABLE} (
          id TEXT PRIMARY KEY,
          payload JSONB NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);
    })();
  }
  await schemaReady;
}

export async function persistForgotTraceToPostgres(trace: PasswordForgotEmailTrace): Promise<void> {
  if (!postgresPersistenceEnabled(config.databaseUrl)) return;
  try {
    await ensureTraceSchema();
    await getPostgresPool(config.databaseUrl).query(
      `INSERT INTO ${TRACE_TABLE} (id, payload, updated_at)
       VALUES ($1, $2::jsonb, NOW())
       ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()`,
      [TRACE_ROW_ID, JSON.stringify(trace)],
    );
  } catch (err) {
    console.error('[reellyou-email] forgot_trace_persist_failed', err);
  }
}

export async function loadForgotTraceFromPostgres(): Promise<PasswordForgotEmailTrace | null> {
  if (!postgresPersistenceEnabled(config.databaseUrl)) return null;
  try {
    await ensureTraceSchema();
    const res = await getPostgresPool(config.databaseUrl).query<{ payload: PasswordForgotEmailTrace }>(
      `SELECT payload FROM ${TRACE_TABLE} WHERE id = $1 LIMIT 1`,
      [TRACE_ROW_ID],
    );
    if (res.rowCount === 0) return null;
    return res.rows[0]!.payload;
  } catch (err) {
    console.error('[reellyou-email] forgot_trace_load_failed', err);
    return null;
  }
}

function traceTimestamp(trace: PasswordForgotEmailTrace): number {
  const iso =
    trace.realForgotHandlerEnteredAt ??
    trace.routeHandlerInvokedAt ??
    trace.handlerStartAt ??
    null;
  if (!iso) return 0;
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : 0;
}

/** Prefer the newest trace across in-memory (this instance) and Postgres (all instances). */
export async function resolvePasswordForgotTraceForDiagnostic(): Promise<PasswordForgotEmailTrace> {
  const memory = { ...getPasswordForgotEmailTrace() };
  const persisted = await loadForgotTraceFromPostgres();
  if (!persisted) return memory;
  return traceTimestamp(persisted) >= traceTimestamp(memory) ? persisted : memory;
}
