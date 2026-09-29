import { config } from './config.js';

export async function verifyUrlReachable(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), config.resources.linkVerifyTimeoutMs);
    const res = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'User-Agent': 'ReelyouStarpathBot/1.0 (+https://reellyou.app)' },
    });
    clearTimeout(timer);
    return res.status >= 200 && res.status < 400;
  } catch {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), config.resources.linkVerifyTimeoutMs);
      const res = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal,
        headers: { 'User-Agent': 'ReelyouStarpathBot/1.0 (+https://reellyou.app)' },
      });
      clearTimeout(timer);
      return res.status >= 200 && res.status < 400;
    } catch {
      return false;
    }
  }
}
