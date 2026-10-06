import { isHelloResponse } from '@job-scraper/shared';

import { getBackendUrl } from './env';

export const BACKEND_TIMEOUT_MS = 3000;

export async function fetchBackendGreeting(): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, BACKEND_TIMEOUT_MS);

  try {
    const url = new URL('/', getBackendUrl()).toString();
    const response = await fetch(url, {
      cache: 'no-store',
      signal: controller.signal,
    });
    if (!response.ok) {
      return null;
    }
    const body: unknown = await response.json();
    return isHelloResponse(body) ? body.message : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
