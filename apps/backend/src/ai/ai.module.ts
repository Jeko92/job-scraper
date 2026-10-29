import { Module } from '@nestjs/common';

import { AiProviderModule } from '../common/ai/ai-provider.module.js';
import { AiController } from './ai.controller.js';
import { AiService } from './ai.service.js';

@Module({
  imports: [AiProviderModule],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
