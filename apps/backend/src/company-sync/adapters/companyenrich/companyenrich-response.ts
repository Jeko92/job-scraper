import { z } from 'zod';

const named = z.object({ name: z.string() }).nullish();

export const companyInfoSchema = z.object({
  id: z.string(),
  name: z.string().nullish(),
  legalName: z.string().nullish(),
  domain: z.string().nullish(),
  website: z.string().nullish(),
  type: z.string().nullish(),
  description: z.string().nullish(),
  employees: z.string().nullish(),
  founded_year: z.number().int().nullish(),
  industries: z.array(z.string()).nullish(),
  technologies: z.array(z.string()).nullish(),
  location: z
    .object({
      country: z.object({ code: z.string(), name: z.string() }).nullish(),
      state: named,
      city: named,
      postal_code: z.string().nullish(),
    })
    .nullish(),
});

export const companySearchResponseSchema = z.object({
  items: z.array(z.unknown()),
});

export const companySearchBatchSchema = z.object({
  city: z.string(),
  response: companySearchResponseSchema,
});

export const companyCountResponseSchema = z.object({
  total: z.number().int().nonnegative(),
});

export const citySearchResponseSchema = z.object({
  items: z.array(z.object({ id: z.number().int(), name: z.string() })),
});

export type CompanyInfo = z.infer<typeof companyInfoSchema>;

export const companySearchConfigSchema = z.object({
  naics_codes: z.array(z.number().int().positive()).nonempty(),
  employee_groups: z
    .array(
      z
        .array(
          z.enum([
            '1-10',
            '11-50',
            '51-200',
            '201-500',
            '501-1K',
            '1K-5K',
            '5K-10K',
            'over-10K',
          ]),
        )
        .nonempty(),
    )
    .nonempty(),
});
