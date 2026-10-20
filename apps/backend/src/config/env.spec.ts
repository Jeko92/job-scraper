import { describe, expect, it } from 'vitest';

import { envSchema } from './env.js';

const required = {
  DATABASE_URL: 'postgres://user:password@localhost/database',
  BCRYPT_SALT_ROUNDS: '10',
  PASSWORD_MIN_LENGTH: '8',
  JWT_SECRET: 'test-secret',
  JWT_EXPIRES_IN: '3600',
  OPENAI_API_KEY: 'test-openai-key',
  COMPANYENRICH_API_KEY: 'test-companyenrich-key',
  COMPANYENRICH_API_URL: 'https://api.companyenrich.com/',
  WIKIDATA_API_URL: 'https://query.wikidata.org/sparql',
};

describe('envSchema', () => {
  it('applies defaults when variables are missing', () => {
    expect(envSchema.parse(required)).toEqual({
      NODE_ENV: 'development',
      PORT: 3030,
      DATABASE_URL: required.DATABASE_URL,
      BCRYPT_SALT_ROUNDS: 10,
      PASSWORD_MIN_LENGTH: 8,
      JWT_SECRET: required.JWT_SECRET,
      JWT_EXPIRES_IN: 3600,
      OPENAI_API_KEY: required.OPENAI_API_KEY,
      OPENAI_MODEL: 'gpt-5-mini',
      COMPANYENRICH_API_KEY: required.COMPANYENRICH_API_KEY,
      COMPANYENRICH_API_URL: required.COMPANYENRICH_API_URL,
      WIKIDATA_API_URL: required.WIKIDATA_API_URL,
    });
  });

  it('coerces PORT from a string', () => {
    expect(envSchema.parse({ ...required, PORT: '4000' }).PORT).toBe(4000);
  });

  it.each(['abc', '', '0', '70000', '3.5'])('rejects PORT=%j', (port) => {
    expect(() => envSchema.parse({ ...required, PORT: port })).toThrow();
  });

  it('rejects an unknown NODE_ENV', () => {
    expect(() =>
      envSchema.parse({ ...required, NODE_ENV: 'staging' }),
    ).toThrow();
  });
});
