import type { DataSourceOptions } from 'typeorm';

import { User } from '../users/entities/user.entity.js';

export function createDataSourceOptions(
  databaseUrl: string,
): DataSourceOptions {
  return {
    type: 'postgres',
    url: databaseUrl,
    entities: [User],
    synchronize: false,
  };
}
