import { Module } from '@nestjs/common';

import { AiProvider } from './ai-provider.js';
import { OpenAiProvider } from './openai.provider.js';

/**
 * Shares the configured `AiProvider` with every feature module that imports
 * it. Swap `useClass` to change the vendor for the whole backend.
 */
@Module({
  providers: [{ provide: AiProvider, useClass: OpenAiProvider }],
  exports: [AiProvider],
})
export class AiProviderModule {}
