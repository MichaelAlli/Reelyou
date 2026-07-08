export type Mood = 'hopeful' | 'grateful' | 'reflective' | 'determined' | 'peaceful';
export type Privacy = 'private' | 'orbit' | 'public';
export type SkywriteTag =
  | 'Growth'
  | 'Purpose'
  | 'Creativity'
  | 'Faith'
  | 'Entrepreneurship'
  | 'Healing';

export interface User {
  id: string;
  name: string;
  subtitle: string;
  bio: string;
  location: string;
  avatarInitials: string;
  avatarColor: string;
  themes: string[];
}

export interface OrbitUser {
  id: string;
  name: string;
  label: string;
  themes: string[];
  avatarInitials: string;
  avatarColor: string;
}

export interface LegacyStory {
  id: string;
  name: string;
  quote: string;
}

export interface ImpactMoment {
  id: string;
  title: string;
  description: string;
  metric: string;
  timeAgo: string;
}

export interface OpportunityDoor {
  id: string;
  title: string;
  description: string;
  type: string;
}

export interface ImpactMetrics {
  livesEncouraged: number;
  contributionsMade: number;
  reflectionsResonated: number;
  doorsOpened: number;
}

export interface ProfileStats {
  skywritesWritten: number;
  livesEncouraged: number;
  contributionsMade: number;
}
