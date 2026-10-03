export class FetchTimeoutError extends Error {
  constructor(message = 'fetch_timeout') {
    super(message);
    this.name = 'FetchTimeoutError';
  }
}

export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit & { timeoutMs?: number } = {},
): Promise<Response> {
  const { timeoutMs = 90_000, ...rest } = init;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...rest, signal: controller.signal });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new FetchTimeoutError();
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
