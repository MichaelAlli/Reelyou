import assert from 'node:assert/strict';

import { EMPTY_DYNAMIC_WORLD } from '@/starpath/starpathDynamicWorldTypes';
import { EMPTY_RESOURCE_STATE } from '@/starpath/starpathOpportunityTypes';
import { mergeResourceStateWithCloud } from '@/starpath/mergeStarpathCloudProgress';

const merged = mergeResourceStateWithCloud(EMPTY_RESOURCE_STATE, {
  savedResourceIds: ['saved-a'],
  dismissedResourceIds: ['dismiss-b'],
  snoozedResourceUntil: { x: 100 },
});

assert.deepEqual(merged.savedResourceIds, ['saved-a']);
assert.deepEqual(merged.dismissedResourceIds, ['dismiss-b']);
assert.equal(merged.snoozedResourceUntil.x, 100);

const world = {
  ...EMPTY_DYNAMIC_WORLD,
  milestones: [
    {
      id: 'm1',
      branchId: 'b',
      refX: 0.5,
      refY: 0.5,
      sourceNodeIds: [],
      summaryType: 'branch_activity' as const,
      status: 'visible' as const,
      createdAt: 1,
    },
  ],
};

import { collectSettledMilestoneIds } from '@/starpath/mergeStarpathCloudProgress';

assert.deepEqual(collectSettledMilestoneIds(world), ['m1']);

console.log('[mergeStarpathCloudProgress.test] ok');
