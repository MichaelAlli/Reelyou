export function visitorLegacyRoute(ownerId: string): string {
  return `/visitor-legacy?ownerId=${encodeURIComponent(ownerId)}`;
}

export function visitorRippleRoute(ownerId: string): string {
  return `/visitor-ripple?ownerId=${encodeURIComponent(ownerId)}`;
}

export function visitorRippleMapRoute(ownerId: string): string {
  return `/visitor-ripple-map?ownerId=${encodeURIComponent(ownerId)}`;
}

export function visitorReelYouRoute(ownerId: string): string {
  return `/visitor-reel-you?ownerId=${encodeURIComponent(ownerId)}`;
}
