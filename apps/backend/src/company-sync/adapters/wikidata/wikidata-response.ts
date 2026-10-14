import { z } from 'zod';

const binding = z.object({ value: z.string() });

export const wikidataResponseSchema = z.object({
  results: z.object({
    bindings: z.array(
      z.object({
        company: binding,
        companyLabel: binding,
        hqLabel: binding.optional(),
        officialWebsite: binding.optional(),
        foundedDate: binding.optional(),
        employeeCount: binding.optional(),
      }),
    ),
  }),
});

export type WikidataBinding = z.infer<
  typeof wikidataResponseSchema
>['results']['bindings'][number];
