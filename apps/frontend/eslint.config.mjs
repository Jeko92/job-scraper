import nextjs from '@job-scraper/eslint-config/nextjs';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['.next/**', 'next-env.d.ts', 'src/components/ui/**']),
  nextjs,
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
]);
