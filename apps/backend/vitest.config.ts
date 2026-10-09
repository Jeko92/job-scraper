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
    },
  },
});
