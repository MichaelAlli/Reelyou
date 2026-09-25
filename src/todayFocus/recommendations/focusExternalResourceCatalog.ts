/** Curated external resources — provenance required; never invented at runtime. */
export interface FocusExternalResourceRecord {
  resourceId: string;
  title: string;
  summary: string;
  provider: string;
  resourceType: 'article' | 'guide' | 'course' | 'tool' | 'organization';
  destinationUrl: string;
  topicKeywords: string[];
  relatedSkyAreaIds: string[];
  credibilityNote: string;
}

export const FOCUS_EXTERNAL_RESOURCE_CATALOG: FocusExternalResourceRecord[] = [
  {
    resourceId: 'ext-interview-prep-hbr',
    title: 'How to prepare for a high-stakes interview',
    summary: 'A practical guide on clarifying your story, practicing aloud, and staying grounded.',
    provider: 'Harvard Business Review',
    resourceType: 'guide',
    destinationUrl: 'https://hbr.org/',
    topicKeywords: ['interview', 'career', 'prepare', 'sales', 'role', 'job'],
    relatedSkyAreaIds: ['career'],
    credibilityNote: 'Reputable professional publication',
  },
  {
    resourceId: 'ext-confidence-reflection',
    title: 'Building confidence through small honest steps',
    summary: 'A calm framework for naming what you know and taking one visible next action.',
    provider: 'Mind Tools',
    resourceType: 'article',
    destinationUrl: 'https://www.mindtools.com/',
    topicKeywords: ['confidence', 'leadership', 'growth', 'present'],
    relatedSkyAreaIds: ['learning', 'career'],
    credibilityNote: 'Established professional development publisher',
  },
];
