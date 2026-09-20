import type { StarPathBranchId } from '@/starpath/starpathTheme';

export interface CategoryNodeSpec {
  id: string;
  branchId: StarPathBranchId;
  label: string;
  icon: string;
  x: number;
  y: number;
  kind: 'milestone' | 'reflection' | 'growth';
}

export interface HumanNodeSpec {
  id: string;
  name: string;
  initials: string;
  color: string;
  role: 'mentor' | 'community' | 'inspiration';
  x: number;
  y: number;
  tether?: { x: number; y: number };
}

export const STARPATH_CATEGORY_NODES: CategoryNodeSpec[] = [
  { id: 'relationships', branchId: 'relationships', label: 'Relationships', icon: '♡', x: 0.2, y: 0.5, kind: 'growth' },
  { id: 'creativity', branchId: 'creativity', label: 'Creativity', icon: '◈', x: 0.16, y: 0.44, kind: 'milestone' },
  { id: 'purpose', branchId: 'purpose', label: 'Purpose', icon: '✦', x: 0.18, y: 0.38, kind: 'reflection' },
  { id: 'growth', branchId: 'growth', label: 'Growth', icon: '↗', x: 0.84, y: 0.44, kind: 'growth' },
  { id: 'community', branchId: 'community', label: 'Community', icon: '◎', x: 0.82, y: 0.38, kind: 'milestone' },
  { id: 'learning', branchId: 'learning', label: 'Learning', icon: '◇', x: 0.78, y: 0.34, kind: 'reflection' },
  { id: 'wellness', branchId: 'wellness', label: 'Wellness', icon: '☼', x: 0.22, y: 0.32, kind: 'milestone' },
];

export const STARPATH_PATH_NODES = STARPATH_CATEGORY_NODES;

export const STARPATH_HUMAN_NODES: HumanNodeSpec[] = [
  {
    id: 'mentor-1',
    name: 'Elena',
    initials: 'E',
    color: '#C4A8FF',
    role: 'mentor',
    x: 0.26,
    y: 0.52,
    tether: { x: 0.44, y: 0.52 },
  },
  {
    id: 'community-1',
    name: 'Jordan',
    initials: 'J',
    color: '#5EEAD4',
    role: 'community',
    x: 0.74,
    y: 0.5,
    tether: { x: 0.56, y: 0.5 },
  },
  {
    id: 'inspiration-1',
    name: 'Ava',
    initials: 'A',
    color: '#8FD4FF',
    role: 'inspiration',
    x: 0.3,
    y: 0.42,
    tether: { x: 0.46, y: 0.44 },
  },
  {
    id: 'connection-1',
    name: 'Rio',
    initials: 'R',
    color: '#E879A8',
    role: 'community',
    x: 0.7,
    y: 0.4,
    tether: { x: 0.54, y: 0.42 },
  },
];
