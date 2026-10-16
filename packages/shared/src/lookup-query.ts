import { z } from 'zod';

export const DEFAULT_LOOKUP_LIMIT = 50;
export const MAX_LOOKUP_LIMIT = 200;

/** Case-insensitive substring filter on the name. */
export const lookupSearchSchema: z.ZodOptional<z.ZodString> = z
  .string()
  .trim()
  .min(1)
  .max(100)
  .optional();

/** Query strings arrive as text, so the limit is coerced to a number. */
export const lookupLimitSchema: z.ZodDefault<z.ZodCoercedNumber> = z.coerce
  .number()
  .int()
  .min(1)
  .max(MAX_LOOKUP_LIMIT)
  .default(DEFAULT_LOOKUP_LIMIT);
