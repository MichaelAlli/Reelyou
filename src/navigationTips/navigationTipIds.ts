export const NAVIGATION_TIP_IDS = [
  'home_today_focus',
  'skywrite_basics',
  'my_sky_overview',
  'starpath_intro',
] as const;

export type NavigationTipId = (typeof NAVIGATION_TIP_IDS)[number];
