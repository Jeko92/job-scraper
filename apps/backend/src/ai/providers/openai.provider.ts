import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import type { ResponseFormatTextConfig } from 'openai/resources/responses/responses.js';

import type { Env } from '../../config/env.js';
import {
  type AiJsonRequest,
  type AiJsonResult,
  type AiOutputFormat,
  AiProvider,
} from './ai-provider.js';

@Injectable()
export class OpenAiProvider extends AiProvider {
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(config: ConfigService<Env, true>) {
    super();
    this.client = new OpenAI({
      apiKey: config.get('OPENAI_API_KEY', { infer: true }),
    });
    this.model = config.get('OPENAI_MODEL', { infer: true });
  }

  async generateJson(request: AiJsonRequest): Promise<AiJsonResult> {
    const response = await this.client.responses.create({
      model: this.model,
      instructions: request.instructions,
      input: request.input,
      text: { format: toTextFormat(request.outputFormat) },
      ...(request.maxOutputTokens !== undefined && {
        max_output_tokens: request.maxOutputTokens,
      }),
    });

    return {
      text: response.output_text,
      model: response.model,
      usage: {
        inputTokens: response.usage?.input_tokens ?? 0,
        outputTokens: response.usage?.output_tokens ?? 0,
        totalTokens: response.usage?.total_tokens ?? 0,
      },
      truncated: response.status === 'incomplete',
    };
  }
}

function toTextFormat(
  outputFormat: AiOutputFormat | undefined,
): ResponseFormatTextConfig {
  if (!outputFormat) {
    return { type: 'json_object' };
  }
  return {
    type: 'json_schema',
    name: outputFormat.name,
    schema: outputFormat.schema,
    strict: outputFormat.strict ?? false,
    ...(outputFormat.description !== undefined && {
      description: outputFormat.description,
    }),
  };
}
