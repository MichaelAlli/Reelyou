export const HomeCopy = {
  arrivalSupport: 'You’re becoming the person you dreamed of. Keep going.',
  skywriteHint: 'What’s on your mind today?',
  skywritePlaceholder: 'Write your sky...',
  starpathTitle: 'My StarPath',
  starpathSubtitle: 'What is my next meaningful direction?',
  starpathCta: 'Continue your StarPath →',
  starpathMilestones: ['Build Discipline', 'Grow Your Craft', 'Create Impact'] as const,
  mySkyTitle: 'My Sky',
  mySkySupport: 'See how your journey is taking shape.',
  mySkyCta: 'View My Sky →',
  growingInTitle: 'Areas You’re Growing In',
  growingInSubtitle: 'Personal growth spaces — the living story of each part of your journey.',
  growingInCta: 'Where I Live →',
  growingInPills: [
    { label: 'Entrepreneurship', icon: '💼', bg: 'rgba(91, 62, 140, 0.72)', border: 'rgba(167, 139, 250, 0.45)' },
    { label: 'Personal Growth', icon: '🪶', bg: 'rgba(120, 88, 48, 0.68)', border: 'rgba(232, 200, 114, 0.42)' },
    { label: 'Creativity', icon: '✎', bg: 'rgba(36, 88, 72, 0.72)', border: 'rgba(94, 234, 212, 0.38)' },
    { label: 'Purpose Seekers', icon: '◉', bg: 'rgba(72, 48, 108, 0.72)', border: 'rgba(196, 168, 255, 0.4)' },
  ] as const,
  todayFocusTitle: 'Today’s Focus',
  todayFocusPrompt: 'What habit or belief are you building today?',
  todayFocusEdit: 'Open',
  todayFocusAction: 'Open Today’s Focus →',
} as const;

export function getTimeGreeting(date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning,';
  if (hour < 17) return 'Good afternoon,';
  return 'Good evening,';
}

export function getFirstName(fullName: string): string {
  const trimmed = fullName.trim();
  if (!trimmed) return 'Friend';
  return trimmed.split(/\s+/)[0] ?? trimmed;
}
