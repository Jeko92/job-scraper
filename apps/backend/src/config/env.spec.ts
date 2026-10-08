import { describe, expect, it } from 'vitest';

import { envSchema } from './env.js';

const DATABASE_URL = 'postgres://user:password@localhost/database';

describe('envSchema', () => {
  it('applies defaults when variables are missing', () => {
    expect(envSchema.parse({ DATABASE_URL })).toEqual({
      NODE_ENV: 'development',
      PORT: 3030,
      DATABASE_URL,
    });
  });

  it('coerces PORT from a string', () => {
    expect(envSchema.parse({ DATABASE_URL, PORT: '4000' }).PORT).toBe(4000);
  });

  it.each(['abc', '', '0', '70000', '3.5'])('rejects PORT=%j', (port) => {
    expect(() => envSchema.parse({ DATABASE_URL, PORT: port })).toThrow();
  });

  it('rejects an unknown NODE_ENV', () => {
    expect(() =>
      envSchema.parse({ DATABASE_URL, NODE_ENV: 'staging' }),
    ).toThrow();
  });
});
