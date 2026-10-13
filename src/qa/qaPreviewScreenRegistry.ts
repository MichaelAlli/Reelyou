import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { QA_PREVIEW_TARGETS } from '@/qa/qaPreviewRoutes';

export interface QaPreviewScreenSpec {
  targetId: string;
  /** Expo route file (relative to repo root). */
  appRouteFile: string;
  /** Module that must contain the screen implementation marker. */
  markerModule: string;
  screenMarker: string;
  /** Final pathname after redirects (if different from catalog href path). */
  effectivePath?: string;
}

const APP_ROOT = join(process.cwd(), 'src/app');
const POST_WELCOME = join(APP_ROOT, '(post-welcome)');

export function resolveQaPreviewAppRouteFile(pathname: string): string | null {
  const clean = pathname.split('?')[0]?.replace(/\/+$/, '') || '/';

  if (clean === '/welcome') {
    return join(APP_ROOT, 'welcome.tsx');
  }
  if (clean === '/qa/preview/splash') {
    return join(APP_ROOT, 'qa/preview/splash.tsx');
  }

  const relative = clean.startsWith('/') ? clean.slice(1) : clean;
  if (!relative) {
    return join(APP_ROOT, 'index.tsx');
  }

  const candidates = [
    join(POST_WELCOME, `${relative}.tsx`),
    join(POST_WELCOME, relative, 'index.tsx'),
    join(POST_WELCOME, '(tabs)', `${relative}.tsx`),
    join(POST_WELCOME, '(tabs)', relative, 'index.tsx'),
  ];

  for (const file of candidates) {
    if (existsSync(file)) return file;
  }

  return null;
}

export function qaPreviewTargetPathname(href: string): string {
  const hashIndex = href.indexOf('#');
  const withoutHash = hashIndex >= 0 ? href.slice(0, hashIndex) : href;
  return withoutHash.split('?')[0] ?? '/';
}

