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

export const citySearchResponseSchema = z.object({
  items: z.array(z.object({ id: z.number().int(), name: z.string() })),
});

export const targetCitiesSchema = z.array(
  z.object({ city: z.string(), postal_code: z.string() }),
);

export type CompanyInfo = z.infer<typeof companyInfoSchema>;
