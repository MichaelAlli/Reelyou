import type { NavigationTipId } from '@/navigationTips/navigationTipIds';

export const NavigationTipsCopy = {
  dismissA11y: 'Dismiss tip',
  gotIt: 'Got it',
  replayTips: 'Show navigation tips again',
  replayTipsHint: 'Brings back short first-time hints on Home, Skywrite, My Sky, and Starpath.',
  spatialEdgeHelp: 'Show edge navigation tip again',
  spatialEdgeHelpHint: 'Replay the “tap the edges” hint on Skywrite, My Sky, and Starpath.',
} as const;

export function navigationTipMessage(id: NavigationTipId): string {
  switch (id) {
    case 'home_today_focus':
      return 'Set Today\u2019s Focus on Home, or tap \u00d7 to hide the card for today\u2014open it anytime in Settings.';
    case 'skywrite_basics':
      return 'Tap a post star to open it; Skyreel walks through your recent Skywrites.';
    case 'my_sky_overview':
      return 'My Sky is your full star map\u2014turn on Explore to scroll other visible Skies.';
    case 'starpath_intro':
      return 'Starpath is your evolving journey\u2014follow points and opportunities as they appear.';
    default:
      return '';
  }
}
