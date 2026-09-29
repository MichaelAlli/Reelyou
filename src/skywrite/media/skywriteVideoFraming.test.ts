import {
  computeVideoStageLayout,
  framingToTranslation,
  resolveVideoStageFit,
  translationToFraming,
} from '@/skywrite/media/skywriteVideoFraming';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const portraitStage = { w: 393, h: 852 };
const portraitAspect = 9 / 16;

const fillLayout = computeVideoStageLayout(
  portraitStage.w,
  portraitStage.h,
  portraitAspect,
  'fill',
);
assert(fillLayout.maxPanX > 0, 'portrait fill should allow horizontal pan');
assert(fillLayout.videoHeight >= portraitStage.h, 'fill covers stage height');

const fitLayout = computeVideoStageLayout(
  portraitStage.w,
  portraitStage.h,
  portraitAspect,
  'fit',
);
assert(fitLayout.maxPanX === 0 && fitLayout.maxPanY === 0, 'fit has no pan overflow');

const tx = framingToTranslation({ offsetX: 1, offsetY: 0 }, fillLayout);
assert(tx.translateX === fillLayout.maxPanX, 'full offset maps to max pan');

const back = translationToFraming(tx.translateX, tx.translateY, fillLayout);
assert(Math.abs(back.offsetX - 1) < 0.001, 'round trip offset X');

assert(resolveVideoStageFit({ uri: 'x', stageFit: 'fill' }) === 'fill', 'resolve fill');
assert(resolveVideoStageFit({ uri: 'x' }) === 'fit', 'default fit');

console.log('skywriteVideoFraming.test.ts — OK');
