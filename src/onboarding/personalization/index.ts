export { buildAiCompanionContext } from './aiContextBuilder';
export type { AiCompanionContext, AiContextSection } from './aiContextBuilder';
export { buildHumanPotentialProfile } from './buildHumanPotentialProfile';
export { normalizeOnboardingProfile } from './normalizeProfile';
export { EMPTY_HUMAN_POTENTIAL_PROFILE } from './humanPotentialProfile';
export type { HumanPotentialProfile } from './humanPotentialProfile';
export { EMPTY_PERSONALIZATION_PROFILE } from './types';
export type { UserCommunities, UserPersonalizationProfile, UserTodayFocus } from './types';
export {
  clearCommunitiesStorage,
  loadCommunities,
  saveCommunities,
} from './communities/persistence';
export { EMPTY_COMMUNITIES, isCommunityId } from './communities/types';
export type { CommunitiesRecord, CommunityId, JoinedCommunity } from './communities/types';
export { buildTodayFocusSuggestions, DEFAULT_TODAY_FOCUS_SUGGESTIONS } from './todayFocus/buildSuggestions';
export { getLocalDateKey } from './todayFocus/dateKey';
export { mergePersonalizationProfile } from './todayFocus/mergeProfile';
export {
  clearTodayFocusStorage,
  loadTodayFocus,
  reconcileTodayFocusForToday,
  saveTodayFocus,
} from './todayFocus/persistence';
export {
  EMPTY_TODAY_FOCUS,
  MAX_TODAY_FOCUS_LENGTH,
  MAX_TODAY_FOCUS_REFLECTION_LENGTH,
} from './todayFocus/types';
export type { TodayFocusRecord, TodayFocusSource } from './todayFocus/types';