/** Per-target screen identity for automated QA routing verification. */
export const QA_PREVIEW_SCREEN_SPECS: QaPreviewScreenSpec[] = [
  {
    targetId: 'splash',
    appRouteFile: 'src/app/qa/preview/splash.tsx',
    markerModule: 'src/screens/SplashScreen.tsx',
    screenMarker: 'qaGalleryPreview',
  },
  {
    targetId: 'welcome',
    appRouteFile: 'src/app/welcome.tsx',
    markerModule: 'src/screens/WelcomeScreen.tsx',
    screenMarker: 'WelcomeScreen',
  },
  {
    targetId: 'sign-in',
    appRouteFile: 'src/app/(post-welcome)/login.tsx',
    markerModule: 'src/screens/LogInScreen.tsx',
    screenMarker: 'LogInScreen',
  },
  {
    targetId: 'sign-up',
    appRouteFile: 'src/app/(post-welcome)/signup.tsx',
    markerModule: 'src/screens/SignUpScreen.tsx',
    screenMarker: 'SignUpScreen',
  },
  {
    targetId: 'forgot-password',
    appRouteFile: 'src/app/(post-welcome)/forgot-password.tsx',
    markerModule: 'src/screens/ForgotPasswordScreen.tsx',
    screenMarker: 'ForgotPasswordScreen',
  },
  {
    targetId: 'reset-password',
    appRouteFile: 'src/app/(post-welcome)/reset-password.tsx',
    markerModule: 'src/screens/ResetPasswordScreen.tsx',
    screenMarker: 'ResetPasswordScreen',
  },
  {
    targetId: 'onboarding-profile',
    appRouteFile: 'src/app/(post-welcome)/onboarding/profile.tsx',
    markerModule: 'src/screens/onboarding/OnboardingProfileScreen.tsx',
    screenMarker: 'OnboardingProfileScreen',
  },
  {
    targetId: 'onboarding-goals',
    appRouteFile: 'src/app/(post-welcome)/onboarding/goals.tsx',
    markerModule: 'src/screens/onboarding/OnboardingGoalsScreen.tsx',
    screenMarker: 'OnboardingGoalsScreen',
  },
  {
    targetId: 'onboarding-challenges',
    appRouteFile: 'src/app/(post-welcome)/onboarding/challenges.tsx',
    markerModule: 'src/screens/onboarding/OnboardingChallengesScreen.tsx',
    screenMarker: 'OnboardingChallengesScreen',
  },
  {
    targetId: 'onboarding-north-star',
    appRouteFile: 'src/app/(post-welcome)/onboarding/north-star.tsx',
    markerModule: 'src/screens/onboarding/OnboardingNorthStarScreen.tsx',
    screenMarker: 'OnboardingNorthStarScreen',
  },
  {
    targetId: 'onboarding-where-you-live',
    appRouteFile: 'src/app/(post-welcome)/onboarding/where-you-live.tsx',
    markerModule: 'src/screens/onboarding/OnboardingWhereYouLiveScreen.tsx',
    screenMarker: 'OnboardingWhereYouLiveScreen',
  },
  {
    targetId: 'onboarding-find-familiar',
    appRouteFile: 'src/app/(post-welcome)/onboarding/find-familiar-skies.tsx',
    markerModule: 'src/screens/onboarding/OnboardingFindFamiliarSkiesScreen.tsx',
    screenMarker: 'OnboardingFindFamiliarSkiesScreen',
  },
  {
    targetId: 'onboarding-starpath',
    appRouteFile: 'src/app/(post-welcome)/onboarding/starpath.tsx',
    markerModule: 'src/components/process-starpath/ProcessStarPathExperience.tsx',
    screenMarker: 'process-starpath-experience',
    effectivePath: '/process',
  },
  {
    targetId: 'process',
    appRouteFile: 'src/app/(post-welcome)/process.tsx',
    markerModule: 'src/components/process-starpath/ProcessStarPathExperience.tsx',
    screenMarker: 'process-starpath-experience',
  },
  {
    targetId: 'home',
    appRouteFile: 'src/app/(post-welcome)/(tabs)/home.tsx',
    markerModule: 'src/screens/HomeScreen.tsx',
    screenMarker: 'HomeScreen',
  },
  {
    targetId: 'my-sky',
    appRouteFile: 'src/app/(post-welcome)/(tabs)/sky.tsx',
    markerModule: 'src/screens/MySkyScreen.tsx',
    screenMarker: 'MySkyScreen',
  },
  {
    targetId: 'my-sky-explore',
    appRouteFile: 'src/app/(post-welcome)/(tabs)/sky.tsx',
    markerModule: 'src/screens/MySkyScreen.tsx',
    screenMarker: 'MySkyScreen',
  },
  {
    targetId: 'my-sky-personal',
    appRouteFile: 'src/app/(post-welcome)/(tabs)/sky.tsx',
    markerModule: 'src/screens/MySkyScreen.tsx',
    screenMarker: 'MySkyScreen',
  },
  {
    targetId: 'skywrite-hub',
    appRouteFile: 'src/app/(post-welcome)/skywrite.tsx',
    markerModule: 'src/screens/FocusedSkywriteScreen.tsx',
    screenMarker: 'FocusedSkywriteScreen',
  },
  {
    targetId: 'skywrite-compose',
    appRouteFile: 'src/app/(post-welcome)/skywrite/compose.tsx',
    markerModule: 'src/screens/SkywriteScreen.tsx',
    screenMarker: 'SkywriteScreen',
  },
  {
    targetId: 'profile',
    appRouteFile: 'src/app/(post-welcome)/(tabs)/profile.tsx',
    markerModule: 'src/screens/OwnerProfileScreen.tsx',
    screenMarker: 'OwnerProfileScreen',
  },
  {
    targetId: 'visitor-profile',
    appRouteFile: 'src/app/(post-welcome)/visitor-profile.tsx',
    markerModule: 'src/screens/VisitorProfileScreen.tsx',
    screenMarker: 'VisitorProfileScreen',
  },
  {
    targetId: 'starpath',
    appRouteFile: 'src/app/(post-welcome)/starpath.tsx',
    markerModule: 'src/components/starpath/StarPathScene.tsx',
    screenMarker: 'starpath-world',
  },
  {
    targetId: 'settings',
    appRouteFile: 'src/app/(post-welcome)/settings/index.tsx',
    markerModule: 'src/screens/SettingsHubScreen.tsx',
    screenMarker: 'SettingsHubScreen',
  },
  {
    targetId: 'account',
    appRouteFile: 'src/app/(post-welcome)/settings/account.tsx',
    markerModule: 'src/screens/AccountSecurityScreen.tsx',
    screenMarker: 'AccountSecurityScreen',
  },
  {
    targetId: 'messages',
    appRouteFile: 'src/app/(post-welcome)/messages/index.tsx',
    markerModule: 'src/screens/MessagesInboxScreen.tsx',
    screenMarker: 'MessagesInboxScreen',
  },
  {
    targetId: 'connections',
    appRouteFile: 'src/app/(post-welcome)/sky-friends.tsx',
    markerModule: 'src/screens/SkyFriendsScreen.tsx',
    screenMarker: 'SkyFriendsScreen',
  },
  {
    targetId: 'explore',
    appRouteFile: 'src/app/(post-welcome)/emerging-constellation/explore.tsx',
    markerModule: 'src/screens/EmergingConstellationPreviewScreen.tsx',
    screenMarker: 'EmergingConstellationPreviewScreen',
    effectivePath: '/emerging-constellation/preview',
  },
  {
    targetId: 'impact',
    appRouteFile: 'src/app/(post-welcome)/(tabs)/impact.tsx',
    markerModule: 'src/screens/index.tsx',
    screenMarker: 'ImpactScreen',
  },
  {
    targetId: 'legacy',
    appRouteFile: 'src/app/(post-welcome)/legacy.tsx',
    markerModule: 'src/screens/LegacyExperienceScreen.tsx',
    screenMarker: 'LegacyExperienceScreen',
  },
  {
    targetId: 'communities',
    appRouteFile: 'src/app/(post-welcome)/communities.tsx',
    markerModule: 'src/screens/CommunitiesListScreen.tsx',
    screenMarker: 'CommunitiesListScreen',
  },
  {
    targetId: 'today-focus',
    appRouteFile: 'src/app/(post-welcome)/today-focus.tsx',
    markerModule: 'src/screens/TodayFocusScreen.tsx',
    screenMarker: 'TodayFocusScreen',
  },
  {
    targetId: 'skywrite-viewer',
    appRouteFile: 'src/app/(post-welcome)/skywrite/moment.tsx',
    markerModule: 'src/screens/SkywriteImmersiveMomentScreen.tsx',
    screenMarker: 'SkywriteImmersiveMomentScreen',
  },
  {
    targetId: 'photo-viewer',
    appRouteFile: 'src/app/(post-welcome)/skywrite/moment.tsx',
    markerModule: 'src/screens/SkywriteImmersiveMomentScreen.tsx',
    screenMarker: 'SkywriteImmersiveMomentScreen',
  },
  {
    targetId: 'video-viewer',
    appRouteFile: 'src/app/(post-welcome)/skywrite/moment.tsx',
    markerModule: 'src/screens/SkywriteImmersiveMomentScreen.tsx',
    screenMarker: 'SkywriteImmersiveMomentScreen',
  },
  {
    targetId: 'skyreel',
    appRouteFile: 'src/app/(post-welcome)/skywrite/play.tsx',
    markerModule: 'src/screens/SkywriteGuidedPlayScreen.tsx',
    screenMarker: 'SkywriteGuidedPlayScreen',
  },
  {
    targetId: 'visitor-skywritings',
    appRouteFile: 'src/app/(post-welcome)/visitor-skywritings.tsx',
    markerModule: 'src/screens/VisitorSkywritingsScreen.tsx',
    screenMarker: 'VisitorSkywritingsScreen',
  },
  {
    targetId: 'public-sky',
    appRouteFile: 'src/app/(post-welcome)/public-sky.tsx',
    markerModule: 'src/screens/PublicSkyScreen.tsx',
    screenMarker: 'PublicSkyScreen',
  },
  {
    targetId: 'my-journey-library',
    appRouteFile: 'src/app/(post-welcome)/skywrite.tsx',
    markerModule: 'src/components/focused-sky/MySkywritesSheet.tsx',
    screenMarker: 'MySkywritesSheet',
  },
  {
    targetId: 'library-recents',
    appRouteFile: 'src/app/(post-welcome)/skywrite.tsx',
    markerModule: 'src/components/focused-sky/MySkywritesSheet.tsx',
    screenMarker: 'MySkywritesSheet',
  },
  {
    targetId: 'library-archived',
    appRouteFile: 'src/app/(post-welcome)/skywrite.tsx',
    markerModule: 'src/components/focused-sky/MySkywritesSheet.tsx',
    screenMarker: 'MySkywritesSheet',
  },
  {
    targetId: 'library-contributed',
    appRouteFile: 'src/app/(post-welcome)/skywrite.tsx',
    markerModule: 'src/components/focused-sky/MySkywritesSheet.tsx',
    screenMarker: 'MySkywritesSheet',
  },
  {
    targetId: 'personalized-journey-skywrite',
    appRouteFile: 'src/app/(post-welcome)/skywrite.tsx',
    markerModule: 'src/screens/FocusedSkywriteScreen.tsx',
    screenMarker: 'FocusedSkywriteScreen',
  },
  {
    targetId: 'journey-player',
    appRouteFile: 'src/app/(post-welcome)/skywrite/play.tsx',
    markerModule: 'src/screens/SkywriteGuidedPlayScreen.tsx',
    screenMarker: 'SkywriteGuidedPlayScreen',
  },
  {
    targetId: 'edit-journey',
    appRouteFile: 'src/app/(post-welcome)/skywrite.tsx',
    markerModule: 'src/components/skywrite/JourneySequenceEditorSheet.tsx',
    screenMarker: 'JourneySequenceEditorSheet',
  },
  {
    targetId: 'skywrite-sequence-editor',
    appRouteFile: 'src/app/(post-welcome)/skywrite.tsx',
    markerModule: 'src/components/skywrite/JourneySequenceEditorSheet.tsx',
    screenMarker: 'JourneySequenceEditorSheet',
  },
  {
    targetId: 'theme-lab',
    appRouteFile: 'src/app/(post-welcome)/dev-theme-lab.tsx',
    markerModule: 'src/components/dev/ThemeModeDevControl.tsx',
    screenMarker: 'ThemeModeDevControl',
  },
  {
    targetId: 'auth-diagnostic',
    appRouteFile: 'src/app/(post-welcome)/dev-auth-diagnostic.tsx',
    markerModule: 'src/screens/dev/AuthDiagnosticScreen.tsx',
    screenMarker: 'AuthDiagnosticScreen',
  },
];

export function assertRegistryCoversCatalog(): void {
  const catalogIds = new Set(QA_PREVIEW_TARGETS.map((t) => t.id));
  const specIds = new Set(QA_PREVIEW_SCREEN_SPECS.map((s) => s.targetId));

  for (const target of QA_PREVIEW_TARGETS) {
    if (!specIds.has(target.id)) {
      throw new Error(`QA screen registry missing target: ${target.id}`);
    }
  }
  for (const spec of QA_PREVIEW_SCREEN_SPECS) {
    if (!catalogIds.has(spec.targetId)) {
      throw new Error(`QA catalog missing registry target: ${spec.targetId}`);
    }
  }
}

export function readRepoFile(relativePath: string): string {
  return readFileSync(join(process.cwd(), relativePath), 'utf8');
}
