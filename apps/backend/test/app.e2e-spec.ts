import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { afterEach, beforeEach, describe, it } from 'vitest';

import { AppModule } from '../src/app.module.js';

describe('GET /', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('responds with the greeting as JSON', async () => {
    await request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Content-Type', /application\/json/)
      .expect({ message: 'hello from backend' });
  });
});
