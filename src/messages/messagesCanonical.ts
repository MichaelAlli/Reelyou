export function canonicalThreadId(userA: string, userB: string): string {
  const [a, b] = [userA, userB].sort();
  return `thread-${a}-${b}`;
}

export function otherParticipantId(
  threadParticipantIds: string[],
  selfUserId: string,
): string | null {
  return threadParticipantIds.find((id) => id !== selfUserId) ?? null;
}
