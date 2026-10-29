import {
  type EmploymentType,
  employmentTypeSchema,
  type RemotePreference,
  remotePreferenceSchema,
} from '@job-scraper/shared';
import { z } from 'zod';

const TITLE_MAX_LENGTH = 255;
const SOURCE_URL_MAX_LENGTH = 2048;
const EXTERNAL_ID_MAX_LENGTH = 255;
const CURRENCY_LENGTH = 3;
export const MAX_JOB_SKILLS = 100;

export interface JobSkillInput {
  slug: string;
  required?: boolean | undefined;
}

export interface CreateJobRequest {
  companyId: string;
  title: string;
  sourceUrl: string;
  description?: string | null | undefined;
  externalId?: string | null | undefined;
  locationId?: string | null | undefined;
  employmentType?: EmploymentType | null | undefined;
  workplaceType?: RemotePreference | null | undefined;
  salaryMin?: number | null | undefined;
  salaryMax?: number | null | undefined;
  salaryCurrency?: string | null | undefined;
  publishedAt?: string | null | undefined;
  skills?: JobSkillInput[] | undefined;
}

export const jobFieldsSchema = z.object({
  companyId: z.uuid(),
  title: z.string().trim().nonempty().max(TITLE_MAX_LENGTH),
  sourceUrl: z.url().max(SOURCE_URL_MAX_LENGTH),
  description: z.string().trim().nullable().optional(),
  externalId: z
    .string()
    .trim()
    .nonempty()
    .max(EXTERNAL_ID_MAX_LENGTH)
    .nullable()
    .optional(),
  locationId: z.uuid().nullable().optional(),
  employmentType: employmentTypeSchema.nullable().optional(),
  workplaceType: remotePreferenceSchema.nullable().optional(),
  salaryMin: z.number().min(0).nullable().optional(),
  salaryMax: z.number().min(0).nullable().optional(),
  salaryCurrency: z
    .string()
    .trim()
    .length(CURRENCY_LENGTH)
    .toUpperCase()
    .nullable()
    .optional(),
  publishedAt: z.iso.datetime({ offset: true }).nullable().optional(),
  skills: z
    .array(
      z.object({
        slug: z.string().trim().nonempty(),
        required: z.boolean().optional(),
      }),
    )
    .max(MAX_JOB_SKILLS)
    .refine(
      (skills) =>
        new Set(skills.map(({ slug }) => slug)).size === skills.length,
      { message: 'Skills must be unique' },
    )
    .optional(),
});

export function salaryRangeIsValid(input: {
  salaryMin?: number | null | undefined;
  salaryMax?: number | null | undefined;
}): boolean {
  return (
    input.salaryMin === null ||
    input.salaryMin === undefined ||
    input.salaryMax === null ||
    input.salaryMax === undefined ||
    input.salaryMin <= input.salaryMax
  );
}

export const createJobSchema: z.ZodType<CreateJobRequest> =
  jobFieldsSchema.refine(salaryRangeIsValid, {
    message: 'salaryMin must not be greater than salaryMax',
    path: ['salaryMin'],
  });
