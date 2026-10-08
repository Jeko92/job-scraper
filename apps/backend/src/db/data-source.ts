import { join } from 'node:path';

import { DataSource } from 'typeorm';

import { envSchema } from '../config/env.js';
import { createDataSourceOptions } from './data-source.options.js';

const { DATABASE_URL } = envSchema
  .pick({ DATABASE_URL: true })
  .parse(process.env);

export default new DataSource({
  ...createDataSourceOptions(DATABASE_URL),
  migrations: [join(import.meta.dirname, 'migrations', '*.js')],
});
