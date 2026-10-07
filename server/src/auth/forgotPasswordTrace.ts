import { config } from '../config.js';
import {
  getPostgresPool,
  postgresPersistenceEnabled,
} from '../db/postgresAccountStore.js';

export type SafeForgotPasswordTrace = {
  traceId: string;
  startedAt: string | null;
  routeEnteredAt: string | null;
  handlerEnteredAt: string | null;
  passwordRecoveryEnteredAt: string | null;
  emailFunctionEnteredAt: string | null;
  providerSelected: string | null;
  resendRequestStartingAt: string | null;
  resendRequestFinishedAt: string | null;
  resendHttpStatus: number | null;
  resendErrorType: string | null;
  resendErrorMessage: string | null;
  completedAt: string | null;
  finalResult: string | null;
};

const TRACE_TABLE = 'reellyou_forgot_password_trace';

let schemaReady: Promise<void> | null = null;

/** Postgres only — tests use empty DATABASE_URL and never persist. */
export function forgotPasswordTracePersistenceEnabled(): boolean {
  return postgresPersistenceEnabled(config.databaseUrl);
}

function emptyTrace(traceId: string): SafeForgotPasswordTrace {
  return {
    traceId,
    startedAt: null,
    routeEnteredAt: null,
    handlerEnteredAt: null,
    passwordRecoveryEnteredAt: null,
    emailFunctionEnteredAt: null,
    providerSelected: null,
    resendRequestStartingAt: null,
    resendRequestFinishedAt: null,
    resendHttpStatus: null,
    resendErrorType: null,
    resendErrorMessage: null,
    completedAt: null,
    finalResult: null,
  };
}

async function ensureSchema(): Promise<void> {
  if (!forgotPasswordTracePersistenceEnabled()) return;
  if (!schemaReady) {
    schemaReady = (async () => {
      await getPostgresPool(config.databaseUrl).query(`
        CREATE TABLE IF NOT EXISTS ${TRACE_TABLE} (
          trace_id UUID PRIMARY KEY,
          payload JSONB NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);
    })();
  }
  await schemaReady;
}

export async function createForgotPasswordTrace(traceId: string): Promise<void> {
  if (!forgotPasswordTracePersistenceEnabled()) return;
  const now = new Date().toISOString();
  const payload: SafeForgotPasswordTrace = {
    ...emptyTrace(traceId),
    startedAt: now,
    routeEnteredAt: now,
  };
  try {
    await ensureSchema();
    await getPostgresPool(config.databaseUrl).query(
      `INSERT INTO ${TRACE_TABLE} (trace_id, payload, updated_at)
       VALUES ($1, $2::jsonb, NOW())
       ON CONFLICT (trace_id) DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()`,
      [traceId, JSON.stringify(payload)],
    );
  } catch (err) {
    console.error('[reellyou-forgot-trace] create_failed', { traceId, err });
  }
}

export async function patchForgotPasswordTrace(
  traceId: string,
  patch: Partial<Omit<SafeForgotPasswordTrace, 'traceId'>>,
): Promise<void> {
  if (!forgotPasswordTracePersistenceEnabled()) return;
  try {
    await ensureSchema();
    const existing = await loadForgotPasswordTrace(traceId);
    const base = existing ?? emptyTrace(traceId);
    const merged: SafeForgotPasswordTrace = { ...base, ...patch, traceId };
    await getPostgresPool(config.databaseUrl).query(
      `INSERT INTO ${TRACE_TABLE} (trace_id, payload, updated_at)
       VALUES ($1, $2::jsonb, NOW())
       ON CONFLICT (trace_id) DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()`,
      [traceId, JSON.stringify(merged)],
    );
  } catch (err) {
    console.error('[reellyou-forgot-trace] patch_failed', { traceId, err });
  }
}

export async function loadForgotPasswordTrace(
  traceId: string,
): Promise<SafeForgotPasswordTrace | null> {
  if (!forgotPasswordTracePersistenceEnabled()) return null;
  try {
    await ensureSchema();
    const res = await getPostgresPool(config.databaseUrl).query<{ payload: SafeForgotPasswordTrace }>(
      `SELECT payload FROM ${TRACE_TABLE} WHERE trace_id = $1 LIMIT 1`,
      [traceId],
    );
    if (res.rowCount === 0) return null;
    return res.rows[0]!.payload;
  } catch (err) {
    console.error('[reellyou-forgot-trace] load_failed', { traceId, err });
    return null;
  }
}

export async function completeForgotPasswordTrace(
  traceId: string,
  finalResult: string,
): Promise<void> {
  await patchForgotPasswordTrace(traceId, {
    completedAt: new Date().toISOString(),
    finalResult,
  });
}
