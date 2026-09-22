/** Canonical owner/public profile view model — single source for identity + metrics previews. */
export interface OwnerProfileIdentity {
  id: string;
  name: string;
  roleLine: string;
  bio: string;
  avatarUri: string | null;
  avatarInitials: string;
  avatarColor: string;
}

export interface OwnerProfileMetrics {
  livesImpacted: number;
  contributionsMade: number;
}

export interface OwnerProfileSkywritingPreview {
  id: string;
  label: string;
  tone: 'briefcase' | 'leaf' | 'creative' | 'community';
}

export interface OwnerProfileView {
  identity: OwnerProfileIdentity;
  metrics: OwnerProfileMetrics;
  skywritingPreviews: OwnerProfileSkywritingPreview[];
}
