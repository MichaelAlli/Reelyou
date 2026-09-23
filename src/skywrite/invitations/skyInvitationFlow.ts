/** Lightweight cross-screen handoff after a successful Sky Invitation response. */

let reopenInvitationsSheet = false;

export function markReturnToSkyInvitationsAfterResponse(): void {
  reopenInvitationsSheet = true;
}

export function consumeReturnToSkyInvitationsAfterResponse(): boolean {
  if (!reopenInvitationsSheet) return false;
  reopenInvitationsSheet = false;
  return true;
}
