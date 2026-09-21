/** Dev-only signals for edge navigation QA — no UI. */
export function logSpatialFocusLeftEdgeTap(): void {
  if (__DEV__) {
    console.log('LEFT_EDGE_TAP');
  }
}

export function logSpatialFocusRightEdgeTap(): void {
  if (__DEV__) {
    console.log('RIGHT_EDGE_TAP');
  }
}

export function logSpatialFocusTarget(id: string | null): void {
  if (__DEV__) {
    console.log('FOCUS_TARGET_ID', id ?? 'none');
  }
}
