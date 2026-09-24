import type { ContributionRecord } from '@/contributions/contributionTypes';
import { currentUser, orbitUsers } from '@/data/mockData';
import {
  deriveLivesImpacted,
  deriveImpactEventCount,
} from '@/humanPotential/humanPotentialMetricsEngine';
import type { HumanPotentialMetricsState } from '@/humanPotential/humanPotentialMetricsState';
import type { ImpactEventRecord, RippleEventRecord } from '@/humanPotential/humanPotentialModels';
import { RippleCopy } from '@/constants/rippleCopy';

export type RippleNodeIconKind = 'heart' | 'leaf' | 'star' | 'people';

export interface RippleHeroMetricSlot {
  key: string;
  label: string;
  value: number;
  iconKind: RippleNodeIconKind;
  iconColor: string;
}

export interface RippleDirectNode {
  userId: string;
  displayName: string;
  statement: string;
  avatarUri: string | null;
  avatarInitials: string;
  avatarColor: string;
  iconKind: RippleNodeIconKind;
  ringColor: string;
  /** Layout anchor on the map field (0–1). */
  anchorX: number;
  anchorY: number;
  impactEventCount: number;
  isDownstream: false;
}

export interface RippleDownstreamNode {
  userId: string;
  displayName: string;
  statement: string;
  avatarUri: string | null;
  avatarInitials: string;
  avatarColor: string;
  iconKind: RippleNodeIconKind;
  ringColor: string;
  anchorX: number;
  anchorY: number;
  rippleEventId: string;
  isDownstream: true;
}

export type RippleMapNode = RippleDirectNode | RippleDownstreamNode;

export interface RippleRecentItem {
  id: string;
  label: string;
  relativeTime: string;
  iconKind: RippleNodeIconKind;
  iconColor: string;
  timestamp: number;
}

export interface LegacyRippleViewModel {
  heroMetrics: RippleHeroMetricSlot[];
  curvedMessage: string;
  showKeepGoing: boolean;
  directNodes: RippleDirectNode[];
  downstreamNodes: RippleDownstreamNode[];
  recentImpact: RippleRecentItem[];
  inboundSupportCount: number;
}

/** Direct-impact anchors — avoid top-center so origin crystal + label stay clear. */
const NODE_LAYOUT: ReadonlyArray<{ anchorX: number; anchorY: number }> = [
  { anchorX: 0.2, anchorY: 0.2 },
  { anchorX: 0.8, anchorY: 0.2 },
  { anchorX: 0.14, anchorY: 0.58 },
  { anchorX: 0.86, anchorY: 0.58 },
  { anchorX: 0.5, anchorY: 0.86 },
];

/** Outer ring — kept away from direct-impact anchors (inner ring). */
const DOWNSTREAM_LAYOUT: ReadonlyArray<{ anchorX: number; anchorY: number }> = [
  { anchorX: 0.06, anchorY: 0.34 },
  { anchorX: 0.94, anchorY: 0.36 },
  { anchorX: 0.04, anchorY: 0.56 },
  { anchorX: 0.96, anchorY: 0.58 },
  { anchorX: 0.10, anchorY: 0.78 },
  { anchorX: 0.90, anchorY: 0.80 },
  { anchorX: 0.26, anchorY: 0.10 },
  { anchorX: 0.74, anchorY: 0.10 },
];

const RING_PALETTE = ['#E8A55B', '#8BC99A', '#9B7EDE', '#6FA8DC', '#D4AF37'] as const;

export interface BuildLegacyRippleViewModelInput {
  ownerUserId: string;
  metrics: HumanPotentialMetricsState;
  contributions: readonly ContributionRecord[];
  userDirectory: Readonly<Record<string, string>>;
  blockedUserIds: readonly string[];
  now?: number;
}

function resolveAvatar(userId: string): {
  avatarUri: string | null;
  avatarInitials: string;
  avatarColor: string;
} {
  if (userId === currentUser.id) {
    return {
      avatarUri: currentUser.avatarUri ?? null,
      avatarInitials: currentUser.avatarInitials,
      avatarColor: currentUser.avatarColor,
    };
  }
  const orbit = orbitUsers.find((entry) => entry.id === userId);
  if (orbit) {
    return {
      avatarUri: null,
      avatarInitials: orbit.avatarInitials,
      avatarColor: orbit.avatarColor,
    };
  }
  const name = userId;
  return { avatarUri: null, avatarInitials: name.slice(0, 2).toUpperCase(), avatarColor: '#9B7EDE' };
}

function iconForImpact(index: number): RippleNodeIconKind {
  const kinds: RippleNodeIconKind[] = ['heart', 'leaf', 'star', 'people', 'heart'];
  return kinds[index % kinds.length] ?? 'heart';
}

