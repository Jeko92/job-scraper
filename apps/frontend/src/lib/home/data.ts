import {
  type JobListItem,
  MAX_JOBS_LIMIT,
  type UserStats,
  userStatsSchema,
} from '@job-scraper/shared';
import { cache } from 'react';

import { getParsedFromBackend } from '@/lib/backend';
import { getHomeJobsLimit } from '@/lib/env';
import { fetchJobsPage } from '@/lib/jobs/api';

const DEFAULT_HOME_JOBS_LIMIT = 6;

export function getSavedJobs(): Promise<JobListItem[]> {
  return Promise.resolve([]);
}

export async function getLatestJobs(): Promise<JobListItem[] | null> {
  try {
    const page = await fetchJobsPage({
      sort: 'newest',
      page: 1,
      limit: Math.min(
        getHomeJobsLimit() ?? DEFAULT_HOME_JOBS_LIMIT,
        MAX_JOBS_LIMIT,
      ),
    });
    return page.items;
  } catch {
    return null;
  }
}

export const getUserStats = cache((): Promise<UserStats | null> =>
  getParsedFromBackend('/users/me/stats', userStatsSchema),
);
