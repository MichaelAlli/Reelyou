import { Platform } from 'react-native';

/** Call synchronously from a user gesture before navigating to SkyReel (web autoplay policy). */
export function primeWebAudioFromUserGesture(): void {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return;
  try {
    const Ctx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (Ctx) {
      const ctx = new Ctx();
      void ctx.resume().finally(() => {
        void ctx.close().catch(() => undefined);
      });
    }
  } catch {
    /* non-blocking */
  }
  try {
    const el = new window.Audio();
    el.volume = 0.001;
    el.muted = true;
    const p = el.play();
    if (p) {
      void p
        .then(() => {
          el.pause();
          el.src = '';
        })
        .catch(() => undefined);
    }
  } catch {
    /* non-blocking */
  }
}
