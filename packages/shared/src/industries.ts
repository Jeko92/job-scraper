import { z } from 'zod';

import { lookupLimitSchema, lookupSearchSchema } from './lookup-query';

export interface Industry {
  id: string;
  name: string;
  slug: string;
}

export const industrySchema: z.ZodType<Industry> = z.object({
  id: z.uuid(),
  name: z.string(),
  slug: z.string(),
});

export const industryListSchema: z.ZodType<Industry[]> =
  z.array(industrySchema);

export interface IndustriesQuery {
  search?: string | undefined;
  limit: number;
}

export const industriesQuerySchema: z.ZodType<IndustriesQuery> = z.object({
  search: lookupSearchSchema,
  limit: lookupLimitSchema,
});
