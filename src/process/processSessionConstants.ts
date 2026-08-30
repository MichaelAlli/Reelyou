/** Progress animation duration — real processing timeline */
export const PROCESS_SESSION_DURATION_MS = 8000;

/** Minimum time the StarPath experience stays visible before exit */
export const PROCESS_MIN_DISPLAY_MS = 8000;

/** Hold completed state before navigation */
export const PROCESS_COMPLETION_LINGER_MS = 1000;

export const PROCESS_INTRO_MS = {
  headerFade: 500,
  starInStart: 500,
  starInEnd: 1200,
  nodesStart: 1200,
  nodesEnd: 2200,
  linesStart: 2200,
  linesEnd: 3200,
  footerIn: 3200,
  total: 3200,
} as const;
