import type { PermittedMeaningSignal } from '@/sharedSky/sharedSkyTypes';
import type { SkywriteRecord } from '@/skywrite/types';

/** Explicit user-authored signals only — never diagnostic labels. */
export function derivePermittedMeaningSignals(post: SkywriteRecord): PermittedMeaningSignal[] {
  const signals = new Set<PermittedMeaningSignal>();
  const text = `${post.text ?? ''} ${post.userHashtags.join(' ')}`.toLowerCase();

  if (/(hope|dream|becoming|future)/.test(text)) signals.add('hope');
  if (/(struggle|hard|challenge|grief|fear)/.test(text)) signals.add('struggle');
  if (/(grow|growth|learn|practice)/.test(text)) signals.add('growth');
  if (/(purpose|why|calling|mission)/.test(text)) signals.add('purpose');
  if (/(value|integrity|kindness|service)/.test(text)) signals.add('values');
  if (/(belong|together|community|connection)/.test(text)) signals.add('belonging');
  if (/(create|art|express|write)/.test(text)) signals.add('creativity');
  if (/(relationship|friend|family|partner)/.test(text)) signals.add('relationships');
  if (/(change|transition|chapter|season)/.test(text)) signals.add('transition');
  if (/(give|help|contribute|impact)/.test(text)) signals.add('contribution');

  return [...signals];
}
