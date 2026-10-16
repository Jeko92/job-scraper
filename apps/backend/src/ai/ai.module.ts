import { Module } from '@nestjs/common';

import { AiController } from './ai.controller.js';
import { AiService } from './ai.service.js';
import { AiProvider } from './providers/ai-provider.js';
import { OpenAiProvider } from './providers/openai.provider.js';

@Module({
  controllers: [AiController],
  providers: [AiService, { provide: AiProvider, useClass: OpenAiProvider }],
  exports: [AiService],
})
export class AiModule {}
