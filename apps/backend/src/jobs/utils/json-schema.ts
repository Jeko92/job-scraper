import type { AiOutputFormat } from '../../common/ai/ai-provider.js';

export const nullable = (
  type: string,
  extra: Record<string, unknown> = {},
) => ({
  type: [type, 'null'],
  ...extra,
});

export const strictFormat = (
  name: string,
  properties: Record<string, unknown>,
): AiOutputFormat => ({
  name,
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    required: Object.keys(properties),
    properties,
  },
});
