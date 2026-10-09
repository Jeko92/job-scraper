import { z } from 'zod';

import type { AiTokenUsage } from './providers/ai-provider.js';

const jsonObjectSchema = z.record(z.string(), z.unknown());

export const supplementRequestSchema = z.object({
  /** JSON whose missing values (`null`, `""` or absent keys) are filled in. */
  data: jsonObjectSchema,
  /** JSON Schema the answer has to match; defaults to the shape of `data`. */
  outputFormat: z
    .object({
      name: z.string().regex(/^[\w-]{1,64}$/),
      schema: jsonObjectSchema,
      description: z.string().optional(),
      strict: z.boolean().optional(),
    })
    .optional(),
  /** Upper limit of generated tokens, including reasoning tokens. */
  maxOutputTokens: z.number().int().min(16).optional(),
  /** Extra hints for the model, e.g. the domain of the data. */
  instructions: z.string().trim().nonempty().optional(),
});

export type SupplementRequest = z.infer<typeof supplementRequestSchema>;

export interface SupplementResponse {
  data: Record<string, unknown>;
  model: string;
  usage: AiTokenUsage;
}
