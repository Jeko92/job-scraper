import {
  DEFAULT_JOBS_LIMIT,
  type JobsQuery,
  jobsQuerySchema,
} from '@job-scraper/shared';

export type RawSearchParams = Record<string, string | string[] | undefined>;

const ARRAY_KEYS = [
  'workplaceType',
  'employmentType',
  'locationId',
  'industry',
  'skill',
] as const satisfies readonly (keyof JobsQuery)[];

/** Invalid search params fall back to the default query. */
export function parseJobsQuery(params: RawSearchParams): JobsQuery {
  const parsed = jobsQuerySchema.safeParse(params);
  return parsed.success ? parsed.data : jobsQuerySchema.parse({});
}

/** Repeats keys for arrays and leaves out defaults. */
export function toJobsSearchParams(query: JobsQuery): URLSearchParams {
  const params = new URLSearchParams();
  for (const key of ARRAY_KEYS) {
    for (const value of query[key] ?? []) {
      params.append(key, value);
    }
  }
  if (query.postedWithinDays !== undefined) {
    params.set('postedWithinDays', String(query.postedWithinDays));
  }
  if (query.salaryMin !== undefined) {
    params.set('salaryMin', String(query.salaryMin));
  }
  if (query.sort !== 'newest') {
    params.set('sort', query.sort);
  }
  if (query.limit !== DEFAULT_JOBS_LIMIT) {
    params.set('limit', String(query.limit));
  }
  if (query.cursor !== undefined) {
    params.set('cursor', query.cursor);
  }
  return params;
}

/** Adds the value, or removes it when present; an empty list becomes undefined. */
export function toggleValue<T>(
  values: T[] | undefined,
  value: T,
): T[] | undefined {
  const next = values?.includes(value)
    ? values.filter((item) => item !== value)
    : [...(values ?? []), value];
  return next.length > 0 ? next : undefined;
}
