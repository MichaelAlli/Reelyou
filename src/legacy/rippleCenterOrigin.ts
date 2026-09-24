import { currentUser } from '@/data/mockData';

/** Center map label — first name when it fits, otherwise canonical initials. */
export function resolveRippleCenterOriginLabel(user = currentUser): string {
  const first = user.name.trim().split(/\s+/)[0] ?? '';
  if (first.length >= 2 && first.length <= 10) return first;
  return user.avatarInitials.trim() || 'You';
}
