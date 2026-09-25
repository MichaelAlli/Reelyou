import type { Privacy } from '@/types';

/** Structured visibility — Private, Connections (orbit), Public. */
export type SkyVisibilityLevel = Privacy;

export interface SkyContentVisibilityOverrides {
  communities?: SkyVisibilityLevel;
  connections?: SkyVisibilityLevel;
  constellations?: SkyVisibilityLevel;
  guidance?: SkyVisibilityLevel;
  impact?: SkyVisibilityLevel;
}

/** Owner-controlled visibility for their Sky. */
export interface SkyVisibilitySettings {
  /** Whether the Sky is discoverable and viewable by others. */
  skyVisibility: SkyVisibilityLevel;
  /** Default visibility for new stars and unset content types. */
  defaultVisibility: SkyVisibilityLevel;
  /** Limited per-layer overrides — not per-star granularity. */
  contentOverrides: SkyContentVisibilityOverrides;
}

export const DEFAULT_SKY_VISIBILITY_SETTINGS: SkyVisibilitySettings = {
  skyVisibility: 'orbit',
  defaultVisibility: 'private',
  contentOverrides: {},
};

/** Beta catalog — orbit users with varied visibility for QA. */
export const ORBIT_SKY_VISIBILITY_CATALOG: Record<string, SkyVisibilitySettings> = {
  'orbit-jordan': {
    skyVisibility: 'orbit',
    defaultVisibility: 'orbit',
    contentOverrides: { connections: 'orbit', impact: 'public' },
  },
  'orbit-1': {
    skyVisibility: 'public',
    defaultVisibility: 'public',
    contentOverrides: { communities: 'public', impact: 'public' },
  },
  'orbit-2': {
    skyVisibility: 'public',
    defaultVisibility: 'orbit',
    contentOverrides: {},
  },
  'orbit-3': {
    skyVisibility: 'orbit',
    defaultVisibility: 'private',
    contentOverrides: { connections: 'orbit' },
  },
  'orbit-4': {
    skyVisibility: 'public',
    defaultVisibility: 'public',
    contentOverrides: {},
  },
  'orbit-5': {
    skyVisibility: 'private',
    defaultVisibility: 'private',
    contentOverrides: {},
  },
};

export function normalizeSkyVisibilitySettings(
  raw: Partial<SkyVisibilitySettings> | null | undefined,
): SkyVisibilitySettings {
  if (!raw) return { ...DEFAULT_SKY_VISIBILITY_SETTINGS, contentOverrides: {} };

  const contentOverrides: SkyContentVisibilityOverrides = {};
  const overrides = raw.contentOverrides ?? {};
  for (const key of [
    'communities',
    'connections',
    'constellations',
    'guidance',
    'impact',
  ] as const) {
    const value = overrides[key];
    if (value === 'private' || value === 'orbit' || value === 'sky_friends' || value === 'public') {
      contentOverrides[key] = value;
    }
  }

  return {
    skyVisibility: isVisibilityLevel(raw.skyVisibility)
      ? raw.skyVisibility
      : DEFAULT_SKY_VISIBILITY_SETTINGS.skyVisibility,
    defaultVisibility: isVisibilityLevel(raw.defaultVisibility)
      ? raw.defaultVisibility
      : DEFAULT_SKY_VISIBILITY_SETTINGS.defaultVisibility,
    contentOverrides,
  };
}

function isVisibilityLevel(value: unknown): value is SkyVisibilityLevel {
  return (
    value === 'private' ||
    value === 'orbit' ||
    value === 'sky_friends' ||
    value === 'public'
  );
}

/** Resolve settings for an owner — catalog for orbit users, caller-supplied for self. */
export function resolveSkyVisibilitySettingsForOwner(
  ownerId: string,
  ownerSettings?: SkyVisibilitySettings | null,
): SkyVisibilitySettings {
  if (ownerSettings) return normalizeSkyVisibilitySettings(ownerSettings);
  return normalizeSkyVisibilitySettings(ORBIT_SKY_VISIBILITY_CATALOG[ownerId]);
}

/** Whether a viewer may open this person's Public Sky route. */
export function canViewPublicSky(
  settings: SkyVisibilitySettings,
  isConnected: boolean,
): boolean {
  if (settings.skyVisibility === 'private') return false;
  if (settings.skyVisibility === 'orbit' || settings.skyVisibility === 'sky_friends') {
    return isConnected;
  }
  return true;
}

/** Whether this Sky may appear in Explore / discoverable search. */
export function isSkyDiscoverable(settings: SkyVisibilitySettings): boolean {
  return settings.skyVisibility === 'public';
}

/** Resolve effective visibility for a node — explicit value wins, then layer override, then default. */
export function resolveEffectiveNodeVisibility(
  node: { type: string; layer: string; visibility?: string },
  settings: SkyVisibilitySettings,
): SkyVisibilityLevel {
  if (node.visibility === 'private' || node.visibility === 'orbit' || node.visibility === 'public') {
    return node.visibility;
  }

  const overrides = settings.contentOverrides;
  if (node.type === 'community' || node.layer === 'communities') {
    return overrides.communities ?? settings.defaultVisibility;
  }
  if (node.type === 'relationship' || node.layer === 'connections') {
    return overrides.connections ?? settings.defaultVisibility;
  }
  if (node.type === 'guidance' || node.layer === 'guidance') {
    return overrides.guidance ?? 'private';
  }
  if (node.type === 'impact' || node.layer === 'impact') {
    return overrides.impact ?? settings.defaultVisibility;
  }
  if (node.type === 'reflection') {
    return 'private';
  }

  return settings.defaultVisibility;
}

export const SKY_VISIBILITY_LABELS: Record<SkyVisibilityLevel, string> = {
  private: 'Private',
  orbit: 'Connections',
  sky_friends: 'Connected Skies',
  public: 'Public',
};

export const SKY_VISIBILITY_ICONS: Record<SkyVisibilityLevel, string> = {
  private: '🔒',
  orbit: '👥',
  sky_friends: '✨',
  public: '🌐',
};
