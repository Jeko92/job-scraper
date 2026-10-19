import { z } from 'zod';

import { type Location, locationSchema } from './locations';
import {
  type EmploymentType,
  employmentTypeSchema,
  type RemotePreference,
  remotePreferenceSchema,
} from './user-profile';

export const DEFAULT_JOBS_LIMIT = 20;
export const MAX_JOBS_LIMIT = 100;
const MAX_FILTER_VALUES = 20;

export const JOB_SORTS = ['newest', 'salary'] as const;
export type JobSort = (typeof JOB_SORTS)[number];
export const jobSortSchema: z.ZodType<JobSort> = z.enum(JOB_SORTS);

// --- List item ------------------------------------------------------------

export interface JobCompany {
  id: string;
  name: string | null;
  domain: string | null;
}

export interface JobSkill {
  id: string;
  name: string;
  slug: string;
  required: boolean;
}

export interface JobListItem {
  id: string;
  title: string;
  company: JobCompany;
  location: Location | null;
  workplaceType: RemotePreference | null;
  employmentType: EmploymentType | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
  /** Published date, or first-seen date when the source has none. */
  postedAt: string;
  /** Ordered by name. */
  skills: JobSkill[];
}

export const jobListItemSchema: z.ZodType<JobListItem> = z.object({
  id: z.uuid(),
  title: z.string(),
  company: z.object({
    id: z.uuid(),
    name: z.string().nullable(),
    domain: z.string().nullable(),
  }),
  location: locationSchema.nullable(),
  workplaceType: remotePreferenceSchema.nullable(),
  employmentType: employmentTypeSchema.nullable(),
  salaryMin: z.number().nullable(),
  salaryMax: z.number().nullable(),
  salaryCurrency: z.string().nullable(),
  postedAt: z.iso.datetime(),
  skills: z.array(
    z.object({
      id: z.uuid(),
      name: z.string(),
      slug: z.string(),
      required: z.boolean(),
    }),
  ),
});

// Job detail (#39) goes here.

// --- List response --------------------------------------------------------

export interface JobsListResponse {
  items: JobListItem[];
  /** Matches for the filters, ignoring the cursor. */
  total: number;
  /** Opaque; pass it as `cursor` for the next page. null at the end. */
  nextCursor: string | null;
}

export const jobsListResponseSchema: z.ZodType<JobsListResponse> = z.object({
  items: z.array(jobListItemSchema),
  total: z.number().int().min(0),
  nextCursor: z.string().nullable(),
});

// --- Query ----------------------------------------------------------------

/** Every filter is optional; values within one filter are OR-ed. */
export interface JobsQuery {
  workplaceType?: RemotePreference[] | undefined;
  employmentType?: EmploymentType[] | undefined;
  locationId?: string[] | undefined;
  /** Industry slugs of the company. */
  industry?: string[] | undefined;
  /** Skill slugs. */
  skill?: string[] | undefined;
  postedWithinDays?: number | undefined;
  /** Matches jobs whose top salary reaches this value. */
  salaryMin?: number | undefined;
  sort: JobSort;
  limit: number;
  cursor?: string | undefined;
}

/** `?a=1` arrives as a string and `?a=1&a=2` as an array. */
function queryArray<T>(item: z.ZodType<T>) {
  return z
    .preprocess(
      (value) => (typeof value === 'string' ? [value] : value),
      z.array(item).min(1).max(MAX_FILTER_VALUES),
    )
    .optional();
}

const slugSchema = z.string().trim().nonempty();

export const jobsQuerySchema: z.ZodType<JobsQuery> = z.object({
  workplaceType: queryArray(remotePreferenceSchema),
  employmentType: queryArray(employmentTypeSchema),
  locationId: queryArray(z.uuid()),
  industry: queryArray(slugSchema),
  skill: queryArray(slugSchema),
  postedWithinDays: z.coerce.number().int().min(1).max(365).optional(),
  salaryMin: z.coerce.number().min(0).optional(),
  sort: jobSortSchema.default('newest'),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(MAX_JOBS_LIMIT)
    .default(DEFAULT_JOBS_LIMIT),
  cursor: z.string().nonempty().optional(),
});
