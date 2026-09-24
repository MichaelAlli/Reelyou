/** Presentation-only — survives navigation within the app session. */
let recentImpactExpanded = true;

export function getRecentImpactExpanded(): boolean {
  return recentImpactExpanded;
}

export function setRecentImpactExpanded(expanded: boolean): void {
  recentImpactExpanded = expanded;
}
