import { createRegisterRequestSchema } from '@job-scraper/shared';
import {
  type ArgumentMetadata,
  Injectable,
  StandardSchemaValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { Env } from '../config/env.js';

@Injectable()
export class RegisterRequestPipe extends StandardSchemaValidationPipe {
  private readonly schema: ReturnType<typeof createRegisterRequestSchema>;

  constructor(config: ConfigService<Env, true>) {
    super();
    this.schema = createRegisterRequestSchema(
      config.get('PASSWORD_MIN_LENGTH', { infer: true }),
    );
  }

  override transform<T>(value: T, metadata: ArgumentMetadata): Promise<T> {
    return super.transform(value, { ...metadata, schema: this.schema });
  }
}
