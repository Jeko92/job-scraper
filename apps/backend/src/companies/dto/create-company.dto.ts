import { z } from 'zod';

export interface CreateCompanyRequest {
  name?: string | null | undefined;
  legalName?: string | null | undefined;
  domain?: string | null | undefined;
  websiteUrl?: string | null | undefined;
  companyType?: string | null | undefined;
  description?: string | null | undefined;
  numberOfEmployees?: number | null | undefined;
  employeeRange?: string | null | undefined;
  foundingYear?: number | null | undefined;
}

export const createCompanySchema: z.ZodType<CreateCompanyRequest> = z.object({
  name: z.string().nullable().optional(),
  legalName: z.string().nullable().optional(),
  domain: z.string().nullable().optional(),
  websiteUrl: z.string().nullable().optional(),
  companyType: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  numberOfEmployees: z.number().int().positive().nullable().optional(),
  employeeRange: z.string().nullable().optional(),
  foundingYear: z.number().int().positive().nullable().optional(),
});
