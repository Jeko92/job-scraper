import { z } from 'zod';

export const COMPANY_PROVIDERS = ['wikidata', 'company-enrich'] as const;

export type CompanyProvider = (typeof COMPANY_PROVIDERS)[number];

export interface FetchCompaniesQuery {
  providers: CompanyProvider[];
  mergeResults: boolean;
  saveToDatabase: boolean;
}

/** Accepts `?providers=a,b` as well as `?providers=a&providers=b`. */
function splitProviders(value: unknown): unknown {
  const values = typeof value === 'string' ? [value] : value;
  if (!Array.isArray(values)) {
    return values;
  }
  return values.flatMap((v: unknown) =>
    typeof v === 'string' ? v.split(',').map((p) => p.trim()) : [v],
  );
}

export const fetchCompaniesQuerySchema: z.ZodType<FetchCompaniesQuery> =
  z.object({
    providers: z
      .preprocess(splitProviders, z.array(z.enum(COMPANY_PROVIDERS)).min(1))
      .default([...COMPANY_PROVIDERS]),
    mergeResults: z.stringbool().default(true),
    saveToDatabase: z.stringbool().default(false),
  });
