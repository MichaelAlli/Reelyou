import { BETA_GUIDING_LIGHT_FIXTURE } from '@/guidingLight/fixtures';
import type {
  GuidingLightDismissRecord,
  GuidingLightHomeView,
  GuidingLightRecord,
} from '@/guidingLight/types';
import type { UserPersonalizationProfile } from '@/onboarding/personalization/types';

/** User-visible signals only — no hidden chain-of-thought. */
function buildWhyExplanation(profile: UserPersonalizationProfile): string {
  const signals: string[] = [];
  if (profile.todayFocus?.value) {
    signals.push('the focus you chose today');
  }
  if (profile.goals.length > 0) {
    signals.push('goals you named during onboarding');
  }
  if (profile.mySky.constellations.length > 0) {
    signals.push('themes appearing in your sky');
  }
  if (signals.length === 0) {
    return 'This connects with the themes you’ve chosen recently.';
  }
  if (signals.length === 1) {
    return `This connects with ${signals[0]}.`;
  }
  const last = signals.pop();
  return `This connects with ${signals.join(', ')}, and ${last}.`;
}

/** Explicit Today’s Focus outranks inferred guidance when themes clearly diverge. */
function shouldYieldToFocus(
  light: GuidingLightRecord,
  profile: UserPersonalizationProfile,
): boolean {
  const focus = profile.todayFocus?.value?.trim().toLowerCase();
  if (!focus) return false;
  // Beta fixture is complementary — only yield when focus explicitly dismisses growth themes.
  if (light.reasonCode === 'growth-theme' && focus.includes('rest')) {
    return true;
  }
  return false;
}

function isDismissed(light: GuidingLightRecord, dismiss: GuidingLightDismissRecord): boolean {
  return Boolean(light.id && dismiss.dismissedLightId === light.id);
}

/**
 * Build Home Guiding Light view — at most one calm possibility, or peace state.
 * Beta uses local fixture; future versions swap in profile-derived logic.
 */
export function buildGuidingLightView(
  profile: UserPersonalizationProfile,
  dismiss: GuidingLightDismissRecord,
): GuidingLightHomeView {
  const candidate = BETA_GUIDING_LIGHT_FIXTURE;

  if (isDismissed(candidate, dismiss)) {
    return { light: null, isPeaceState: true, whyExplanation: null };
  }

  if (shouldYieldToFocus(candidate, profile)) {
    return { light: null, isPeaceState: true, whyExplanation: null };
  }

  return {
    light: candidate,
    isPeaceState: false,
    whyExplanation: buildWhyExplanation(profile),
  };
}
