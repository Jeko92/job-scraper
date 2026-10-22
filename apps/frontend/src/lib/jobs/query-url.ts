import {
  DEFAULT_JOBS_LIMIT,
  type JobsQuery,
  jobsQuerySchema,
} from '@job-scraper/shared';

import { SEARCH_HREF } from '@/lib/routes';

import { LIST_FILTER_KEYS } from './query-filters';

export type RawSearchParams = Record<string, string | string[] | undefined>;

/**
 * Invalid search params are dropped one by one, so e.g. too many skills in a
 * shared link only removes the skill filter and keeps the others.
 */
export function parseJobsQuery(params: RawSearchParams): JobsQuery {
  const parsed = jobsQuerySchema.safeParse(params);
  if (parsed.success) {
    return parsed.data;
  }
  const invalidKeys = new Set(
    parsed.error.issues.map((issue) => issue.path[0]),
  );
  const validParams = Object.fromEntries(
    Object.entries(params).filter(([key]) => !invalidKeys.has(key)),
  );
  const retried = jobsQuerySchema.safeParse(validParams);
  return retried.success ? retried.data : jobsQuerySchema.parse({});
}

/** Repeats keys for arrays and leaves out defaults. */
export function toJobsSearchParams(query: JobsQuery): URLSearchParams {
  const params = new URLSearchParams();
  for (const key of LIST_FILTER_KEYS) {
    for (const value of query[key] ?? []) {
      params.append(key, value);
    }
  }
  if (query.postedWithinDays !== undefined) {
    params.set('postedWithinDays', String(query.postedWithinDays));
  }
  if (query.sort !== 'newest') {
    params.set('sort', query.sort);
  }
  if (query.limit !== DEFAULT_JOBS_LIMIT) {
    params.set('limit', String(query.limit));
  }
  if (query.page !== 1) {
    params.set('page', String(query.page));
  }
  return params;
}

/** Link to one page of the current search, e.g. `/search?skill=react&page=3`. */
export function jobsPageHref(query: JobsQuery, page: number): string {
  const qs = toJobsSearchParams({ ...query, page }).toString();
  return qs === '' ? SEARCH_HREF : `${SEARCH_HREF}?${qs}`;
}
