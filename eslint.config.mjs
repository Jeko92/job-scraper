import base from '@job-scraper/eslint-config';
import { defineConfig } from 'eslint/config';
import globals from 'globals';

export default defineConfig([
  base,
  {
    languageOptions: {
      globals: globals.node,
    },
  },
]);
