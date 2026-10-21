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
  'skill',
] as const satisfies readonly (keyof JobsQuery)[];

/**
 * Invalid search params fall back to the default query. The page always
 * starts at 1: further pages are loaded in the browser with "Load more".
 */
export function parseJobsQuery(params: RawSearchParams): JobsQuery {
  const parsed = jobsQuerySchema.safeParse(params);
  const query = parsed.success ? parsed.data : jobsQuerySchema.parse({});
  return { ...query, page: 1 };
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

export const MAX_SKILLS = 10;

/** Appends the skill slug, unless it is already there or the list is full. */
export function addSkill(query: JobsQuery, slug: string): JobsQuery {
  const skills = query.skill ?? [];
  if (skills.includes(slug) || skills.length >= MAX_SKILLS) {
    return query;
  }
  return { ...query, skill: [...skills, slug] };
}

/** Removes the skill slug; the last one removed drops `skill` from the URL. */
export function removeSkill(query: JobsQuery, slug: string): JobsQuery {
  const skills = (query.skill ?? []).filter((item) => item !== slug);
  return { ...query, skill: skills.length > 0 ? skills : undefined };
}

export const MAX_LOCATIONS = 5;

/** Appends the location id, unless it is already there or the list is full. */
export function addLocation(query: JobsQuery, id: string): JobsQuery {
  const locations = query.locationId ?? [];
  if (locations.includes(id) || locations.length >= MAX_LOCATIONS) {
    return query;
  }
  return { ...query, locationId: [...locations, id] };
}

/** Removes the location id; the last one removed drops `locationId` from the URL. */
export function removeLocation(query: JobsQuery, id: string): JobsQuery {
  const locations = (query.locationId ?? []).filter((item) => item !== id);
  return {
    ...query,
    locationId: locations.length > 0 ? locations : undefined,
  };
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
