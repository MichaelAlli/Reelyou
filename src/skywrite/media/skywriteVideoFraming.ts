import type { SkywritePhotoMedia, SkywriteVideoMedia } from '@/skywrite/types';

export type SkywriteVideoStageFit = 'fit' | 'fill';

export type SkywriteStageFramingMedia = Pick<
  SkywriteVideoMedia | SkywritePhotoMedia,
  'stageFit' | 'framingOffsetX' | 'framingOffsetY'
>;

export interface SkywriteVideoFraming {
  offsetX: number;
  offsetY: number;
}

export interface VideoStageLayout {
  stageWidth: number;
  stageHeight: number;
  videoWidth: number;
  videoHeight: number;
  maxPanX: number;
  maxPanY: number;
}

const SNAP_THRESHOLD = 0.08;

export function clampFramingOffset(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(-1, Math.min(1, value));
}

export function resolveVideoStageFit(
  media?: SkywriteStageFramingMedia | null,
): SkywriteVideoStageFit {
  return media?.stageFit === 'fill' ? 'fill' : 'fit';
}

export function resolveVideoFraming(
  media?: SkywriteStageFramingMedia | null,
): SkywriteVideoFraming {
  return {
    offsetX: clampFramingOffset(media?.framingOffsetX ?? 0),
    offsetY: clampFramingOffset(media?.framingOffsetY ?? 0),
  };
}

/** Layout for fit (contain) or fill (cover) inside a fixed stage. */
export function computeVideoStageLayout(
  stageWidth: number,
  stageHeight: number,
  aspectRatio: number,
  stageFit: SkywriteVideoStageFit,
): VideoStageLayout {
  const safeW = Math.max(1, stageWidth);
  const safeH = Math.max(1, stageHeight);
  const ratio = aspectRatio > 0 ? aspectRatio : 16 / 9;

  if (stageFit === 'fit') {
    let width = safeW;
    let height = width / ratio;
    if (height > safeH) {
      height = safeH;
      width = height * ratio;
    }
    return {
      stageWidth: safeW,
      stageHeight: safeH,
      videoWidth: width,
      videoHeight: height,
      maxPanX: 0,
      maxPanY: 0,
    };
  }

  let width = safeW;
  let height = width / ratio;
  if (height < safeH) {
    height = safeH;
    width = height * ratio;
  }
  return {
    stageWidth: safeW,
    stageHeight: safeH,
    videoWidth: width,
    videoHeight: height,
    maxPanX: Math.max(0, (width - safeW) / 2),
    maxPanY: Math.max(0, (height - safeH) / 2),
  };
}

export function framingToTranslation(
  framing: SkywriteVideoFraming,
  layout: VideoStageLayout,
): { translateX: number; translateY: number } {
  return {
    translateX: clampFramingOffset(framing.offsetX) * layout.maxPanX,
    translateY: clampFramingOffset(framing.offsetY) * layout.maxPanY,
  };
}

export function translationToFraming(
  translateX: number,
  translateY: number,
  layout: VideoStageLayout,
  options?: { snapToCenter?: boolean },
): SkywriteVideoFraming {
  const offsetX = layout.maxPanX > 0 ? clampFramingOffset(translateX / layout.maxPanX) : 0;
  const offsetY = layout.maxPanY > 0 ? clampFramingOffset(translateY / layout.maxPanY) : 0;
  const framing = { offsetX, offsetY };
  return options?.snapToCenter ? applyFramingSnap(framing) : framing;
}

export function describePanAxes(layout: VideoStageLayout): {
  canPanX: boolean;
  canPanY: boolean;
} {
  return {
    canPanX: layout.maxPanX > 0.5,
    canPanY: layout.maxPanY > 0.5,
  };
}

export function applyFramingSnap(framing: SkywriteVideoFraming): SkywriteVideoFraming {
  return {
    offsetX: Math.abs(framing.offsetX) < SNAP_THRESHOLD ? 0 : framing.offsetX,
    offsetY: Math.abs(framing.offsetY) < SNAP_THRESHOLD ? 0 : framing.offsetY,
  };
}

export function canPanVideoFraming(layout: VideoStageLayout): boolean {
  return layout.maxPanX > 0.5 || layout.maxPanY > 0.5;
}

export function patchVideoFraming(
  video: SkywriteVideoMedia,
  patch: Partial<Pick<SkywriteVideoMedia, 'stageFit' | 'framingOffsetX' | 'framingOffsetY'>>,
): SkywriteVideoMedia {
  return { ...video, ...patch };
}
