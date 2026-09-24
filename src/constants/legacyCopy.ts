export const LegacyCopy = {
  screenTitle: 'Legacy',
  heroLine: 'Your journey and ripple effects over time.',
  heroSub: 'Growth, impact, and the moments that shaped who you are becoming.',
  playReelYou: 'Play My REEL-YOU',
  playReelYouSub: 'A cinematic walk through your meaningful moments.',
  emptyTitle: 'Your Legacy is still unfolding',
  emptyBody:
    'When you confirm learning, application, impact, or ripple evidence, meaningful moments will appear here.',
  hiddenTitle: 'Hidden moments',
  restore: 'Restore',
  hide: 'Hide from Legacy',
  edit: 'Edit title',
  back: 'Back',
  dimensionBecoming: 'Becoming',
  dimensionImpact: 'Impact',
  dimensionBoth: 'Growth & impact',
  reelClose: 'Close',
  reelReplay: 'Replay',
  reelPrevious: 'Previous',
  reelNext: 'Next',
  reelPlay: 'Play',
  reelPause: 'Pause',
  reelEmpty: 'Add confirmed growth or impact moments to play your REEL-YOU.',
  reelReviewNote: 'Private preview — nothing is shared until you choose to.',
  reelReviewOpen: 'Review this scene',
  reelReviewClose: 'Hide review options',
  reelEditScene: 'Edit caption',
  reelHideFromReel: 'Hide from Reel',
  reelHideConfirm: 'Remove this scene from your REEL-YOU sequence? You can restore it from Legacy.',
  reelKeepPrivate: 'Keep private',
  reelMarkPublic: 'Mark public (beta)',
  reelCompleteHint: 'Sequence complete — tap Replay to watch again.',
  legacyJourney: 'Journey',
  legacyRipples: 'Ripples',
} as const;

export function legacySignalLabel(eventType: string): string {
  switch (eventType) {
    case 'impact':
      return 'Impact';
    case 'ripple':
      return 'Ripple';
    case 'application':
      return 'Applied';
    case 'contribution':
      return 'Contribution';
    case 'hope':
      return 'Hope';
    case 'belonging':
      return 'Belonging';
    case 'support_received':
      return 'Support';
    case 'support_given':
      return 'Support given';
    case 'growth':
    default:
      return 'Growth';
  }
}
