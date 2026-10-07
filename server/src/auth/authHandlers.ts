import { authenticateUser, createUser, getUserRecord } from '../db/accountRepository.js';
import { getUserProfile } from '../profile/userProfileRepository.js';
import {
  assertUserMayAuthenticate,
  cancelAccountDeletion,
  getAccountDeletionStatus,
  requestAccountDeletion,
} from './accountDeletion.js';
import {
  requestPasswordReset,
  requestUsernameReminder,
  resetPasswordWithToken,
} from './passwordRecovery.js';
import { consumeRefreshToken, issueRefreshToken } from './refreshTokens.js';
import { signAccessToken } from './jwt.js';
import { completeForgotPasswordTrace, patchForgotPasswordTrace } from './forgotPasswordTrace.js';

function authUserForClient(userId: string): {
  id: string;
  fullName: string;
  email: string;
  username: string | null;
  bio: string | null;
  avatarMediaKey: string | null;
  onboardingComplete: boolean;
} {
  const row = getUserRecord(userId);
  if (!row) throw new Error('user_not_found');
  const profile = getUserProfile(row.id);
  return {
    id: row.id,
    fullName: row.fullName,
    email: row.emailNormalized,
    username: profile?.username ?? null,
    bio: profile?.bio ?? null,
    avatarMediaKey: profile?.avatarMediaKey ?? null,
    onboardingComplete: profile?.onboardingComplete === true,
  };
}

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
  | {
      ok: true;
      accessToken: string;
      refreshToken: string;
      user: ReturnType<typeof authUserForClient>;
    }
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
    const refreshToken = issueRefreshToken(user.id);
    return { ok: true, accessToken, refreshToken, user: authUserForClient(user.id) };
  } catch (error) {
    if (error instanceof Error && error.message.includes('UNIQUE')) {
      return { ok: false, error: 'email_in_use' };
    }
    return { ok: false, error: 'registration_failed' };
  }
}

export function handleLogin(body: { email?: string; password?: string; rememberMe?: boolean }):
  | {
      ok: true;
      accessToken: string;
      refreshToken: string;
      user: ReturnType<typeof authUserForClient>;
    }
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
  const refreshToken = issueRefreshToken(user.id);
  return { ok: true, accessToken, refreshToken, user: authUserForClient(user.id) };
}

export function handleRefresh(body: { refreshToken?: string }):
  | {
      ok: true;
      accessToken: string;
      refreshToken: string;
      user: ReturnType<typeof authUserForClient>;
    }
  | { ok: false; error: string } {
  const raw = body.refreshToken?.trim();
  if (!raw) return { ok: false, error: 'invalid_request' };
  const userId = consumeRefreshToken(raw);
  if (!userId) return { ok: false, error: 'invalid_credentials' };
  const row = getUserRecord(userId);
  if (!row || !assertUserMayAuthenticate(userId)) {
    return { ok: false, error: 'invalid_credentials' };
  }
  const accessToken = signAccessToken(row.id);
  const refreshToken = issueRefreshToken(row.id);
  return { ok: true, accessToken, refreshToken, user: authUserForClient(row.id) };
}

export async function handleForgotPassword(body: { email?: string }, traceId?: string) {
  if (traceId) {
    await patchForgotPasswordTrace(traceId, {
      handlerEnteredAt: new Date().toISOString(),
    });
  }
  const email = body.email?.trim() ?? '';
  if (!email) {
    if (traceId) await completeForgotPasswordTrace(traceId, 'invalid_request');
    return { ok: false as const, error: 'invalid_request' };
  }
  const result = await requestPasswordReset(email, traceId);
  if (!result.ok) {
    return { ok: false as const, error: result.error };
  }
  if (!result.accountFound) {
    return { ok: true as const, accountFound: false as const };
  }
  return {
    ok: true as const,
    accountFound: true as const,
    emailSent: true as const,
    maskedEmail: result.maskedEmail,
  };
}

export async function handleForgotUsername(body: { email?: string }) {
  const email = body.email?.trim() ?? '';
  if (!email) return { ok: false as const, error: 'invalid_request' };
  const result = await requestUsernameReminder(email);
  if (!result.ok) {
    return { ok: false as const, error: result.error };
  }
  if (!result.accountFound) {
    return { ok: true as const, accountFound: false as const };
  }
  return {
    ok: true as const,
    accountFound: true as const,
    emailSent: true as const,
    maskedEmail: result.maskedEmail,
  };
}

export function handleResetPassword(body: { token?: string; password?: string }) {
  const token = body.token?.trim() ?? '';
  const password = body.password ?? '';
  if (!token || !password) return { ok: false as const, error: 'invalid_request' };
  return resetPasswordWithToken(token, password);
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
    user: authUserForClient(row.id),
    accountDeletion: getAccountDeletionStatus(row),
  };
}

export function handleRequestAccountDeletion(userId: string) {
  return requestAccountDeletion(userId);
}

export function handleCancelAccountDeletion(userId: string) {
  return cancelAccountDeletion(userId);
}
