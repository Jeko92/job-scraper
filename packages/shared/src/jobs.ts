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
/** Most values per list filter, e.g. skills or locations. */
export const MAX_FILTER_VALUES = 10;

/** `bestMatch`: highest match first; jobs without a match last, newest first. */
export const JOB_SORTS = ['newest', 'oldest', 'bestMatch'] as const;
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
  /** Whether the current user has saved this job. */
  isSaved: boolean;
  /**
   * How well the job fits the current user's profile, 0–100. Null when no
   * match has been calculated (e.g. the profile has no preferences).
   */
  match: number | null;
}

export const jobCompanySchema: z.ZodType<JobCompany> = z.object({
  id: z.uuid(),
  name: z.string().nullable(),
  domain: z.string().nullable(),
});

const jobListItemObject = z.object({
  id: z.uuid(),
  title: z.string(),
  company: jobCompanySchema,
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
  isSaved: z.boolean(),
  match: z.number().int().min(0).max(100).nullable(),
});

export const jobListItemSchema: z.ZodType<JobListItem> = jobListItemObject;

// --- Detail ---------------------------------------------------------------

/** Job ids are UUIDs; anything else can't be a job. */
export const jobIdSchema: z.ZodType<string> = z.uuid();

export interface JobDetail extends JobListItem {
  description: string | null;
  /** Link to the original posting. */
  sourceUrl: string;
}

export const jobDetailSchema: z.ZodType<JobDetail> = jobListItemObject.extend({
  description: z.string().nullable(),
  // Rendered as a link, so only web URLs (no `javascript:` and the like).
  sourceUrl: z.url({ protocol: /^https?$/ }),
});

// --- List response --------------------------------------------------------

export interface JobsListResponse {
  items: JobListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const jobsListResponseSchema: z.ZodType<JobsListResponse> = z.object({
  items: z.array(jobListItemSchema),
  total: z.number().int().min(0),
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
  totalPages: z.number().int().min(0),
});

// --- Query ----------------------------------------------------------------

/** Every filter is optional; values within one filter are OR-ed. */
export interface JobsQuery {
  workplaceType?: RemotePreference[] | undefined;
  employmentType?: EmploymentType[] | undefined;
  locationId?: string[] | undefined;
  /** Skill slugs. */
  skill?: string[] | undefined;
  postedWithinDays?: number | undefined;
  /** Only jobs the current user has saved. */
  saved?: boolean | undefined;
  sort: JobSort;
  page: number;
  limit: number;
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
  skill: queryArray(slugSchema),
  postedWithinDays: z.coerce.number().int().min(1).max(365).optional(),
  saved: z.stringbool().optional(),
  sort: jobSortSchema.default('newest'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(MAX_JOBS_LIMIT)
    .default(DEFAULT_JOBS_LIMIT),
});

// --- Preview --------------------------------------------------------------

/** Jobs a prospect (not logged in) sees before signing up. */
export const JOBS_PREVIEW_LIMIT = 7;

/**
 * The skills a prospect can filter by: a fixed list, so the lookup endpoints
 * stay behind the login. Slugs from the seeded skills.
 */
export const PREVIEW_SKILLS = [
  'typescript',
  'javascript',
  'python',
  'java',
  'csharp',
  'go',
  'sql',
  'react',
  'next-js',
  'angular',
  'vue-js',
  'node-js',
  'docker',
  'kubernetes',
  'aws',
] as const;
export type PreviewSkill = (typeof PREVIEW_SKILLS)[number];

export const PREVIEW_SKILL_LABELS: Record<PreviewSkill, string> = {
  typescript: 'TypeScript',
  javascript: 'JavaScript',
  python: 'Python',
  java: 'Java',
  csharp: 'C#',
  go: 'Go',
  sql: 'SQL',
  react: 'React',
  'next-js': 'Next.js',
  angular: 'Angular',
  'vue-js': 'Vue.js',
  'node-js': 'Node.js',
  docker: 'Docker',
  kubernetes: 'Kubernetes',
  aws: 'AWS',
};

/**
 * The locations a prospect can filter by, as seeded city names: location ids
 * are generated per database, so they can't be hardcoded.
 */
export const PREVIEW_CITIES = [
  'Berlin',
  'Munich',
  'Hamburg',
  'Frankfurt am Main',
  'Cologne',
] as const;
export type PreviewCity = (typeof PREVIEW_CITIES)[number];

/** Both filters are optional; values within one filter are OR-ed. */
export interface JobsPreviewQuery {
  skill?: PreviewSkill[] | undefined;
  city?: PreviewCity[] | undefined;
}

export const jobsPreviewQuerySchema: z.ZodType<JobsPreviewQuery> = z.object({
  skill: queryArray(z.enum(PREVIEW_SKILLS)),
  city: queryArray(z.enum(PREVIEW_CITIES)),
});

/**
 * The newest matching jobs, at most `JOBS_PREVIEW_LIMIT`. Items have
 * `isSaved: false` and `match: null`.
 */
export interface JobsPreviewResponse {
  items: JobListItem[];
  /** All matching jobs, to show how many more there are. */
  total: number;
}

export const jobsPreviewResponseSchema: z.ZodType<JobsPreviewResponse> =
  z.object({
    items: z.array(jobListItemSchema).max(JOBS_PREVIEW_LIMIT),
    total: z.number().int().min(0),
  });

// --- Job matches ----------------------------------------------------------

/** Summary of one run that calculates every user's job matches. */
export interface JobMatchSummary {
  /** Users with at least one stored match. */
  users: number;
  /** Active jobs that were scored. */
  jobs: number;
  /** Stored user–job matches. */
  matches: number;
  calculatedAt: string;
}

export const jobMatchSummarySchema: z.ZodType<JobMatchSummary> = z.object({
  users: z.number().int().min(0),
  jobs: z.number().int().min(0),
  matches: z.number().int().min(0),
  calculatedAt: z.iso.datetime(),
});
