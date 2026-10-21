import {
  DEFAULT_JOBS_LIMIT,
  type JobsQuery,
  jobsQuerySchema,
} from '@job-scraper/shared';

import { SEARCH_HREF } from '@/lib/routes';

export type RawSearchParams = Record<string, string | string[] | undefined>;

const ARRAY_KEYS = [
  'workplaceType',
  'employmentType',
  'locationId',
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

export type PageWindowItem = number | 'ellipsis';

/** Pages shown on each side of the current one. */
const PAGE_SIBLINGS = 1;

/**
 * Page numbers to show: first, last, and the current page with its
 * neighbours; longer gaps become an ellipsis. Page 6 of 20 gives
 * `[1, 'ellipsis', 5, 6, 7, 'ellipsis', 20]`.
 */
export function getPageWindow(
  page: number,
  totalPages: number,
): PageWindowItem[] {
  if (totalPages < 1) {
    return [];
  }
  const pages = new Set([1, totalPages]);
  for (let near = page - PAGE_SIBLINGS; near <= page + PAGE_SIBLINGS; near++) {
    if (near >= 1 && near <= totalPages) {
      pages.add(near);
    }
  }

  const items: PageWindowItem[] = [];
  let previous = 0;
  for (const current of [...pages].sort((a, b) => a - b)) {
    if (current - previous === 2) {
      // A gap of one page shows that page instead of an ellipsis.
      items.push(previous + 1);
    } else if (current - previous > 2) {
      items.push('ellipsis');
    }
    items.push(current);
    previous = current;
  }
  return items;
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
