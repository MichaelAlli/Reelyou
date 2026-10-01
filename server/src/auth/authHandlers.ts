import { authenticateUser, createUser, getUserRecord } from '../db/accountRepository.js';
import {
  assertUserMayAuthenticate,
  cancelAccountDeletion,
  getAccountDeletionStatus,
  requestAccountDeletion,
} from './accountDeletion.js';
import { signAccessToken } from './jwt.js';

export function handleRegister(body: {
  email?: string;
  password?: string;
  fullName?: string;
  phone?: string | null;
  termsAccepted?: boolean;
  termsVersion?: string;
  privacyVersion?: string;
  consentAcceptedAt?: number;
}):
  | { ok: true; accessToken: string; user: { id: string; fullName: string; email: string } }
  | { ok: false; error: string } {
  const email = body.email?.trim() ?? '';
  const password = body.password ?? '';
  const fullName = body.fullName?.trim() ?? '';
  if (!email || !password || !fullName) return { ok: false, error: 'invalid_request' };
  if (password.length < 8) return { ok: false, error: 'weak_password' };
  if (body.termsAccepted !== true) return { ok: false, error: 'terms_required' };
  const termsVersion = body.termsVersion?.trim();
  const privacyVersion = body.privacyVersion?.trim();
  if (!termsVersion || !privacyVersion) return { ok: false, error: 'legal_version_required' };

  try {
    const user = createUser({
      email,
      password,
      fullName,
      phone: body.phone ?? null,
      legalConsent: {
        termsVersion,
        privacyVersion,
        acceptedAt: body.consentAcceptedAt ?? Date.now(),
      },
    });
    const accessToken = signAccessToken(user.id);
    return { ok: true, accessToken, user };
  } catch (error) {
    if (error instanceof Error && error.message.includes('UNIQUE')) {
      return { ok: false, error: 'email_in_use' };
    }
    return { ok: false, error: 'registration_failed' };
  }
}

export function handleLogin(body: { email?: string; password?: string }):
  | { ok: true; accessToken: string; user: { id: string; fullName: string; email: string } }
  | { ok: false; error: string } {
  const email = body.email?.trim() ?? '';
  const password = body.password ?? '';
  if (!email || !password) return { ok: false, error: 'invalid_request' };

  const user = authenticateUser(email, password);
  if (!user) return { ok: false, error: 'invalid_credentials' };
  if (!assertUserMayAuthenticate(user.id)) {
    return { ok: false, error: 'account_locked' };
  }
  const accessToken = signAccessToken(user.id);
  return { ok: true, accessToken, user };
}

export function handleSession(
  userId: string,
):
  | {
      ok: true;
      user: { id: string; fullName: string; email: string };
      accountDeletion: ReturnType<typeof getAccountDeletionStatus>;
    }
  | { ok: false; error: string } {
  const row = getUserRecord(userId);
  if (!row || (row.deletedAt != null && row.emailNormalized.startsWith('deleted+'))) {
    return { ok: false, error: 'not_found' };
  }
  if (!assertUserMayAuthenticate(userId)) {
    return { ok: false, error: 'account_locked' };
  }
  return {
    ok: true,
    user: { id: row.id, fullName: row.fullName, email: row.emailNormalized },
    accountDeletion: getAccountDeletionStatus(row),
  };
}

export function handleRequestAccountDeletion(userId: string) {
  return requestAccountDeletion(userId);
}

export function handleCancelAccountDeletion(userId: string) {
  return cancelAccountDeletion(userId);
}
