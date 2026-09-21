import { currentUser } from '@/data/mockData';

export function canonicalThreadId(userA: string, userB: string): string {
  const [a, b] = [userA, userB].sort();
  return `thread-${a}-${b}`;
}

export function otherParticipantId(threadParticipantIds: string[]): string | null {
  const self = currentUser.id;
  return threadParticipantIds.find((id) => id !== self) ?? null;
}
