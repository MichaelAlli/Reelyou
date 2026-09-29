import { useCallback, useEffect, useRef } from 'react';
import { Platform } from 'react-native';

import type { VideoStageLayout } from '@/skywrite/media/skywriteVideoFraming';

interface UseSkywriteFramingPointerDragOptions {
  enabled: boolean;
  layout: VideoStageLayout;
  translateX: number;
  translateY: number;
  onLiveTranslate: (x: number, y: number) => void;
  onCommit: (x: number, y: number) => void;
}

function clampAxis(value: number, maxPan: number): number {
  if (maxPan <= 0) return 0;
  return Math.max(-maxPan, Math.min(maxPan, value));
}

/** Reliable drag on web (mouse + emulated touch) and native pointer capture. */
export function useSkywriteFramingPointerDrag({
  enabled,
  layout,
  translateX,
  translateY,
  onLiveTranslate,
  onCommit,
}: UseSkywriteFramingPointerDragOptions) {
  const draggingRef = useRef(false);
  const startRef = useRef({ pointerX: 0, pointerY: 0, baseX: 0, baseY: 0 });
  const translateRef = useRef({ x: translateX, y: translateY });
  const layoutRef = useRef(layout);
  const enabledRef = useRef(enabled);

  translateRef.current = { x: translateX, y: translateY };
  layoutRef.current = layout;
  enabledRef.current = enabled;

  const applyDelta = useCallback(
    (dx: number, dy: number, baseX: number, baseY: number) => {
      const { maxPanX, maxPanY } = layoutRef.current;
      const x = clampAxis(baseX + dx, maxPanX);
      const y = clampAxis(baseY + dy, maxPanY);
      onLiveTranslate(x, y);
      return { x, y };
    },
    [onLiveTranslate],
  );

  const endDrag = useCallback(
    (finalX: number, finalY: number) => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      onCommit(finalX, finalY);
    },
    [onCommit],
  );

  const onPointerDown = useCallback(
    (event: { nativeEvent: { pageX: number; pageY: number; pointerId?: number }; preventDefault?: () => void; currentTarget?: unknown }) => {
      if (!enabledRef.current) return;
      event.preventDefault?.();
      draggingRef.current = true;
      startRef.current = {
        pointerX: event.nativeEvent.pageX,
        pointerY: event.nativeEvent.pageY,
        baseX: translateRef.current.x,
        baseY: translateRef.current.y,
      };
      const target = event.currentTarget as HTMLElement | undefined;
      if (Platform.OS === 'web' && target?.setPointerCapture && event.nativeEvent.pointerId != null) {
        try {
          target.setPointerCapture(event.nativeEvent.pointerId);
        } catch {
          /* ignore */
        }
      }
    },
    [],
  );

  const onPointerMove = useCallback(
    (event: { nativeEvent: { pageX: number; pageY: number }; preventDefault?: () => void }) => {
      if (!draggingRef.current || !enabledRef.current) return;
      event.preventDefault?.();
      const dx = event.nativeEvent.pageX - startRef.current.pointerX;
      const dy = event.nativeEvent.pageY - startRef.current.pointerY;
      applyDelta(dx, dy, startRef.current.baseX, startRef.current.baseY);
    },
    [applyDelta],
  );

  const onPointerUp = useCallback(
    (event: { nativeEvent: { pageX: number; pageY: number }; preventDefault?: () => void }) => {
      if (!draggingRef.current) return;
      event.preventDefault?.();
      const dx = event.nativeEvent.pageX - startRef.current.pointerX;
      const dy = event.nativeEvent.pageY - startRef.current.pointerY;
      const { x, y } = applyDelta(dx, dy, startRef.current.baseX, startRef.current.baseY);
      endDrag(x, y);
    },
    [applyDelta, endDrag],
  );

  useEffect(() => {
    if (Platform.OS !== 'web' || !enabled) return undefined;
    const previousOverflow = document.body.style.overflow;
    const previousTouchAction = document.body.style.touchAction;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.touchAction = previousTouchAction;
    };
  }, [enabled]);

  return {
    dragging: draggingRef,
    pointerHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
    },
  };
}
