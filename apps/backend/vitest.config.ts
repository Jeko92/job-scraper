import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.spec.ts', 'test/**/*.e2e-spec.ts'],
    env: {
      DATABASE_URL: 'postgres://user:password@localhost/database',
      BCRYPT_SALT_ROUNDS: '12',
    },
  },
});
