import { currentUser } from '@/data/mockData';
import type {
  CommunityEncouragement,
  CommunityPost,
  CommunityPostReply,
} from '@/emergingConstellations/emergingConstellationTypes';
import { DEV_EMERGING_CONSTELLATION_ID } from '@/emergingConstellations/emergingConstellationFixtures';

export interface CommunityMemberFixture {
  userId: string;
  displayName: string;
  /** For privacy QA — appears in roster but should be hidden when blocked. */
  privacyQaRole?: 'blocked_target';
}

export const CAREER_TRANSITION_MEMBER_FIXTURES: readonly CommunityMemberFixture[] = [
  { userId: currentUser.id, displayName: 'Michael Alli' },
  { userId: 'orbit-jordan', displayName: 'Jordan' },
  { userId: 'community-fixture-alex', displayName: 'Alex Rivera' },
  { userId: 'community-fixture-sam', displayName: 'Sam Okonkwo' },
  { userId: 'community-fixture-morgan', displayName: 'Morgan Lee', privacyQaRole: 'blocked_target' },
];

const COMMUNITY_ID = DEV_EMERGING_CONSTELLATION_ID;
const FIXTURE_NOW = 1_735_000_000_000;

export const CAREER_TRANSITION_POST_FIXTURES: readonly CommunityPost[] = [
  {
    id: 'cp-career-reflection-1',
    communityId: COMMUNITY_ID,
    authorUserId: 'orbit-jordan',
    kind: 'reflection',
    content:
      'I keep telling myself the next role has to feel aligned — not just impressive. Some days that clarity feels far away, but naming it here helps.',
    moderationStatus: 'visible',
    createdAt: FIXTURE_NOW - 86400_000 * 3,
  },
  {
    id: 'cp-career-support-1',
    communityId: COMMUNITY_ID,
    authorUserId: 'community-fixture-alex',
    kind: 'support_request',
    content:
      'Has anyone navigated a transition without a clear backup plan? I could use perspective on staying grounded while things are uncertain.',
    moderationStatus: 'visible',
    createdAt: FIXTURE_NOW - 86400_000 * 2,
  },
  {
    id: 'cp-career-contribution-1',
    communityId: COMMUNITY_ID,
    authorUserId: 'community-fixture-sam',
    kind: 'contribution',
    content:
      'What helped me was separating “identity” from “title.” I wrote down what I want my days to feel like — that became a compass when offers felt noisy.',
    moderationStatus: 'visible',
    createdAt: FIXTURE_NOW - 86400_000,
  },
  {
    id: 'cp-career-thread-1',
    communityId: COMMUNITY_ID,
    authorUserId: 'community-fixture-morgan',
    kind: 'question',
    content: 'How do you know when it is time to leave versus time to grow where you are?',
    moderationStatus: 'visible',
    createdAt: FIXTURE_NOW - 3600_000 * 5,
  },
  {
    id: 'cp-career-michael-1',
    communityId: COMMUNITY_ID,
    authorUserId: currentUser.id,
    kind: 'reflection',
    content:
      'Sharing here first: I am exploring a shift toward coaching work while keeping financial stability in view.',
    moderationStatus: 'visible',
    createdAt: FIXTURE_NOW - 3600_000 * 6,
  },
];

export const CAREER_TRANSITION_REPLY_FIXTURES: readonly CommunityPostReply[] = [
  {
    id: 'cpr-career-thread-1-a',
    communityId: COMMUNITY_ID,
    postId: 'cp-career-thread-1',
    authorUserId: 'orbit-jordan',
    content:
      'For me it was when learning plateaued and my values kept bumping against the culture — not one bad week, but a steady mismatch.',
    moderationStatus: 'visible',
    createdAt: FIXTURE_NOW - 3600_000 * 4,
  },
  {
    id: 'cpr-career-michael-1-a',
    communityId: COMMUNITY_ID,
    postId: 'cp-career-michael-1',
    authorUserId: 'orbit-jordan',
    content:
      'That balance you named matters. Small experiments alongside stable income helped me test coaching without betting everything at once.',
    moderationStatus: 'visible',
    createdAt: FIXTURE_NOW - 3600_000 * 3,
  },
];

export const CAREER_TRANSITION_ENCOURAGEMENT_FIXTURES: readonly CommunityEncouragement[] = [
  {
    id: 'ce-career-1',
    communityId: COMMUNITY_ID,
    targetType: 'post',
    targetId: 'cp-career-reflection-1',
    fromUserId: currentUser.id,
    createdAt: FIXTURE_NOW - 86400_000 * 2,
  },
];

export function fixturePostsForCommunity(communityId: string): CommunityPost[] {
  if (communityId !== COMMUNITY_ID) return [];
  return [...CAREER_TRANSITION_POST_FIXTURES];
}

export function fixtureRepliesForCommunity(communityId: string): CommunityPostReply[] {
  if (communityId !== COMMUNITY_ID) return [];
  return [...CAREER_TRANSITION_REPLY_FIXTURES];
}

export function fixtureEncouragementsForCommunity(communityId: string): CommunityEncouragement[] {
  if (communityId !== COMMUNITY_ID) return [];
  return [...CAREER_TRANSITION_ENCOURAGEMENT_FIXTURES];
}

export function memberDisplayName(userId: string): string {
  return (
    CAREER_TRANSITION_MEMBER_FIXTURES.find((entry) => entry.userId === userId)?.displayName ??
    'Community member'
  );
}
