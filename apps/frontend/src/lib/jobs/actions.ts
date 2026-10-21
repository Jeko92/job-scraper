'use server';

import {
  type JobListItem,
  type JobsQuery,
  jobsQuerySchema,
  locationsQuerySchema,
  skillsQuerySchema,
} from '@job-scraper/shared';

import { fetchJobsPage } from './api';
import {
  LOOKUP_SEARCH_LIMIT,
  type LookupOption,
  searchLocations,
  searchSkills,
  toLocationOption,
} from './lookups';

export type LoadMoreJobsResult =
  { items: JobListItem[]; nextCursor: string | null } | { error: string };

export async function loadMoreJobs(
  query: JobsQuery,
  cursor: string,
): Promise<LoadMoreJobsResult> {
  const parsed = jobsQuerySchema.safeParse({ ...query, cursor });
  if (!parsed.success) {
    return { error: 'This search is not valid.' };
  }

  try {
    const page = await fetchJobsPage(parsed.data);
    return { items: page.items, nextCursor: page.nextCursor };
  } catch {
    return { error: 'Could not load more jobs. Please try again.' };
  }
}

export type LookupSearchResult =
  { options: LookupOption[] } | { error: string };

export async function searchJobSkills(
  search: string,
): Promise<LookupSearchResult> {
  const parsed = skillsQuerySchema.safeParse({
    search,
    limit: LOOKUP_SEARCH_LIMIT,
  });
  if (!parsed.success || parsed.data.search === undefined) {
    return { options: [] };
  }

  try {
    const skills = await searchSkills(parsed.data.search);
    return {
      options: skills.map((skill) => ({
        value: skill.slug,
        label: skill.name,
      })),
    };
  } catch {
    return { error: 'Could not search skills. Please try again.' };
  }
}

export async function searchJobLocations(
  search: string,
): Promise<LookupSearchResult> {
  const parsed = locationsQuerySchema.safeParse({
    search,
    limit: LOOKUP_SEARCH_LIMIT,
  });
  if (!parsed.success || parsed.data.search === undefined) {
    return { options: [] };
  }

  try {
    const locations = await searchLocations(parsed.data.search);
    return { options: locations.map(toLocationOption) };
  } catch {
    return { error: 'Could not search locations. Please try again.' };
  }
}
