#!/usr/bin/env node
/**
 * Disposable-account production API smoke + isolation test.
 * Usage: node scripts/beta-production-e2e.mjs [API_BASE_URL]
 * Default API_BASE_URL: EXPO_PUBLIC_REELYOU_API_URL or https://reellyou-api.onrender.com
 */

const base =
  process.argv[2]?.trim() ||
  process.env.EXPO_PUBLIC_REELYOU_API_URL?.trim() ||
  'https://reellyou-api.onrender.com';

const guid = () => crypto.randomUUID().slice(0, 8);

async function json(method, path, { token, body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${base.replace(/\/$/, '')}${path}`, {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  return { status: res.status, data };
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function registerUser(label) {
  const email = `qa-${label}-${guid()}@disposable.reelyou.test`;
  const payload = {
    email,
    password: 'QaTestPass123!',
    fullName: `QA ${label}`,
    termsAccepted: true,
    termsVersion: 'beta',
    privacyVersion: 'beta',
    consentAcceptedAt: Date.now(),
  };
  const { status, data } = await json('POST', '/v1/auth/register', { body: payload });
  assert(status === 201 && data?.ok && data.accessToken, `${label} register failed (${status})`);
  return { email, password: payload.password, token: data.accessToken, user: data.user };
}

async function main() {
  console.log(`[beta-e2e] API ${base}`);
  const health = await json('GET', '/health');
  console.log('[beta-e2e] health', health.status, health.data);
  assert(health.status === 200 && health.data?.ok === true, 'health must return ok');
  assert(health.data?.databaseReady === true, 'database not ready');
  assert(health.data?.service === 'reellyou-api', 'unexpected health service name');
  assert(health.data?.authConfigured === true, 'auth not configured on server');
  assert(health.data?.mediaStorageConfigured === true, 'media storage not configured');
  assert(health.data?.emailConfigured === true, 'transactional email not configured');
  const revision = health.data?.build ?? health.data?.deploymentRevision;
  assert(typeof revision === 'string' && revision.length >= 7, 'missing deployment revision (build)');
  console.log('[beta-e2e] deployment revision', revision);

  const a = await registerUser('A');
  const b = await registerUser('B');
  assert(a.user.id !== b.user.id, 'users must have distinct ids');

  const profileA = await json('GET', '/v1/profile/me', { token: a.token });
  if (profileA.status === 404) {
    throw new Error('GET /v1/profile/me returned 404 — deploy latest server before E2E');
  }
  assert(profileA.data?.profile?.onboardingComplete === false, 'new user onboardingComplete must be false');

  await json('PUT', '/v1/onboarding/me', {
    token: a.token,
    body: { complete: true },
  });
  const sessionA = await json('GET', '/v1/auth/session', { token: a.token });
  assert(sessionA.data?.user?.onboardingComplete === true, 'session onboardingComplete must be true');

  await json('PATCH', '/v1/profile/me', {
    token: a.token,
    body: { bio: 'E2E north star', fullName: 'QA A Updated' },
  });
  const profileA2 = await json('GET', '/v1/profile/me', { token: a.token });
  assert(profileA2.data?.profile?.bio === 'E2E north star', 'profile bio must persist');

  const textSky = await json('POST', '/v1/content/skywrites', {
    token: a.token,
    body: {
      kind: 'text',
      text: 'E2E text skywrite',
      visibility: 'public',
    },
  });
  assert(textSky.data?.ok === true && textSky.data?.skywrite?.id, 'text skywrite create failed');
  const skyId = textSky.data.skywrite.id;

  const commentB = await json('POST', `/v1/content/skywrites/${skyId}/comments`, {
    token: b.token,
    body: { text: 'Hello from B' },
  });
  assert(commentB.data?.ok === true, 'B comment failed');

  const comments = await json('GET', `/v1/content/skywrites/${skyId}/comments`);
  assert(
    comments.data?.comments?.some((c) => c.text === 'Hello from B'),
    'comment must list after create',
  );

  await json('POST', '/v1/social/follow', {
    token: b.token,
    body: { targetUserId: a.user.id },
  });
  const socialB = await json('GET', '/v1/social/state', { token: b.token });
  assert(
    socialB.data?.followingUserIds?.includes(a.user.id),
    'follow must persist in social state',
  );

  const forgotUnknown = await json('POST', '/v1/auth/password/forgot', {
    body: { email: `missing-${guid()}@disposable.reelyou.test` },
  });
  if (forgotUnknown.data?.accountFound === false) {
    console.log('[beta-e2e] forgot-password unknown account shape OK');
  } else if (forgotUnknown.data?.emailConfigured === false) {
    console.warn('[beta-e2e] WARN: legacy forgot-password response — redeploy server + configure email');
  }

  console.log('[beta-e2e] PASS (API smoke + isolation basics)');
}

main().catch((err) => {
  console.error('[beta-e2e] FAIL', err.message);
  process.exit(1);
});
