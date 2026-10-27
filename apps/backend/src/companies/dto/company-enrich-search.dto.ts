import { z } from 'zod';

const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 20;

export const COMPANY_EMPLOYEES = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '501-1K',
  '1K-5K',
  '5K-10K',
  'over-10K',
] as const;

export type CompanyEmployees = (typeof COMPANY_EMPLOYEES)[number];

const yearSchema = z.number().int().positive();

export const companyEnrichSearchSchema = z.object({
  query: z.string().optional(),
  location: z
    .object({
      country: z.string().length(2).toUpperCase().optional(),
      state: z.string().optional(),
      city: z.string().optional(),
    })
    .optional(),
  industries: z.array(z.string()).optional(),
  employees: z.array(z.enum(COMPANY_EMPLOYEES)).optional(),
  foundedYear: z
    .object({ min: yearSchema.optional(), max: yearSchema.optional() })
    .optional(),
  page: z.number().int().positive().default(1),
  pageSize: z
    .number()
    .int()
    .positive()
    .max(MAX_PAGE_SIZE)
    .default(DEFAULT_PAGE_SIZE),
});

export type CompanyEnrichSearchRequest = z.infer<
  typeof companyEnrichSearchSchema
>;
