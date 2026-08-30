/** Production routes for Screen Preview — do not alter these paths. */
export type DevScreenPreviewId =
  | 'splash'
  | 'welcome'
  | 'sign-up'
  | 'sign-in'
  | 'onboarding-1'
  | 'onboarding-2'
  | 'onboarding-3'
  | 'onboarding-4'
  | 'process'
  | 'home';

export interface DevScreenPreviewTarget {
  id: DevScreenPreviewId;
  label: string;
  description: string;
  href: string;
}

export const DEV_SCREEN_PREVIEW_TARGETS: DevScreenPreviewTarget[] = [
  {
    id: 'splash',
    label: 'Splash',
    description: 'App entry splash',
    href: '/',
  },
  {
    id: 'welcome',
    label: 'Welcome',
    description: 'Post-splash welcome',
    href: '/welcome',
  },
  {
    id: 'sign-up',
    label: 'Sign Up',
    description: 'Registration (day/night)',
    href: '/signup',
  },
  {
    id: 'sign-in',
    label: 'Sign In',
    description: 'Login (day/night)',
    href: '/login',
  },
  {
    id: 'onboarding-1',
    label: 'Onboarding 1',
    description: 'Interests / profile',
    href: '/onboarding/profile',
  },
  {
    id: 'onboarding-2',
    label: 'Onboarding 2',
    description: 'Goals',
    href: '/onboarding/goals',
  },
  {
    id: 'onboarding-3',
    label: 'Onboarding 3',
    description: 'Challenges',
    href: '/onboarding/challenges',
  },
  {
    id: 'onboarding-4',
    label: 'Onboarding 4',
    description: 'North Star',
    href: '/onboarding/north-star',
  },
  {
    id: 'process',
    label: 'Process Screen',
    description: 'Post-onboarding transition',
    href: '/process',
  },
  {
    id: 'home',
    label: 'Home',
    description: 'Main home tab',
    href: '/home',
  },
];
