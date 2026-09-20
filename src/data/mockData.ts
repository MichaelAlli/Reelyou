import type {
  ImpactMetrics,
  ImpactMoment,
  LegacyStory,
  OpportunityDoor,
  OrbitUser,
  ProfileStats,
  SkywriteTag,
  User,
} from '@/types';

export const currentUser: User = {
  id: 'user-michael',
  name: 'Michael Alli',
  subtitle: 'Creative Coach • Inspirational Leader',
  bio: 'I help people turn pain into power and dreams into purpose.',
  location: 'Atlanta, GA',
  avatarInitials: 'MA',
  avatarColor: '#D4AF37',
  avatarUri: 'https://i.pravatar.cc/512?img=68',
  themes: ['Creativity', 'Purpose', 'Healing'],
};

export const dailySignal =
  'Your path is unfolding. Someone in your orbit needs the courage you found last month.';

export const impactMetrics: ImpactMetrics = {
  livesEncouraged: 47,
  contributionsMade: 128,
  reflectionsResonated: 34,
  doorsOpened: 12,
};

export const profileStats: ProfileStats = {
  skywritesWritten: 86,
  livesEncouraged: 47,
  contributionsMade: 128,
};

export const skywriteTags: SkywriteTag[] = [
  'Growth',
  'Purpose',
  'Creativity',
  'Faith',
  'Entrepreneurship',
  'Healing',
];

export const moods = [
  { id: 'hopeful', label: 'Hopeful', emoji: '✨' },
  { id: 'grateful', label: 'Grateful', emoji: '🙏' },
  { id: 'reflective', label: 'Reflective', emoji: '🌙' },
  { id: 'determined', label: 'Determined', emoji: '🔥' },
  { id: 'peaceful', label: 'Peaceful', emoji: '🕊️' },
] as const;

export const privacyOptions = [
  { id: 'private', label: 'Private', description: 'Only you' },
  { id: 'orbit', label: 'Orbit', description: 'Close connections' },
  { id: 'public', label: 'Public Sky', description: 'Visible to all' },
] as const;

export const orbitUsers: OrbitUser[] = [
  {
    id: 'orbit-jordan',
    name: 'Jordan',
    label: 'Friend • Growth',
    themes: ['Growth', 'Purpose'],
    avatarInitials: 'JO',
    avatarColor: '#9B7EDE',
  },
  {
    id: 'orbit-1',
    name: 'Sarah Chen',
    label: 'Entrepreneur • Healing',
    themes: ['Entrepreneurship', 'Healing'],
    avatarInitials: 'SC',
    avatarColor: '#9B7EDE',
  },
  {
    id: 'orbit-2',
    name: 'David Okonkwo',
    label: 'Artist • Faith',
    themes: ['Creativity', 'Faith'],
    avatarInitials: 'DO',
    avatarColor: '#6EE7B7',
  },
  {
    id: 'orbit-3',
    name: 'Maya Rodriguez',
    label: 'Coach • Purpose',
    themes: ['Purpose', 'Growth'],
    avatarInitials: 'MR',
    avatarColor: '#F5D76E',
  },
  {
    id: 'orbit-4',
    name: 'James Park',
    label: 'Mentor • Creativity',
    themes: ['Creativity', 'Entrepreneurship'],
    avatarInitials: 'JP',
    avatarColor: '#7B61FF',
  },
  {
    id: 'orbit-5',
    name: 'Aisha Thompson',
    label: 'Healer • Faith',
    themes: ['Faith', 'Healing'],
    avatarInitials: 'AT',
    avatarColor: '#D4AF37',
  },
];

export const legacyStories: LegacyStory[] = [
  {
    id: 'legacy-1',
    name: 'Sarah',
    quote: 'Your encouragement gave me the courage to start my business.',
  },
  {
    id: 'legacy-2',
    name: 'David',
    quote: 'You invited me to dance class. I met my wife there.',
  },
  {
    id: 'legacy-3',
    name: 'Maya',
    quote: 'Your Skywrite stopped me from giving up.',
  },
  {
    id: 'legacy-4',
    name: 'James',
    quote: 'You opened a door I never knew existed.',
  },
];

export const impactMoments: ImpactMoment[] = [
  {
    id: 'impact-1',
    title: 'Sarah felt seen',
    description: 'Your Skywrite about starting over resonated deeply with her journey.',
    metric: 'Reflection Resonated',
    timeAgo: '2 days ago',
  },
  {
    id: 'impact-2',
    title: 'Door opened for David',
    description: 'You introduced David to a creative mentor in your orbit.',
    metric: 'Door Opened',
    timeAgo: '5 days ago',
  },
  {
    id: 'impact-3',
    title: 'Maya was encouraged',
    description: 'Your message gave her strength to keep going through a hard season.',
    metric: 'Life Encouraged',
    timeAgo: '1 week ago',
  },
];

