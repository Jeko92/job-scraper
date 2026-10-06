import { describe, expect, it } from 'vitest';

import { envSchema } from './env.js';

describe('envSchema', () => {
  it('applies defaults when variables are missing', () => {
    expect(envSchema.parse({})).toEqual({
      NODE_ENV: 'development',
      PORT: 3030,
    });
  });

  it('coerces PORT from a string', () => {
    expect(envSchema.parse({ PORT: '4000' }).PORT).toBe(4000);
  });

  it.each(['abc', '', '0', '70000', '3.5'])('rejects PORT=%j', (port) => {
    expect(() => envSchema.parse({ PORT: port })).toThrow();
  });

  it('rejects an unknown NODE_ENV', () => {
    expect(() => envSchema.parse({ NODE_ENV: 'staging' })).toThrow();
  });
});
