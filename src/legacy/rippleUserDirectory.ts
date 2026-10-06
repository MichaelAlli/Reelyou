import { isExplicitDevDemoModeEnabled } from '@/auth/demoMode';
import { isLegacyDemoEnabled } from '@/constants/devFlags';
import { currentUser, orbitUsers } from '@/data/mockData';

export function buildRippleUserDirectory(sessionOwner?: {
  id: string;
  name: string;
}): Record<string, string> {
  const map: Record<string, string> = {};
  if (sessionOwner?.id) {
    map[sessionOwner.id] = sessionOwner.name.trim() || 'You';
  }
  if (isExplicitDevDemoModeEnabled()) {
    map[currentUser.id] = currentUser.name;
    for (const user of orbitUsers) {
      map[user.id] = user.name;
    }
  }
  if (isLegacyDemoEnabled()) {
    map['orbit-1'] = 'Alex Kim';
    map['sky-3'] = 'Priya Sharma';
  }
  return map;
}