function iconColor(kind: RippleNodeIconKind): string {
  switch (kind) {
    case 'heart':
      return '#C47A45';
    case 'leaf':
      return '#5FAF7A';
    case 'star':
      return '#8B6FD4';
    case 'people':
      return '#5A8FD4';
    default:
      return '#C47A45';
  }
}

function truncatePhrase(text: string, max = 52): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trim()}…`;
}

function impactStatement(event: ImpactEventRecord): string {
  const ctx = event.context?.trim();
  if (ctx) return truncatePhrase(ctx);
  return 'Took meaningful action from your support';
}

function rippleStatement(_ripple: RippleEventRecord, _firstName: string): string {
  return 'Carried your impact forward';
}

export function deriveEncouragementsGiven(
  ownerUserId: string,
  metrics: HumanPotentialMetricsState,
): number {
  return metrics.impactEvents.filter(
    (event) => event.contributorUserId === ownerUserId && event.userConfirmed,
  ).length;
}

export function deriveEncouragementsReceived(
  ownerUserId: string,
  metrics: HumanPotentialMetricsState,
): number {
  return metrics.impactEvents.filter(
    (event) => event.impactedUserId === ownerUserId && event.userConfirmed,
  ).length;
}

function formatRelative(ms: number, now: number): string {
  const diff = Math.max(0, now - ms);
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 24) return `${Math.max(1, hours)}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function deriveContributionsMade(
  ownerUserId: string,
  contributions: readonly ContributionRecord[],
): number {
  return contributions.filter(
    (entry) => entry.responderId === ownerUserId && entry.state === 'active',
  ).length;
}

export function deriveRippleCount(ownerUserId: string, metrics: HumanPotentialMetricsState): number {
  return metrics.rippleEvents.filter(
    (entry) => entry.originatingContributorUserId === ownerUserId && entry.userConfirmed,
  ).length;
}

export function deriveApplicationsCount(
  ownerUserId: string,
  metrics: HumanPotentialMetricsState,
): number {
  return metrics.applicationEvidence.filter(
    (entry) => entry.userId === ownerUserId && entry.userConfirmed,
  ).length;
}

