import { authenticateUser, createUser, getUserById } from '../db/accountRepository.js';
import { signAccessToken } from './jwt.js';

export function handleRegister(body: {
  email?: string;
  password?: string;
  fullName?: string;
  phone?: string | null;
}):
  | { ok: true; accessToken: string; user: { id: string; fullName: string; email: string } }
  | { ok: false; error: string } {
  const email = body.email?.trim() ?? '';
  const password = body.password ?? '';
  const fullName = body.fullName?.trim() ?? '';
  if (!email || !password || !fullName) return { ok: false, error: 'invalid_request' };
  if (password.length < 8) return { ok: false, error: 'weak_password' };

  try {
    const user = createUser({ email, password, fullName, phone: body.phone ?? null });
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
  const accessToken = signAccessToken(user.id);
  return { ok: true, accessToken, user };
}

export function handleSession(
  userId: string,
): { ok: true; user: { id: string; fullName: string; email: string } } | { ok: false; error: string } {
  const user = getUserById(userId);
  if (!user) return { ok: false, error: 'not_found' };
  return { ok: true, user };
}
