import base from '@job-scraper/prettier-config' with { type: 'json' };
import * as tailwind from 'prettier-plugin-tailwindcss';

/** @type {import('prettier').Config} */
const config = {
  ...base,
  plugins: [tailwind],
  tailwindStylesheet: './src/app/globals.css',
};

export default config;
