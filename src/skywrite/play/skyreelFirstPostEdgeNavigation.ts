/** First SkyReel item: left tap restarts; second consecutive left tap exits. */
export type FirstPostLeftTapState = {
  armedForExit: boolean;
};

export function nextFirstPostLeftTapState(
  state: FirstPostLeftTapState,
): 'restart' | 'exit' {
  if (!state.armedForExit) return 'restart';
  return 'exit';
}

export function afterFirstPostLeftRestart(): FirstPostLeftTapState {
  return { armedForExit: true };
}

export function resetFirstPostLeftTapState(): FirstPostLeftTapState {
  return { armedForExit: false };
}
