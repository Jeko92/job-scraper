import type { UserConfig } from 'tsdown';

const config: UserConfig = {
  entry: ['src/index.ts'],
  format: 'esm',
  platform: 'neutral',
  dts: true,
  fixedExtension: false,
  clean: true,
};

export default config;
