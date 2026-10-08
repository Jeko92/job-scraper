import type { Server } from 'node:http';
import { createConnection } from 'node:net';

import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { describe, expect, it } from 'vitest';

import { AppModule } from '../src/app.module.js';
import { appOptions } from '../src/app.options.js';

describe('shutdown', () => {
  it('closes promptly while a client holds an idle connection', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DataSource)
      .useValue({})
      .compile();
    const app = moduleRef.createNestApplication({
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
