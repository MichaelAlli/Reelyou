/** Injectable clock for Beta QA — production uses Date.now(). */
let testNowMs: number | null = null;

export function setBeaconTestNow(ms: number | null): void {
  testNowMs = ms;
}

export function beaconNow(): number {
  return testNowMs ?? Date.now();
}
