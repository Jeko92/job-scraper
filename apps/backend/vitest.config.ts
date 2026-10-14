import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.spec.ts', 'test/**/*.e2e-spec.ts'],
    env: {
      DATABASE_URL: 'postgres://user:password@localhost/database',
      BCRYPT_SALT_ROUNDS: '12',
      PASSWORD_MIN_LENGTH: '8',
      JWT_SECRET: 'test-secret',
      JWT_EXPIRES_IN: '3600',
      OPENAI_API_KEY: 'test-openai-key',
      COMPANYENRICH_API_URL: 'https://api.companyenrich.com',
      COMPANYENRICH_API_KEY: 'test-companyenrich-key',
      COMPANYENRICH_COMPANIES_PER_CITY: '50',
      COMPANYENRICH_SYNC_CRON: '0 3 * * 1',
      WIKIDATA_SPARQL_URL: 'https://query.wikidata.org/sparql',
      WIKIDATA_USER_AGENT: 'JobScraper/test',
      WIKIDATA_SYNC_CRON: '0 2 * * *',
    },
  },
});
