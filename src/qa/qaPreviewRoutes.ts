import { VISITOR_PROFILE_QA_OWNER_ID } from '@/profile/visitorProfileRoute';

export type QaPreviewSectionId =
  | 'auth'
  | 'onboarding'
  | 'main'
  | 'content'
  | 'system';

export interface QaPreviewTarget {
  id: string;
  section: QaPreviewSectionId;
  label: string;
  description: string;
  /** Production route path (query added by gallery). */
  href: string;
  keywords?: string;
}

export const QA_PREVIEW_SECTION_LABELS: Record<QaPreviewSectionId, string> = {
  auth: 'Auth',
  onboarding: 'Onboarding',
  main: 'Main app',
  content: 'Content',
  system: 'System / dev',
};

export function withQaPreviewHref(
  href: string,
  options?: { qaState?: 'empty' | 'loading' | 'error' | 'populated' },
): string {
  const hashIndex = href.indexOf('#');
  const hash = hashIndex >= 0 ? href.slice(hashIndex) : '';
  const withoutHash = hashIndex >= 0 ? href.slice(0, hashIndex) : href;
  const [path, query = ''] = withoutHash.split('?');
  const params = new URLSearchParams(query);
  params.set('qaPreview', '1');
  if (options?.qaState) {
    params.set('qaState', options.qaState);
  }
  const q = params.toString();
  return `${path}${q ? `?${q}` : ''}${hash}`;
}