export const opportunityDoors: OpportunityDoor[] = [
  {
    id: 'door-1',
    title: 'Apply for Creative Residency',
    description: 'A fellowship aligned with your purpose-driven art practice.',
    type: 'Apply',
  },
  {
    id: 'door-2',
    title: 'Reach Out to Mentor',
    description: 'James Park shares your themes of creativity and entrepreneurship.',
    type: 'Connect',
  },
  {
    id: 'door-3',
    title: 'Join Purpose Gathering',
    description: 'A small circle exploring meaning and direction this Saturday.',
    type: 'Gather',
  },
  {
    id: 'door-4',
    title: 'Share a Skywrite',
    description: 'Your reflection on healing could uplift someone today.',
    type: 'Share',
  },
];

export const starpathData = {
  currentPath: 'Creative Coach building a Human Potential Network',
  suggestedNextStep: 'Host your first Purpose Circle with 5 people from your orbit.',
  companionInsight:
    'Your constellation shows strong connections in Creativity and Healing. Consider bridging these themes in your next Skywrite.',
};

export const onboardingSlides = [
  {
    id: '1',
    title: 'Reflect on who you are becoming.',
    subtitle: 'Your inner sky holds the story of your growth.',
  },
  {
    id: '2',
    title: 'Find people walking similar paths.',
    subtitle: 'Orbit connects you with souls on parallel journeys.',
  },
  {
    id: '3',
    title: 'Encourage others and see your impact.',
    subtitle: 'Every act of presence creates ripples of hope.',
  },
  {
    id: '4',
    title: 'Build a living legacy of the lives touched by your presence.',
    subtitle: 'Legacy is the constellation of lives you have changed.',
  },
];

export const mapFilters = [
  'Creativity',
  'Entrepreneurship',
  'Faith',
  'Healing',
  'Purpose',
  'Personal Growth',
];

export const suggestedSkies: OrbitUser[] = [
  {
    id: 'sky-1',
    name: 'Elena Vasquez',
    label: 'Purpose • Faith',
    themes: ['Purpose', 'Faith'],
    avatarInitials: 'EV',
    avatarColor: '#9B7EDE',
  },
  {
    id: 'sky-2',
    name: 'Marcus Williams',
    label: 'Entrepreneurship • Growth',
    themes: ['Entrepreneurship', 'Personal Growth'],
    avatarInitials: 'MW',
    avatarColor: '#D4AF37',
  },
  {
    id: 'sky-3',
    name: 'Priya Sharma',
    label: 'Healing • Creativity',
    themes: ['Healing', 'Creativity'],
    avatarInitials: 'PS',
    avatarColor: '#6EE7B7',
  },
];

export const constellationStars = [
  { id: 's1', x: 0.15, y: 0.2, size: 4, opacity: 0.8 },
  { id: 's2', x: 0.85, y: 0.15, size: 3, opacity: 0.6 },
  { id: 's3', x: 0.25, y: 0.75, size: 5, opacity: 0.9 },
  { id: 's4', x: 0.7, y: 0.65, size: 3, opacity: 0.7 },
  { id: 's5', x: 0.5, y: 0.1, size: 2, opacity: 0.5 },
  { id: 's6', x: 0.1, y: 0.5, size: 3, opacity: 0.65 },
  { id: 's7', x: 0.9, y: 0.45, size: 4, opacity: 0.75 },
  { id: 's8', x: 0.35, y: 0.35, size: 2, opacity: 0.55 },
  { id: 's9', x: 0.65, y: 0.3, size: 3, opacity: 0.7 },
  { id: 's10', x: 0.45, y: 0.85, size: 4, opacity: 0.8 },
  { id: 's11', x: 0.55, y: 0.55, size: 2, opacity: 0.4 },
  { id: 's12', x: 0.8, y: 0.8, size: 3, opacity: 0.6 },
];

export const legacyConstellationNodes = [
  { id: 'center', name: 'You', x: 0.5, y: 0.5, isCenter: true },
  { id: 'n1', name: 'Sarah', x: 0.25, y: 0.25, isCenter: false },
  { id: 'n2', name: 'David', x: 0.75, y: 0.2, isCenter: false },
  { id: 'n3', name: 'Maya', x: 0.8, y: 0.65, isCenter: false },
  { id: 'n4', name: 'James', x: 0.2, y: 0.7, isCenter: false },
  { id: 'n5', name: 'Aisha', x: 0.5, y: 0.15, isCenter: false },
  { id: 'n6', name: 'Elena', x: 0.15, y: 0.45, isCenter: false },
];
