'use server';

import {
  type JobListItem,
  type JobsQuery,
  jobsQuerySchema,
} from '@job-scraper/shared';

import { fetchJobsPage } from './api';

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
