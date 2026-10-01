import { authenticatedReellyouFetch } from '@/backend/authenticatedReellyouFetch';

export interface AccountDeletionStatus {
  deletionPending: boolean;
  requestedAt: number | null;
  cancelUntil: number | null;
  purgeAfter: number | null;
  lockedOut: boolean;
}

export async function requestAccountDeletion(): Promise<
  { ok: true; status: AccountDeletionStatus } | { ok: false; error: string }
> {
  const res = await authenticatedReellyouFetch('/v1/auth/account/deletion-request', {
    method: 'POST',
    body: JSON.stringify({ confirm: true }),
  });
  if (!res) return { ok: false, error: 'not_signed_in' };
  const body = (await res.json()) as {
    ok?: boolean;
    status?: AccountDeletionStatus;
    error?: string;
  };
  if (!res.ok || !body.ok || !body.status) {
    return { ok: false, error: body.error ?? 'request_failed' };
  }
  return { ok: true, status: body.status };
}

export async function cancelAccountDeletion(): Promise<
  { ok: true; status: AccountDeletionStatus } | { ok: false; error: string }
> {
  const res = await authenticatedReellyouFetch('/v1/auth/account/deletion-cancel', {
    method: 'POST',
    body: JSON.stringify({}),
  });
  if (!res) return { ok: false, error: 'not_signed_in' };
  const body = (await res.json()) as {
    ok?: boolean;
    status?: AccountDeletionStatus;
    error?: string;
  };
  if (!res.ok || !body.ok || !body.status) {
    return { ok: false, error: body.error ?? 'cancel_failed' };
  }
  return { ok: true, status: body.status };
}

export async function fetchAccountDeletionStatus(): Promise<AccountDeletionStatus | null> {
  const res = await authenticatedReellyouFetch('/v1/auth/session');
  if (!res?.ok) return null;
  const body = (await res.json()) as { accountDeletion?: AccountDeletionStatus };
  return body.accountDeletion ?? null;
}
