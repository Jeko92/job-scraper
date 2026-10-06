import type { Server } from 'node:http';
import { createConnection } from 'node:net';

import { NestFactory } from '@nestjs/core';
import { describe, expect, it } from 'vitest';

import { AppModule } from '../src/app.module.js';
import { appOptions } from '../src/app.options.js';

describe('shutdown', () => {
  it('closes promptly while a client holds an idle connection', async () => {
    const app = await NestFactory.create(AppModule, {
      ...appOptions,
      logger: false,
    });
    await app.listen(0, '127.0.0.1');
    const port = Number(new URL(await app.getUrl()).port);
    const server = app.getHttpServer() as Server;

    const accepted = new Promise<void>((resolve) => {
      server.once('connection', () => {
        resolve();
      });
    });
    const socket = createConnection({ host: '127.0.0.1', port });
    await accepted;

    const startedAt = Date.now();
    await app.close();
    socket.destroy();

    expect(Date.now() - startedAt).toBeLessThan(1000);
  }, 5000);
});
