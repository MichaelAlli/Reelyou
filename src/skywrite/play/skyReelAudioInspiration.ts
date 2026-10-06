const SKYREEL_AUDIO_INSPIRATION = [
  'Keep becoming.',
  'Your voice matters.',
  'Every step becomes part of the journey.',
  'Something is taking shape.',
  'You’re further than you think.',
  'Keep going.',
  'Your story is still unfolding.',
] as const;

function hashString(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i += 1) {
    h = (h * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/** One stable phrase per skywrite + playback session. */
export function pickSkyReelAudioInspirationPhrase(
  skywriteId: string,
  playSessionId: number,
): string {
  const index =
    hashString(`${skywriteId}:${playSessionId}`) % SKYREEL_AUDIO_INSPIRATION.length;
  return SKYREEL_AUDIO_INSPIRATION[index] ?? SKYREEL_AUDIO_INSPIRATION[0];
}
