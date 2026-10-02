import type { Router } from 'expo-router';

const SESSION_KEY = '@reellyou/skyreel-return-href';
const DEFAULT_FALLBACK_HREF = '/skywrite';

function readWebHref(): string | null {
  if (typeof window === 'undefined') return null;
  const { pathname, search } = window.location;
  return `${pathname}${search}`;
}

function canUseWebSession(): boolean {
  return typeof window !== 'undefined' && typeof sessionStorage !== 'undefined';
}

function sessionGet(): string | null {
  if (!canUseWebSession()) return null;
  try {
    return sessionStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

function sessionSet(href: string): void {
  if (!canUseWebSession()) return;
  try {
    sessionStorage.setItem(SESSION_KEY, href);
  } catch {
    /* quota / private mode */
  }
}

function sessionClear(): void {
  if (!canUseWebSession()) return;
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* non-blocking */
  }
}

const ALLOWED_RETURN_PREFIXES = [
  '/',
  '/skywrite',
  '/my-sky',
  '/focused-sky',
  '/public-sky',
  '/explore',
  '/settings',
  '/messages',
  '/profile',
  '/owner',
  '/visitor',
  '/today',
  '/starpath',
  '/home',
  '/communities',
  '/companion',
] as const;

export function isAllowedSkyreelReturnHref(href: string): boolean {
  if (!href.startsWith('/') || href.includes('://')) return false;
  if (href.includes('/skywrite/play')) return false;
  const path = href.split('?')[0] ?? href;
  return ALLOWED_RETURN_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

function normalizeReturnTo(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || !isAllowedSkyreelReturnHref(trimmed)) return null;
  return trimmed;
}

/** Remember where the user was before opening Skyreel (web session + URL param). */
export function captureSkyreelReturnRoute(explicitHref?: string): string | null {
  const href = explicitHref?.trim() || readWebHref();
  if (!href || href.includes('/skywrite/play')) return null;
  sessionSet(href);
  return href;
}

export function persistSkyreelReturnFromParam(returnTo: unknown): void {
  const normalized = normalizeReturnTo(returnTo);
  if (normalized) sessionSet(normalized);
}

/** Append returnTo for refresh/direct-entry fallback. Captures current href when omitted. */
export function withSkyreelReturnTo(playPath: string, explicitReturnHref?: string): string {
  const captured = captureSkyreelReturnRoute(explicitReturnHref);
  const returnTo = captured ?? readWebHref();
  if (!returnTo || returnTo.includes('/skywrite/play')) {
    return playPath;
  }
  const sep = playPath.includes('?') ? '&' : '?';
  return `${playPath}${sep}returnTo=${encodeURIComponent(returnTo)}`;
}

export function pushSkyreelPlay(router: Pick<Router, 'push'>, playPath: string): void {
  router.push(withSkyreelReturnTo(playPath) as never);
}

/** Safe exit — never throws GO_BACK when history is empty. */
export function exitSkyreel(
  router: Pick<Router, 'back' | 'replace' | 'canGoBack'>,
  returnToParam?: unknown,
): void {
  if (router.canGoBack()) {
    sessionClear();
    router.back();
    return;
  }

  const fromParam = normalizeReturnTo(returnToParam);
  const fromSession = normalizeReturnTo(sessionGet());
  const target = fromParam ?? fromSession ?? DEFAULT_FALLBACK_HREF;
  sessionClear();
  router.replace(target as never);
}
