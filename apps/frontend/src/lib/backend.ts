import { isHelloResponse } from '@job-scraper/shared';

import { getBackendUrl } from './env';

export async function fetchBackendGreeting(): Promise<string | null> {
  try {
    const url = new URL('/', getBackendUrl()).toString();
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
      return null;
    }
    const body: unknown = await response.json();
    return isHelloResponse(body) ? body.message : null;
  } catch {
    return null;
  }
}
