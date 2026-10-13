import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module.js';
import { appOptions } from './app.options.js';
import type { Env } from './config/env.js';
import { setupSwagger } from './swagger.js';

const app = await NestFactory.create(AppModule, appOptions);
app.enableShutdownHooks();

const config = app.get<ConfigService<Env, true>>(ConfigService);
if (config.get('NODE_ENV', { infer: true }) !== 'production') {
  setupSwagger(app);
}
await app.listen(config.get('PORT', { infer: true }));