/** Major production screens for internal visual QA — paths only, no duplicate components. */
export const QA_PREVIEW_TARGETS: QaPreviewTarget[] = [
  {
    id: 'splash',
    section: 'auth',
    label: 'Splash',
    description: 'App entry splash (isolated preview route)',
    href: '/qa/preview/splash',
  },
  { id: 'welcome', section: 'auth', label: 'Welcome', description: 'Cinematic welcome', href: '/welcome' },
  { id: 'sign-in', section: 'auth', label: 'Sign In', description: 'Day / night login', href: '/login' },
  { id: 'sign-up', section: 'auth', label: 'Create Account', description: 'Day / night sign up', href: '/signup' },
  { id: 'forgot-password', section: 'auth', label: 'Forgot Password', description: 'Password recovery (read-only in QA)', href: '/forgot-password' },
  { id: 'reset-password', section: 'auth', label: 'Reset Password', description: 'New password form (read-only in QA)', href: '/reset-password?token=qa-preview-token' },

  { id: 'onboarding-profile', section: 'onboarding', label: 'Onboarding — Profile / interests', description: 'Step 1', href: '/onboarding/profile' },
  { id: 'onboarding-goals', section: 'onboarding', label: 'Onboarding — Goals', description: 'Step 2', href: '/onboarding/goals' },
  { id: 'onboarding-challenges', section: 'onboarding', label: 'Onboarding — Challenges', description: 'Step 3', href: '/onboarding/challenges' },
  { id: 'onboarding-north-star', section: 'onboarding', label: 'Onboarding — North Star', description: 'Step 4', href: '/onboarding/north-star' },
  { id: 'onboarding-where-you-live', section: 'onboarding', label: 'Where do you live in the Sky?', description: 'Approved Sky Area picker', href: '/onboarding/where-you-live', keywords: 'sky area established' },
  { id: 'onboarding-find-familiar', section: 'onboarding', label: 'Find familiar skies', description: 'Friend discovery onboarding', href: '/onboarding/find-familiar-skies' },
  { id: 'onboarding-starpath', section: 'onboarding', label: 'Onboarding — Starpath intro', description: 'Onboarding starpath', href: '/onboarding/starpath' },
  { id: 'process', section: 'onboarding', label: 'Process', description: 'Post-onboarding transition', href: '/process' },

  { id: 'home', section: 'main', label: 'Home', description: 'Calm preview entry', href: '/home?preview=1' },
  { id: 'my-sky', section: 'main', label: 'My Sky', description: 'Sky tab', href: '/sky' },
  { id: 'skywrite-hub', section: 'main', label: 'Skywrite hub', description: 'Focused Skywrite / library entry', href: '/skywrite' },
  { id: 'skywrite-compose', section: 'main', label: 'Skywrite creation', description: 'Compose flow', href: '/skywrite/compose' },
  { id: 'profile', section: 'main', label: 'Profile / Me', description: 'Owner profile', href: '/profile' },
  { id: 'visitor-profile', section: 'main', label: 'Visitor Profile', description: 'Fixture viewer profile (Jordan)', href: `/visitor-profile?id=${VISITOR_PROFILE_QA_OWNER_ID}` },
  { id: 'starpath', section: 'main', label: 'StarPath', description: 'Starpath experience', href: '/starpath' },
  { id: 'settings', section: 'main', label: 'Settings', description: 'Settings hub', href: '/settings' },
  { id: 'messages', section: 'main', label: 'Messages', description: 'Inbox (notifications substitute)', href: '/messages', keywords: 'notifications inbox' },
  { id: 'impact', section: 'main', label: 'Impact', description: 'Impact tab', href: '/impact' },
  { id: 'legacy', section: 'main', label: 'Legacy', description: 'Legacy hub', href: '/legacy' },
  { id: 'communities', section: 'main', label: 'Communities', description: 'Communities list', href: '/communities' },
  { id: 'today-focus', section: 'main', label: 'Today Focus', description: 'Daily focus', href: '/today-focus' },

  { id: 'skywrite-viewer', section: 'content', label: 'Post viewer', description: 'Immersive post / moment viewer', href: '/skywrite/moment' },
  { id: 'skyreel', section: 'content', label: 'SkyReel', description: 'Guided play / SkyReel', href: '/skywrite/play?scope=focused&autoplay=0' },
  { id: 'skywrite-moment', section: 'content', label: 'Skywrite moment', description: 'Immersive moment viewer', href: '/skywrite/moment' },
  { id: 'visitor-skywritings', section: 'content', label: 'Visitor skywritings', description: 'Visitor writings list', href: '/visitor-skywritings' },
  { id: 'public-sky', section: 'content', label: 'Public sky', description: 'Public sky view', href: '/public-sky' },
  { id: 'my-journey-starpath', section: 'content', label: 'My Journey (Starpath)', description: 'Growth journey surface', href: '/starpath', keywords: 'journey recents' },
  { id: 'library-recents', section: 'content', label: 'Recents (library)', description: 'Open Skywrite hub — Recents tab in sheet', href: '/skywrite', keywords: 'recents library' },
  { id: 'library-archived', section: 'content', label: 'Archived (library)', description: 'Open Skywrite hub — Archived tab in sheet', href: '/skywrite', keywords: 'archived' },
  { id: 'library-contributed', section: 'content', label: 'Contributed (library)', description: 'Open Skywrite hub — Contributed tab in sheet', href: '/skywrite', keywords: 'contributed' },

  { id: 'theme-lab', section: 'system', label: 'Theme lab', description: 'Light / dark QA controls', href: '/dev-theme-lab' },
  { id: 'auth-diagnostic', section: 'system', label: 'Auth diagnostic', description: 'Internal auth state', href: '/dev-auth-diagnostic' },
];

export function groupQaPreviewTargets(filter: string): { section: QaPreviewSectionId; targets: QaPreviewTarget[] }[] {
  const needle = filter.trim().toLowerCase();
  const filtered = QA_PREVIEW_TARGETS.filter((target) => {
    if (!needle) return true;
    const hay = `${target.label} ${target.description} ${target.href} ${target.keywords ?? ''}`.toLowerCase();
    return hay.includes(needle);
  });

  const order: QaPreviewSectionId[] = ['auth', 'onboarding', 'main', 'content', 'system'];
  return order
    .map((section) => ({
      section,
      targets: filtered.filter((t) => t.section === section),
    }))
    .filter((group) => group.targets.length > 0);
}
