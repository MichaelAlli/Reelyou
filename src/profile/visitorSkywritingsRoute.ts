export function visitorSkywritingsRoute(ownerId: string): string {
  return `/visitor-skywritings?ownerId=${encodeURIComponent(ownerId)}`;
}

export function visitorSkywriteDetailRoute(skywriteId: string, ownerId: string): string {
  return `/skywrite/${encodeURIComponent(skywriteId)}?ownerId=${encodeURIComponent(ownerId)}&visitor=1`;
}
