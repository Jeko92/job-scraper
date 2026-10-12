import {
  BadGatewayException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';

import { AiProvider } from './providers/ai-provider.js';
import type {
  SupplementRequest,
  SupplementResponse,
} from './supplement-request.js';

const SUPPLEMENT_INSTRUCTIONS = [
  'You complete JSON objects.',
  'A value is missing when it is null, an empty string, or a key required by the output format is absent.',
  'Fill in every missing value with the actual and factual value.',
  'Never change values that are already present.',
  'If a value cannot be determined, keep it null.',
  'Answer with the completed JSON object only.',
].join(' ');

@Injectable()
export class AiService {
  constructor(private readonly provider: AiProvider) {}

  async supplement(request: SupplementRequest): Promise<SupplementResponse> {
    const result = await this.provider
      .generateJson({
        instructions: request.instructions
          ? `${SUPPLEMENT_INSTRUCTIONS}\n\n${request.instructions}`
          : SUPPLEMENT_INSTRUCTIONS,
        input: JSON.stringify(request.data),
        outputFormat: request.outputFormat,
        maxOutputTokens: request.maxOutputTokens,
      })
      .catch((error: unknown) => {
        throw new BadGatewayException('AI request failed', { cause: error });
      });

    if (result.truncated) {
      throw new UnprocessableEntityException(
        'AI response was cut off; raise maxOutputTokens',
      );
    }

    return {
      data: parseObject(result.text),
      model: result.model,
      usage: result.usage,
    };
  }
}

function parseObject(text: string): Record<string, unknown> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    throw new BadGatewayException('AI returned invalid JSON', {
      cause: error,
    });
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new BadGatewayException('AI did not return a JSON object');
  }
  return parsed as Record<string, unknown>;
}
