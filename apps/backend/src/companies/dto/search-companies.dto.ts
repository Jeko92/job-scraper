import { z } from 'zod';

import type { CompanySearchParams } from '../providers/company-data-provider.js';

const MAX_SEARCH_LIMIT = 100;
const DEFAULT_SEARCH_LIMIT = 20;

/** Search params in a JSON body; null values are dropped. */
export const companySearchBodySchema: z.ZodType<CompanySearchParams> = z
  .object({
    query: z.string().nullable().optional(),
    location: z.string().nullable().optional(),
    industry: z.string().nullable().optional(),
    minEmployees: z.number().int().positive().nullable().optional(),
    maxEmployees: z.number().int().positive().nullable().optional(),
    foundedAfter: z.number().int().positive().nullable().optional(),
    foundedBefore: z.number().int().positive().nullable().optional(),
    limit: z
      .number()
      .int()
      .positive()
      .max(MAX_SEARCH_LIMIT)
      .default(DEFAULT_SEARCH_LIMIT),
    offset: z.number().int().nonnegative().default(0),
  })
  .transform((params) => ({
    query: params.query ?? undefined,
    location: params.location ?? undefined,
    industry: params.industry ?? undefined,
    minEmployees: params.minEmployees ?? undefined,
    maxEmployees: params.maxEmployees ?? undefined,
    foundedAfter: params.foundedAfter ?? undefined,
    foundedBefore: params.foundedBefore ?? undefined,
    limit: params.limit,
    offset: params.offset,
  }));

/** Search params in a query string, where numbers arrive as strings. */
export const companySearchQuerySchema: z.ZodType<CompanySearchParams> =
  z.object({
    query: z.string().optional(),
    location: z.string().optional(),
    industry: z.string().optional(),
    minEmployees: z.coerce.number().int().positive().optional(),
    maxEmployees: z.coerce.number().int().positive().optional(),
    foundedAfter: z.coerce.number().int().positive().optional(),
    foundedBefore: z.coerce.number().int().positive().optional(),
    limit: z.coerce
      .number()
      .int()
      .positive()
      .max(MAX_SEARCH_LIMIT)
      .default(DEFAULT_SEARCH_LIMIT),
    offset: z.coerce.number().int().nonnegative().default(0),
  });