export function buildLegacyRippleViewModel(
  input: BuildLegacyRippleViewModelInput,
): LegacyRippleViewModel {
  const now = input.now ?? Date.now();
  const { ownerUserId, metrics, contributions, userDirectory, blockedUserIds } = input;

  const lives = deriveLivesImpacted(ownerUserId, metrics);
  const contributionsMade = deriveContributionsMade(ownerUserId, contributions);
  const encouragementsGiven = deriveEncouragementsGiven(ownerUserId, metrics);
  const encouragementsReceived = deriveEncouragementsReceived(ownerUserId, metrics);

  const heroMetrics: RippleHeroMetricSlot[] = [
    {
      key: 'lives',
      label: RippleCopy.metricLives,
      value: lives,
      iconKind: 'heart',
      iconColor: '#C47A45',
    },
    {
      key: 'contributions',
      label: RippleCopy.metricContributions,
      value: contributionsMade,
      iconKind: 'star',
      iconColor: '#8B6FD4',
    },
    {
      key: 'encouragementsGiven',
      label: RippleCopy.metricEncouragementsGiven,
      value: encouragementsGiven,
      iconKind: 'leaf',
      iconColor: '#5FAF7A',
    },
    {
      key: 'encouragementsReceived',
      label: RippleCopy.metricEncouragementsReceived,
      value: encouragementsReceived,
      iconKind: 'people',
      iconColor: '#5A8FD4',
    },
  ];

  function relationshipScore(rel: (typeof metrics.uniqueImpactRelationships)[number]): number {
    let score = rel.impactEventCount * 12;
    const hasRipple = metrics.rippleEvents.some(
      (ripple) =>
        ripple.originatingContributorUserId === ownerUserId &&
        ripple.directImpactedUserId === rel.impactedUserId &&
        ripple.userConfirmed,
    );
    if (hasRipple) score += 18;
    const contributionLinked = metrics.impactEvents.some(
      (event) =>
        event.impactedUserId === rel.impactedUserId &&
        event.contributorUserId === ownerUserId &&
        event.sourceContributionId,
    );
    if (contributionLinked) score += 8;
    return score;
  }

  const relationships = metrics.uniqueImpactRelationships
    .filter(
      (rel) =>
        rel.active &&
        rel.contributorUserId === ownerUserId &&
        !blockedUserIds.includes(rel.impactedUserId),
    )
    .sort(
      (a, b) =>
        relationshipScore(b) - relationshipScore(a) || b.latestConfirmedAt - a.latestConfirmedAt,
    );

  const directNodes: RippleDirectNode[] = [];
  relationships.slice(0, 5).forEach((rel, index) => {
    const layout = NODE_LAYOUT[index] ?? NODE_LAYOUT[0];
    const fullName = userDirectory[rel.impactedUserId];
    if (!fullName) return;
    const firstName = fullName.split(' ')[0] ?? fullName;
    const latestEvent = metrics.impactEvents
      .filter(
        (event) =>
          event.contributorUserId === ownerUserId &&
          event.impactedUserId === rel.impactedUserId &&
          event.userConfirmed,
      )
      .sort((a, b) => b.createdAt - a.createdAt)[0];
    if (!latestEvent) return;
    const avatar = resolveAvatar(rel.impactedUserId);
    const iconKind = iconForImpact(index);
    directNodes.push({
      userId: rel.impactedUserId,
      displayName: firstName,
      statement: impactStatement(latestEvent),
      avatarUri: avatar.avatarUri,
      avatarInitials: avatar.avatarInitials,
      avatarColor: avatar.avatarColor,
      iconKind,
      ringColor: RING_PALETTE[index % RING_PALETTE.length] ?? RING_PALETTE[0],
      anchorX: layout.anchorX,
      anchorY: layout.anchorY,
      impactEventCount: deriveImpactEventCount(ownerUserId, rel.impactedUserId, metrics),
      isDownstream: false,
    });
  });

  const directUserIds = new Set(directNodes.map((node) => node.userId));

  const downstreamNodes: RippleDownstreamNode[] = metrics.rippleEvents
    .filter(
      (entry) =>
        entry.originatingContributorUserId === ownerUserId &&
        entry.userConfirmed &&
        !blockedUserIds.includes(entry.downstreamUserId) &&
        !directUserIds.has(entry.downstreamUserId),
    )
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 8)
    .map((ripple, index) => {
      const fullName = userDirectory[ripple.downstreamUserId] ?? RippleCopy.privacyHiddenName;
      const firstName = fullName.split(' ')[0] ?? fullName;
      const avatar = resolveAvatar(ripple.downstreamUserId);
      const layout = DOWNSTREAM_LAYOUT[index] ?? DOWNSTREAM_LAYOUT[0];
      return {
        userId: ripple.downstreamUserId,
        displayName: firstName,
        statement: rippleStatement(ripple, firstName),
        avatarUri: avatar.avatarUri,
        avatarInitials: avatar.avatarInitials,
        avatarColor: avatar.avatarColor,
        iconKind: 'star' as const,
        ringColor: '#B8A4E8',
        anchorX: layout.anchorX,
        anchorY: layout.anchorY,
        rippleEventId: ripple.rippleEventId,
        isDownstream: true as const,
      };
    });

  const recentCandidates: RippleRecentItem[] = [];

  for (const event of metrics.impactEvents) {
    if (event.contributorUserId !== ownerUserId || !event.userConfirmed) continue;
    const name = userDirectory[event.impactedUserId]?.split(' ')[0] ?? 'Someone';
    const detail = event.context?.trim();
    recentCandidates.push({
      id: event.impactEventId,
      label: detail ? `${name}: ${detail}` : `Meaningful impact with ${name}`,
      relativeTime: formatRelative(event.createdAt, now),
      iconKind: 'heart',
      iconColor: iconColor('heart'),
      timestamp: event.createdAt,
    });
  }
  for (const ripple of metrics.rippleEvents) {
    if (ripple.originatingContributorUserId !== ownerUserId || !ripple.userConfirmed) continue;
    const name = userDirectory[ripple.downstreamUserId]?.split(' ')[0] ?? 'Someone';
    recentCandidates.push({
      id: ripple.rippleEventId,
      label: `${name} carried your impact forward`,
      relativeTime: formatRelative(ripple.createdAt, now),
      iconKind: 'star',
      iconColor: iconColor('star'),
      timestamp: ripple.createdAt,
    });
  }
  for (const app of metrics.applicationEvidence) {
    if (!app.userConfirmed) continue;
    recentCandidates.push({
      id: app.applicationEvidenceId,
      label: 'You applied something meaningful',
      relativeTime: formatRelative(app.createdAt, now),
      iconKind: 'leaf',
      iconColor: iconColor('leaf'),
      timestamp: app.createdAt,
    });
  }

  recentCandidates.sort((a, b) => b.timestamp - a.timestamp);

  const inboundSupportCount = metrics.impactEvents.filter(
    (event) => event.impactedUserId === ownerUserId && event.userConfirmed,
  ).length;

  return {
    heroMetrics,
    curvedMessage: lives > 0 ? RippleCopy.curvedActive : RippleCopy.curvedQuiet,
    showKeepGoing: true,
    directNodes,
    downstreamNodes,
    recentImpact: recentCandidates.slice(0, 5),
    inboundSupportCount,
  };
}
