export const ContributionBeaconCopy = {
  indicatorA11y: (count: number) =>
    `${count} Sky Invitation${count === 1 ? '' : 's'}`,
  sheetTitle: 'Sky Invitations',
  sheetSubtitle: 'You may have something meaningful to share.',
  invitationContext: (areaLabel: string) =>
    `Someone in ${areaLabel} is looking for perspective.`,
  progress: (current: number, total: number) => `${current} of ${total}`,
  viewAll: 'View all',
  backToCard: 'One at a time',
  respond: 'Respond',
  notForMe: 'Not for me',
  close: 'Close',
  caughtUp: 'You’re all caught up',
  caughtUpHint: 'Peace is valid — return to your Sky when you’re ready.',
  nextBatch: (remaining: number) => `More available (${remaining} remaining)`,
  batchProgress: (globalIndex: number, total: number) => `${globalIndex} of ${total}`,
  previewFallback: 'A Skywrite may be worth your perspective.',
  responseSentAck: 'Thank you — your perspective was sent.',
} as const;
