/** Lightweight handoff flag — Process → Home cinematic arrival without routing changes. */
let pendingArrival = false;

export function markHomeArrivalPending(): void {
  pendingArrival = true;
}

export function consumeHomeArrivalPending(): boolean {
  if (!pendingArrival) return false;
  pendingArrival = false;
  return true;
}
