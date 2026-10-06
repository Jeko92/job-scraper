// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';

import { BACKEND_TIMEOUT_MS, fetchBackendGreeting } from './backend';

function stubFetch(response: () => Promise<Response>) {
  const fetchMock = vi.fn(response);
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('fetchBackendGreeting', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('returns the message from a valid backend response', async () => {
    stubFetch(() =>
      Promise.resolve(Response.json({ message: 'hello from backend' })),
    );
    await expect(fetchBackendGreeting()).resolves.toBe('hello from backend');
  });

  it('calls the default backend URL when BACKEND_URL is unset', async () => {
    vi.stubEnv('BACKEND_URL', undefined);
    const fetchMock = stubFetch(() =>
      Promise.resolve(Response.json({ message: 'x' })),
    );
    await fetchBackendGreeting();
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3030/',
      expect.objectContaining({ cache: 'no-store' }),
    );
  });

  it.each(['http://backend.test:9999', 'http://backend.test:9999/'])(
    'calls the root of BACKEND_URL=%s exactly once-slashed',
    async (backendUrl) => {
      vi.stubEnv('BACKEND_URL', backendUrl);
      const fetchMock = stubFetch(() =>
        Promise.resolve(Response.json({ message: 'x' })),
      );
      await fetchBackendGreeting();
      expect(fetchMock).toHaveBeenCalledWith(
        'http://backend.test:9999/',
        expect.objectContaining({ cache: 'no-store' }),
      );
    },
  );

  it('returns null on an error status', async () => {
    stubFetch(() => Promise.resolve(new Response('boom', { status: 500 })));
    await expect(fetchBackendGreeting()).resolves.toBeNull();
  });

  it('returns null when the body has an unexpected shape', async () => {
    stubFetch(() => Promise.resolve(Response.json({ msg: 'hi' })));
    await expect(fetchBackendGreeting()).resolves.toBeNull();
  });

  it('returns null when the body is not JSON', async () => {
    stubFetch(() => Promise.resolve(new Response('<html></html>')));
    await expect(fetchBackendGreeting()).resolves.toBeNull();
  });

  it('returns null when the backend is unreachable', async () => {
    stubFetch(() => Promise.reject(new TypeError('fetch failed')));
    await expect(fetchBackendGreeting()).resolves.toBeNull();
  });

  it('returns null when the backend does not answer within the timeout', async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_url: string, init?: RequestInit) =>
          new Promise<Response>((_resolve, reject) => {
            init?.signal?.addEventListener('abort', () => {
              reject(new DOMException('aborted', 'AbortError'));
            });
          }),
      ),
    );
    const result = fetchBackendGreeting();
    await vi.advanceTimersByTimeAsync(BACKEND_TIMEOUT_MS);
    await expect(result).resolves.toBeNull();
  });
});
