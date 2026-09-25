import { currentUser } from '@/data/mockData';
import { clearModerationContentRegistryForTests } from '@/moderation/moderationContentRegistry';
import {
  submitModerationReport,
  consumeStewardshipModerationNegativeTargets,
  clearModerationReportsForTests,
} from '@/moderation/moderationReportService';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

async function run() {
  clearModerationContentRegistryForTests();
  clearModerationReportsForTests();

  const first = await submitModerationReport({
    reporterUserId: currentUser.id,
    targetType: 'user',
    targetId: 'orbit-jordan',
    targetOwnerUserId: 'orbit-jordan',
    reason: 'harassment_bullying',
    optionalNote: 'Test note',
  });
  assert(first.ok && !first.duplicate, 'first report submits');

  const dup = await submitModerationReport({
    reporterUserId: currentUser.id,
    targetType: 'user',
    targetId: 'orbit-jordan',
    targetOwnerUserId: 'orbit-jordan',
    reason: 'spam_scam',
  });
  assert(dup.ok && dup.duplicate, 'duplicate within window');

  assert(
    consumeStewardshipModerationNegativeTargets().includes('orbit-jordan'),
    'credible harassment queues stewardship target',
  );

  await submitModerationReport({
    reporterUserId: currentUser.id,
    targetType: 'skywrite',
    targetId: 'sw-1',
    targetOwnerUserId: 'orbit-jordan',
    reason: 'other',
  });
  assert(consumeStewardshipModerationNegativeTargets().length === 0, 'other reason no stewardship');

  await submitModerationReport({
    reporterUserId: currentUser.id,
    targetType: 'user',
    targetId: 'orbit-3',
    targetOwnerUserId: 'orbit-3',
    reason: 'threats_safety',
  });
  assert(
    consumeStewardshipModerationNegativeTargets().includes('orbit-3'),
    'credible report queues stewardship safety input',
  );

  console.log('moderationReportService.test.ts — OK');
}

void run();
