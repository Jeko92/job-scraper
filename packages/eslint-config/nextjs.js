import { defineConfig } from 'eslint/config';
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

import base from './base.js';

export default defineConfig([
  base,
  nextCoreWebVitals,
  nextTypescript,
  {
    languageOptions: {
      globals: globals.browser,
    },
  },
  prettier,
]);
