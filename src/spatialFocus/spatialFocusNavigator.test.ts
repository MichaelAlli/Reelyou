import {
  resolveSpatialFocusReference,
  selectNextSpatialFocusCandidate,
} from '@/spatialFocus/selectNextSpatialFocusCandidate';
import type { SpatialFocusCandidate } from '@/spatialFocus/types';

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

const candidates: SpatialFocusCandidate[] = [
  { id: 'a', centerX: 80, centerY: 200 },
  { id: 'b', centerX: 180, centerY: 210 },
  { id: 'c', centerX: 280, centerY: 190 },
];

{
  const ref = resolveSpatialFocusReference(candidates, null, 393, 852);
  assert(ref.x === 196.5 && ref.y === 426, 'reference defaults to viewport center');
}

{
  const right = selectNextSpatialFocusCandidate('right', candidates, { x: 196, y: 426 }, null);
  assert(right.nextId === 'c' && !right.noCandidate, 'right picks nearest right-side candidate');
}

{
  const left = selectNextSpatialFocusCandidate('left', candidates, { x: 196, y: 426 }, 'c');
  assert(left.nextId === 'b', 'left steps toward nearer left candidate from c');
}

{
  const none = selectNextSpatialFocusCandidate('left', candidates, { x: 70, y: 200 }, 'a');
  assert(none.nextId === null && none.noCandidate, 'no wrap when no left candidate');
}

{
  const noAuto = selectNextSpatialFocusCandidate('right', candidates, { x: 280, y: 190 }, 'c');
  assert(noAuto.nextId === null && noAuto.noCandidate, 'no candidate beyond far right');
}

console.log('spatialFocusNavigator.test.ts — all cases passed');
