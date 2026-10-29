import { isHelloResponse } from '@job-scraper/shared';

import { readAuthToken } from './auth/auth-token';
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

export async function readErrorMessages(response: Response): Promise<string[]> {
  const body: unknown = await response.json().catch(() => null);
  if (typeof body === 'object' && body !== null && 'message' in body) {
    const { message } = body;
    if (typeof message === 'string') {
      return [message];
    }
    if (Array.isArray(message)) {
      return message.filter((item): item is string => typeof item === 'string');
    }
  }
  return ['Something went wrong. Please try again.'];
}

/** Without `token` for public routes, e.g. the job preview. */
export function getFromBackend(
  path: string,
  token?: string,
): Promise<Response> {
  return fetch(new URL(path, getBackendUrl()), {
    headers: token === undefined ? {} : { Authorization: `Bearer ${token}` },
    cache: 'no-store',
    signal: AbortSignal.timeout(BACKEND_TIMEOUT_MS),
  });
}

interface ResponseSchema<T> {
  safeParse(data: unknown): { success: true; data: T } | { success: false };
}

export async function getParsedFromBackend<T>(
  path: string,
  schema: ResponseSchema<T>,
): Promise<T | null> {
  const token = await readAuthToken();
  if (token === undefined) {
    return null;
  }

  try {
    const response = await getFromBackend(path, token);
    if (!response.ok) {
      console.error(
        `GET ${path} failed with status ${String(response.status)}`,
      );
      return null;
    }
    const parsed = schema.safeParse(await response.json());
    if (!parsed.success) {
      console.error(`GET ${path} returned an unexpected response`);
      return null;
    }
    return parsed.data;
  } catch (error) {
    console.error(`GET ${path} failed`, error);
    return null;
  }
}

export function putToBackend(path: string, token: string): Promise<Response> {
  return fetch(new URL(path, getBackendUrl()), {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
    signal: AbortSignal.timeout(BACKEND_TIMEOUT_MS),
  });
}

export function deleteFromBackend(
  path: string,
  token: string,
): Promise<Response> {
  return fetch(new URL(path, getBackendUrl()), {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
    signal: AbortSignal.timeout(BACKEND_TIMEOUT_MS),
  });
}

export function postToBackend(path: string, body: unknown): Promise<Response> {
  return fetch(new URL(path, getBackendUrl()), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
    signal: AbortSignal.timeout(BACKEND_TIMEOUT_MS),
  });
}

export function patchToBackend(
  path: string,
  token: string,
  body: unknown,
): Promise<Response> {
  return fetch(new URL(path, getBackendUrl()), {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
    signal: AbortSignal.timeout(BACKEND_TIMEOUT_MS),
  });
}
